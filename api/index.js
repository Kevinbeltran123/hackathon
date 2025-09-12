
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import db from './db.js';
import { distanceMeters, withinWindow, scoreActivity } from './utils.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import qrcode from 'qrcode';
import fs from 'fs';
import path from 'path';

// Import new services
import { geocodeAddress, reverseGeocode, validateLocation, searchPlacesByCategory, cleanExpiredCache } from './services/geocoding.js';
import { getRouteData, calculateMultiPointRoute, optimizeRouteOrder, calculateWalkingTime } from './services/routing.js';
import { validateLocationMiddleware, enrichLocationMiddleware, checkVerificationStatusMiddleware, validateActivityLocationMiddleware } from './middleware/locationValidation.js';
import { processChatMessage, getChatStats, cleanChatCache } from './services/simpleChatService.js';
import { 
  initializeUserMissions, 
  getUserActiveMissions, 
  getUserBadges, 
  getUserStats,
  processCheckInForMissions,
  getMissionsSummary,
  getAllMissions
} from './services/missionsService.js';

// Load environment variables
dotenv.config();

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
  
  try {
    const ts = new Date().toISOString();
    
    // Insertar check-in
    db.prepare('INSERT INTO checkin (user_id, place_id, activity_id, ts) VALUES (?,?,?,?)')
      .run(user_id, place_id, activity_id||null, ts);
    
    // Procesar misiones
    const missionResult = processCheckInForMissions(user_id, place_id, activity_id);
    
    // Asegurar que el usuario tenga misiones inicializadas
    if (missionResult.success === false && missionResult.error === 'Place not found') {
      // Si falla por lugar no encontrado, solo enviar el check-in básico
      return res.json({ ok: true, ts });
    }
    
    res.json({ 
      ok: true, 
      ts,
      missions: missionResult.success ? {
        completed: missionResult.completedMissions || [],
        updated: missionResult.updatedMissions || [],
        unlocked: missionResult.unlockedMissions || []
      } : null
    });
    
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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

app.post('/api/me/activities', validateActivityLocationMiddleware, (req, res) => {
  const auth = req.headers.authorization || '';
  if (!auth.includes('demo')) return res.status(401).json({error:'no auth'});
  const { place_id, title, duration, time_start, time_end, capacity, active, benefit_text } = req.body || {};
  const info = db.prepare(`
    INSERT INTO micro_activity (place_id, title, duration, time_start, time_end, capacity, active, benefit_text)
    VALUES (?,?,?,?,?,?,?,?)
  `).run(place_id, title, duration, time_start, time_end, capacity, active?1:0, benefit_text||null);
  res.json({ id: info.lastInsertRowid, verified_place: req.verifiedPlace?.name });
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

// === NEW LOCATION SERVICES ===

// Geocoding endpoints
app.get('/api/geocode', async (req, res) => {
  try {
    const { address } = req.query;
    if (!address) {
      return res.status(400).json({ error: 'Address parameter is required' });
    }

    const results = await geocodeAddress(address);
    res.json({ results, count: results.length });
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ error: 'Geocoding failed', details: error.message });
  }
});

app.get('/api/reverse-geocode', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude parameters are required' });
    }

    const result = await reverseGeocode(parseFloat(lat), parseFloat(lng));
    res.json(result);
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    res.status(500).json({ error: 'Reverse geocoding failed', details: error.message });
  }
});

// Location validation
app.post('/api/validate-location', async (req, res) => {
  try {
    const { name, lat, lng } = req.body;
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const validation = await validateLocation(name, parseFloat(lat), parseFloat(lng));
    res.json(validation);
  } catch (error) {
    console.error('Location validation error:', error);
    res.status(500).json({ error: 'Location validation failed', details: error.message });
  }
});

// Search places by category
app.get('/api/search-places', async (req, res) => {
  try {
    const { category, limit } = req.query;
    if (!category) {
      return res.status(400).json({ error: 'Category parameter is required' });
    }

    const results = await searchPlacesByCategory(category, parseInt(limit) || 20);
    res.json({ results, category, count: results.length });
  } catch (error) {
    console.error('Place search error:', error);
    res.status(500).json({ error: 'Place search failed', details: error.message });
  }
});

// Enhanced places endpoint with real location verification
app.post('/api/places', validateLocationMiddleware, enrichLocationMiddleware, (req, res) => {
  try {
    const { name, lat, lng, barrio, tags, base_duration, price_level, rating } = req.body;
    const enrichedData = req.body.enrichedData || {};

    const stmt = db.prepare(`
      INSERT INTO place (
        name, lat, lng, barrio, tags, base_duration, price_level, rating,
        address, google_place_id, osm_id, verified, verification_source, last_verified, business_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      name,
      parseFloat(lat),
      parseFloat(lng),
      barrio || null,
      tags || null,
      base_duration || 30,
      price_level || 1,
      rating || 4.3,
      enrichedData.verified_address || null,
      enrichedData.google_place_id || null,
      enrichedData.osm_id || null,
      req.locationValidation?.valid ? 1 : 0,
      enrichedData.verification_source || null,
      enrichedData.verified_at || null,
      enrichedData.business_type || null
    );

    res.json({ 
      id: info.lastInsertRowid, 
      verified: req.locationValidation?.valid || false,
      verification_source: enrichedData.verification_source 
    });
  } catch (error) {
    console.error('Place creation error:', error);
    res.status(500).json({ error: 'Failed to create place', details: error.message });
  }
});

// Route calculation endpoints
app.get('/api/route', async (req, res) => {
  try {
    const { from_lat, from_lng, to_lat, to_lng, mode } = req.query;
    
    if (!from_lat || !from_lng || !to_lat || !to_lng) {
      return res.status(400).json({ error: 'All coordinate parameters are required' });
    }

    const routeData = await getRouteData(
      parseFloat(from_lat),
      parseFloat(from_lng),
      parseFloat(to_lat),
      parseFloat(to_lng),
      mode || 'walking'
    );

    res.json(routeData);
  } catch (error) {
    console.error('Route calculation error:', error);
    res.status(500).json({ error: 'Route calculation failed', details: error.message });
  }
});

// Multi-point route optimization
app.post('/api/optimize-route', async (req, res) => {
  try {
    const { waypoints, mode } = req.body;
    
    if (!waypoints || !Array.isArray(waypoints) || waypoints.length < 2) {
      return res.status(400).json({ error: 'At least 2 waypoints are required' });
    }

    // Validate waypoint format
    for (const wp of waypoints) {
      if (!wp.lat || !wp.lng) {
        return res.status(400).json({ error: 'Each waypoint must have lat and lng properties' });
      }
    }

    const startPoint = waypoints[0];
    const destinations = waypoints.slice(1);
    
    // Optimize order
    const optimizedOrder = optimizeRouteOrder(startPoint, destinations);
    const fullRoute = [startPoint, ...optimizedOrder];
    
    // Calculate route details
    const routeDetails = await calculateMultiPointRoute(fullRoute, mode || 'walking');

    res.json({
      original_waypoints: waypoints,
      optimized_waypoints: fullRoute,
      route_details: routeDetails,
      optimization_savings: {
        original_order_estimate: waypoints.length * 10, // Rough estimate
        optimized_duration: routeDetails.totalDuration
      }
    });
  } catch (error) {
    console.error('Route optimization error:', error);
    res.status(500).json({ error: 'Route optimization failed', details: error.message });
  }
});

// Get nearby verified places
app.get('/api/nearby-verified', checkVerificationStatusMiddleware, (req, res) => {
  try {
    const { lat, lng, radius = 2000, verified_only = 'true' } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const centerLat = parseFloat(lat);
    const centerLng = parseFloat(lng);
    const maxRadius = parseInt(radius);

    let query = 'SELECT * FROM place';
    let params = [];

    if (verified_only === 'true') {
      query += ' WHERE verified = 1';
    }

    const places = db.prepare(query).all(...params);
    
    // Filter by distance and add distance info
    const nearby = places
      .map(place => ({
        ...place,
        distance: distanceMeters({ lat: centerLat, lng: centerLng }, { lat: place.lat, lng: place.lng }),
        walking_time: calculateWalkingTime(centerLat, centerLng, place.lat, place.lng)
      }))
      .filter(place => place.distance <= maxRadius)
      .sort((a, b) => a.distance - b.distance);

    res.json({
      center: { lat: centerLat, lng: centerLng },
      radius: maxRadius,
      verified_only: verified_only === 'true',
      count: nearby.length,
      places: nearby.slice(0, 50) // Limit results
    });
  } catch (error) {
    console.error('Nearby places error:', error);
    res.status(500).json({ error: 'Failed to get nearby places', details: error.message });
  }
});

// === CHAT ENDPOINTS ===

// Main chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId, lat, lng, activeRoute } = req.body;
    
    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build context
    const context = {
      userId: userId || `user_${Date.now()}`,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      activeRoute: activeRoute || []
    };

    const result = await processChatMessage(message, context);
    res.json(result);

  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Lo siento, tengo problemas técnicos. ¿Te gustaría que te recomiende algunos lugares emblemáticos de Ibagué mientras se soluciona? 😊',
      error: error.message
    });
  }
});

// Chat statistics endpoint
app.get('/api/admin/chat-stats', (req, res) => {
  try {
    const stats = getChatStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get chat stats', details: error.message });
  }
});

// System maintenance endpoints
app.post('/api/admin/clean-cache', (req, res) => {
  try {
    cleanExpiredCache();
    cleanChatCache();
    res.json({ message: 'All caches cleaned successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clean cache', details: error.message });
  }
});

app.get('/api/admin/verification-stats', (req, res) => {
  try {
    const stats = {
      total_places: db.prepare('SELECT COUNT(*) as count FROM place').get().count,
      verified_places: db.prepare('SELECT COUNT(*) as count FROM place WHERE verified = 1').get().count,
      unverified_places: db.prepare('SELECT COUNT(*) as count FROM place WHERE verified = 0').get().count,
      cache_entries: db.prepare('SELECT COUNT(*) as count FROM location_cache').get().count
    };

    const verification_sources = db.prepare(`
      SELECT verification_source, COUNT(*) as count 
      FROM place 
      WHERE verified = 1 AND verification_source IS NOT NULL 
      GROUP BY verification_source
    `).all();

    res.json({ stats, verification_sources });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats', details: error.message });
  }
});

// === MISSIONS SYSTEM ENDPOINTS ===

// Initialize user missions (called on first app load)
app.post('/api/user/:userId/missions/init', (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = initializeUserMissions(userId);
    res.json(result);
  } catch (error) {
    console.error('Error initializing user missions:', error);
    res.status(500).json({ error: 'Failed to initialize missions' });
  }
});

// Get user active missions
app.get('/api/user/:userId/missions', (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = getUserActiveMissions(userId);
    res.json(result);
  } catch (error) {
    console.error('Error getting user missions:', error);
    res.status(500).json({ error: 'Failed to get missions' });
  }
});

// Get user badges/achievements
app.get('/api/user/:userId/badges', (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = getUserBadges(userId);
    res.json(result);
  } catch (error) {
    console.error('Error getting user badges:', error);
    res.status(500).json({ error: 'Failed to get badges' });
  }
});

// Get user stats
app.get('/api/user/:userId/stats', (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = getUserStats(userId);
    res.json(result);
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Get missions summary for header
app.get('/api/user/:userId/missions/summary', (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = getMissionsSummary(userId);
    res.json(result);
  } catch (error) {
    console.error('Error getting missions summary:', error);
    res.status(500).json({ error: 'Failed to get missions summary' });
  }
});

// Get all available missions (admin/demo)
app.get('/api/admin/missions', (req, res) => {
  try {
    const result = getAllMissions();
    res.json(result);
  } catch (error) {
    console.error('Error getting all missions:', error);
    res.status(500).json({ error: 'Failed to get all missions' });
  }
});

// Manual mission progress trigger (for testing)
app.post('/api/user/:userId/missions/trigger', (req, res) => {
  try {
    const { userId } = req.params;
    const { placeId, activityId } = req.body;
    
    if (!userId || !placeId) {
      return res.status(400).json({ error: 'User ID and Place ID are required' });
    }

    const result = processCheckInForMissions(userId, placeId, activityId);
    res.json(result);
  } catch (error) {
    console.error('Error triggering mission progress:', error);
    res.status(500).json({ error: 'Failed to trigger mission progress' });
  }
});

// Health
app.get('/api/health', (req, res) => res.json({ ok:true }));

app.listen(PORT, () => {
  console.log(`[API] Listening on http://localhost:${PORT}`);
});
