
import express from 'express';
import cors from 'cors';
import db from './db.js';
import { distanceMeters, withinWindow, scoreActivity } from './utils.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import qrcode from 'qrcode';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

function parseTags(tagsStr) {
  return (tagsStr || '').split(',').map(s => s.trim()).filter(Boolean);
}

app.get('/api/places', (req, res) => {
  const { lat, lng, tags, radius = 1500 } = req.query;
  const rows = db.prepare('SELECT * FROM place').all();
  const list = rows.map(r => ({
    ...r,
    tags: parseTags(r.tags)
  }));
  let filtered = list;
  if (tags) {
    const set = new Set(tags.split(','));
    filtered = filtered.filter(p => p.tags.some(t => set.has(t)));
  }
  if (lat && lng) {
    const p = { lat: parseFloat(lat), lng: parseFloat(lng) };
    filtered = filtered
      .map(x => ({...x, distance: distanceMeters(p, {lat:x.lat,lng:x.lng})}))
      .filter(x => x.distance <= Number(radius))
      .sort((a,b) => a.distance - b.distance);
  }
  res.json(filtered.slice(0, 50));
});

app.get('/api/activities', (req, res) => {
  const { lat, lng, tags, time_left = 120 } = req.query;
  const now = new Date();
  const nowMin = now.getHours()*60 + now.getMinutes();
  const acts = db.prepare(`
    SELECT a.*, p.name as place_name, p.lat, p.lng, p.tags, p.rating
    FROM micro_activity a
    JOIN place p ON p.id = a.place_id
    WHERE a.active = 1
  `).all().map(r => ({...r, tags: parseTags(r.tags)}));

  let filtered = acts;
  if (tags) {
    const set = new Set(tags.split(','));
    filtered = filtered.filter(x => x.tags.some(t => set.has(t)));
  }
  if (lat && lng) {
    const p = { lat: parseFloat(lat), lng: parseFloat(lng) };
    filtered = filtered.map(x => {
      const detourM = distanceMeters(p, {lat:x.lat, lng:x.lng});
      return {...x, detourM};
    }).filter(x => x.detourM <= 1200); // <= ~10-15 min a pie
  }

  filtered = filtered.filter(x => withinWindow(nowMin, x.time_start, x.time_end) && (x.duration <= Number(time_left)));

  // Simple affinity (overlap tags)
  const prefTags = new Set((req.query.pref_tags || '').split(',').filter(Boolean));
  const benefitWeight = (txt) => txt ? 1.0 : 0.0;

  const scored = filtered.map(x => {
    const overlap = [...prefTags].filter(t => x.tags.includes(t)).length;
    const affinity = prefTags.size ? Math.min(1, overlap / prefTags.size) : 0.5;
    const extraMin = x.duration; // walking time simplification handled by detour
    const sc = scoreActivity({affinity, rating:x.rating, benefitWeight:benefitWeight(x.benefit_text), detourM:x.detourM||0, extraMin});
    return {...x, score: sc};
  }).sort((a,b) => b.score - a.score);

  res.json(scored.slice(0, 8));
});

app.post('/api/checkins', (req, res) => {
  const { user_id, place_id, activity_id } = req.body || {};
  if (!user_id || !place_id) return res.status(400).json({error:'missing fields'});
  const ts = new Date().toISOString();
  db.prepare('INSERT INTO checkin (user_id, place_id, activity_id, ts) VALUES (?,?,?,?)')
    .run(user_id, place_id, activity_id||null, ts);
  res.json({ ok: true, ts });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const row = db.prepare('SELECT * FROM merchant WHERE email = ?').get(email);
  if (!row || row.password_hash !== password) return res.status(401).json({error:'credenciales'});
  // token demo
  res.json({ token: 'demo', merchant: { id: row.id, place_id: row.place_id, email: row.email }});
});

app.get('/api/me/activities', (req, res) => {
  const auth = req.headers.authorization || '';
  if (!auth.includes('demo')) return res.status(401).json({error:'no auth'});
  const place_id = Number(req.query.place_id);
  const list = db.prepare('SELECT * FROM micro_activity WHERE place_id = ? ORDER BY id DESC').all(place_id);
  res.json(list);
});

app.post('/api/me/activities', (req, res) => {
  const auth = req.headers.authorization || '';
  if (!auth.includes('demo')) return res.status(401).json({error:'no auth'});
  const { place_id, title, duration, time_start, time_end, capacity, active, benefit_text } = req.body || {};
  const info = db.prepare(`
    INSERT INTO micro_activity (place_id, title, duration, time_start, time_end, capacity, active, benefit_text)
    VALUES (?,?,?,?,?,?,?,?)
  `).run(place_id, title, duration, time_start, time_end, capacity, active?1:0, benefit_text||null);
  res.json({ id: info.lastInsertRowid });
});

app.patch('/api/me/activities/:id/toggle', (req, res) => {
  const auth = req.headers.authorization || '';
  if (!auth.includes('demo')) return res.status(401).json({error:'no auth'});
  const id = Number(req.params.id);
  const row = db.prepare('SELECT active FROM micro_activity WHERE id = ?').get(id);
  if (!row) return res.status(404).json({error:'not found'});
  const newVal = row.active ? 0 : 1;
  db.prepare('UPDATE micro_activity SET active = ? WHERE id = ?').run(newVal, id);
  res.json({ id, active: newVal });
});

app.get('/api/activity/:id', (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare(`
    SELECT a.*, p.name as place_name, p.lat, p.lng, p.barrio, p.tags, p.rating
    FROM micro_activity a JOIN place p ON p.id=a.place_id WHERE a.id=?
  `).get(id);
  if (!row) return res.status(404).json({error:'not found'});
  res.json(row);
});

// Agency verification system
// In-memory agencies database (in production, use a real database)
const agencies = [];

// Generate a unique certificate
function generateCertificate() {
  return crypto.randomBytes(32).toString('hex');
}

// Agency registration endpoint
app.post('/api/agencies/register', (req, res) => {
  try {
    const { nombre, nit, rnt } = req.body;
    
    if (!nombre || !nit || !rnt) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: nombre, nit, rnt' });
    }
    
    // Check if agency with same NIT already exists
    const existingAgency = agencies.find(a => a.nit === nit);
    if (existingAgency) {
      return res.status(409).json({ error: 'Ya existe una agencia registrada con este NIT' });
    }
    
    // Create new agency
    const agencyId = uuidv4();
    const certificado = generateCertificate();
    
    const newAgency = {
      id: agencyId,
      nombre,
      nit,
      rnt,
      certificado,
      estado: 'verificada',
      fecha_registro: new Date().toISOString()
    };
    
    agencies.push(newAgency);
    
    // Generate QR code
    const verificationUrl = `http://localhost:5173/agencies/verify/${agencyId}`;
    
    qrcode.toDataURL(verificationUrl, (err, qrDataUrl) => {
      if (err) {
        console.error('Error generating QR:', err);
      }
      
      res.status(201).json({
        mensaje: 'Agencia registrada exitosamente',
        id: agencyId,
        nombre,
        nit,
        rnt,
        certificado,
        estado: 'verificada',
        qr_url: qrDataUrl,
        verification_url: verificationUrl
      });
    });
    
  } catch (error) {
    console.error('Error registering agency:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Agency verification endpoint
app.get('/api/agencies/verify/:id', (req, res) => {
  try {
    const { id } = req.params;
    const agency = agencies.find(a => a.id === id);
    
    if (!agency) {
      return res.status(404).json({ error: 'Agencia no encontrada' });
    }
    
    res.json(agency);
    
  } catch (error) {
    console.error('Error verifying agency:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// List all agencies (for testing)
app.get('/api/agencies', (req, res) => {
  res.json({
    total: agencies.length,
    agencies: agencies.map(a => ({
      id: a.id,
      nombre: a.nombre,
      nit: a.nit,
      rnt: a.rnt,
      estado: a.estado,
      fecha_registro: a.fecha_registro
    }))
  });
});

// Health
app.get('/api/health', (req, res) => res.json({ ok:true }));

app.listen(PORT, () => {
  console.log(`[API] Listening on http://localhost:${PORT}`);
});
