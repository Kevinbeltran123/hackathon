
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
import { enhancedPlacesService } from './services/enhancedPlacesService.js';

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
  console.log(`API /places returning ${filtered.length} places`);
  res.json(filtered.slice(0, 50));
});

app.get('/api/activities', (req, res) => {
  const { lat, lng, tags, time_left = 120, user_id } = req.query;
  const now = new Date();
  const nowMin = now.getHours()*60 + now.getMinutes();
  
  // Get user preferences if user_id provided
  let userPreferences = null;
  if (user_id) {
    const prefs = db.prepare('SELECT * FROM user_preferences WHERE id = ?').get(user_id);
    if (prefs) {
      userPreferences = {
        ...prefs,
        interests: prefs.interests ? JSON.parse(prefs.interests) : []
      };
    }
  }
  
  const acts = db.prepare(`
    SELECT a.*, p.name as place_name, p.lat, p.lng, p.tags, p.rating
    FROM micro_activity a
    JOIN place p ON p.id = a.place_id
    WHERE a.active = 1
  `).all().map(r => ({...r, tags: parseTags(r.tags)}));

  let filtered = acts;
  
  // Use user preferences if available, otherwise use request parameters
  const effectiveTags = userPreferences?.interests?.length > 0 ? userPreferences.interests : (tags ? tags.split(',') : []);
  
  if (effectiveTags.length > 0) {
    const set = new Set(effectiveTags);
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

  // Simple affinity (overlap tags) - FIX: Use && instead of and
  const prefTags = new Set(effectiveTags.filter(Boolean));
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

// User preferences endpoint - PUT /preferences/:id
app.put('/api/preferences/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { interests, budget_min, budget_max, time_start, time_end } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Validate interests array
    if (interests && (!Array.isArray(interests) || interests.length === 0)) {
      return res.status(400).json({ error: 'At least one interest must be selected' });
    }
    
    // Validate budget range
    if (budget_min !== undefined && budget_max !== undefined && budget_min > budget_max) {
      return res.status(400).json({ error: 'Minimum budget cannot be greater than maximum budget' });
    }
    
    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (time_start && !timeRegex.test(time_start)) {
      return res.status(400).json({ error: 'time_start must be in HH:MM format' });
    }
    if (time_end && !timeRegex.test(time_end)) {
      return res.status(400).json({ error: 'time_end must be in HH:MM format' });
    }
    
    // Upsert user preferences
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO user_preferences 
      (id, interests, budget_min, budget_max, time_start, time_end, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    
    const result = stmt.run(
      id,
      interests ? JSON.stringify(interests) : null,
      budget_min || null,
      budget_max || null,
      time_start || null,
      time_end || null
    );
    
    res.json({ 
      success: true, 
      id,
      preferences: {
        interests,
        budget_min,
        budget_max,
        time_start,
        time_end
      }
    });
    
  } catch (error) {
    console.error('Error saving user preferences:', error);
    res.status(500).json({ error: 'Failed to save preferences', details: error.message });
  }
});

// Get user preferences endpoint
app.get('/api/preferences/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const preferences = db.prepare('SELECT * FROM user_preferences WHERE id = ?').get(id);
    
    if (!preferences) {
      return res.json({ 
        success: true, 
        preferences: null 
      });
    }
    
    // Parse interests JSON
    const parsedPreferences = {
      ...preferences,
      interests: preferences.interests ? JSON.parse(preferences.interests) : []
    };
    
    res.json({ 
      success: true, 
      preferences: parsedPreferences 
    });
    
  } catch (error) {
    console.error('Error getting user preferences:', error);
    res.status(500).json({ error: 'Failed to get preferences', details: error.message });
  }
});

// Enhanced places search using external APIs
app.post('/api/places/enhanced', async (req, res) => {
  try {
    const { interests = [], time = 3, radius = 2000, lat, lng, user_id } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const center = { lat: parseFloat(lat), lng: parseFloat(lng) };
    
    // Get user preferences if user_id provided
    let userPreferences = null;
    if (user_id) {
      const prefs = db.prepare('SELECT * FROM user_preferences WHERE id = ?').get(user_id);
      if (prefs) {
        userPreferences = {
          ...prefs,
          interests: prefs.interests ? JSON.parse(prefs.interests) : []
        };
      }
    }
    
    // Use user preferences if available, otherwise use request parameters
    const effectiveInterests = userPreferences?.interests?.length > 0 ? userPreferences.interests : interests;
    const effectiveTime = time;
    const effectiveRadius = radius;
    
    console.log('Enhanced search with interests:', effectiveInterests, 'radius:', effectiveRadius);
    
    // Use enhanced places service with external APIs
    const enhancedPlaces = await enhancedPlacesService.searchPlaces(
      center.lat, 
      center.lng, 
      effectiveRadius, 
      effectiveInterests, 
      effectiveTime
    );
    
    // Also get places from local database
    const localPlaces = db.prepare('SELECT * FROM place').all();
    const localPlacesWithTags = localPlaces.map(place => ({
      ...place,
      tags: parseTags(place.tags),
      distance: distanceMeters(center, { lat: place.lat, lng: place.lng })
    }));

    // Filter local places by interests and radius
    let filteredLocalPlaces = localPlacesWithTags;
    if (effectiveInterests.length > 0) {
      const interestSet = new Set(effectiveInterests);
      filteredLocalPlaces = localPlacesWithTags.filter(place => 
        place.tags.some(tag => interestSet.has(tag)) && place.distance <= effectiveRadius
      );
    } else {
      filteredLocalPlaces = localPlacesWithTags.filter(place => place.distance <= effectiveRadius);
    }

    // Combine enhanced and local places, removing duplicates
    const allPlaces = [...enhancedPlaces, ...filteredLocalPlaces];
    const uniquePlaces = allPlaces.filter((place, index, self) => 
      index === self.findIndex(p => 
        Math.abs(p.lat - place.lat) < 0.0001 && 
        Math.abs(p.lng - place.lng) < 0.0001 &&
        p.name === place.name
      )
    );

    // Sort by score and limit results
    const timeMultiplier = {
      1: 3,   // 1 hour -> max 3 places
      2: 5,   // 2 hours -> max 5 places
      3: 8,   // 3 hours -> max 8 places
      4: 12,  // 4 hours -> max 12 places
      8: 20   // Full day -> max 20 places
    };

    const maxPlaces = timeMultiplier[effectiveTime] || 8;
    const optimizedPlaces = uniquePlaces.slice(0, maxPlaces);

    // Calculate estimated total time
    const estimatedTime = optimizedPlaces.reduce((total, place) => {
      return total + (place.base_duration || 30); // Default 30 min if not specified
    }, 0);

    // Add walking time between places
    const walkingTime = optimizedPlaces.reduce((total, place, index) => {
      if (index === 0) return total;
      const prevPlace = optimizedPlaces[index - 1];
      const walkDistance = distanceMeters(
        { lat: prevPlace.lat, lng: prevPlace.lng },
        { lat: place.lat, lng: place.lng }
      );
      return total + Math.ceil(walkDistance / 100) * 2; // 2 min per 100m
    }, 0);

    const totalEstimatedTime = estimatedTime + walkingTime;
    
    // Calculate average distance from center
    const avgDistance = optimizedPlaces.length > 0 
      ? optimizedPlaces.reduce((sum, p) => sum + (p.distance || 0), 0) / optimizedPlaces.length / 1000
      : 0;

    res.json({
      places: optimizedPlaces,
      totalPlaces: optimizedPlaces.length,
      estimatedTime: totalEstimatedTime,
      avgDistance,
      filters: { interests: effectiveInterests, time: effectiveTime, radius: effectiveRadius },
      center,
      sources: {
        enhanced: enhancedPlaces.length,
        local: filteredLocalPlaces.length,
        total: uniquePlaces.length
      }
    });

  } catch (error) {
    console.error('Enhanced places search error:', error);
    res.status(500).json({ error: 'Enhanced search failed', details: error.message });
  }
});

// Advanced filtering endpoint with user preferences and fallback
app.post('/api/places/filtered', (req, res) => {
  try {
    const { interests = [], time = 3, radius = 2000, lat, lng, user_id } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const center = { lat: parseFloat(lat), lng: parseFloat(lng) };
    
    // Get user preferences if user_id provided
    let userPreferences = null;
    if (user_id) {
      const prefs = db.prepare('SELECT * FROM user_preferences WHERE id = ?').get(user_id);
      if (prefs) {
        userPreferences = {
          ...prefs,
          interests: prefs.interests ? JSON.parse(prefs.interests) : []
        };
      }
    }
    
    // Use user preferences if available, otherwise use request parameters
    const effectiveInterests = userPreferences?.interests?.length > 0 ? userPreferences.interests : interests;
    const effectiveTime = time;
    const effectiveRadius = radius;
    
    // Get all places from database
    const allPlaces = db.prepare('SELECT * FROM place').all();
    
    // Convert tags from string to array for each place
    const placesWithTags = allPlaces.map(place => ({
      ...place,
      tags: parseTags(place.tags)
    }));

    // Filter by interests (categories) - FIX: Use && instead of and
    let filteredPlaces = placesWithTags;
    if (effectiveInterests.length > 0) {
      const interestSet = new Set(effectiveInterests);
      filteredPlaces = placesWithTags.filter(place => 
        place.tags.some(tag => interestSet.has(tag))
      );
    }

    // Filter by radius
    filteredPlaces = filteredPlaces
      .map(place => ({
        ...place,
        distance: distanceMeters(center, { lat: place.lat, lng: place.lng })
      }))
      .filter(place => place.distance <= effectiveRadius);

    // Calculate scoring based on distance, rating, and relevance
    filteredPlaces = filteredPlaces.map(place => {
      let score = 0;
      
      // Distance score (closer is better, max 40 points)
      const distanceScore = Math.max(0, 40 - (place.distance / effectiveRadius) * 40);
      score += distanceScore;
      
      // Rating score (max 30 points)
      const ratingScore = ((place.rating || 4.0) / 5.0) * 30;
      score += ratingScore;
      
      // Interest relevance score (max 30 points)
      const matchingInterests = place.tags.filter(tag => effectiveInterests.includes(tag)).length;
      const relevanceScore = effectiveInterests.length > 0 ? (matchingInterests / effectiveInterests.length) * 30 : 15;
      score += relevanceScore;
      
      // Bonus for verified places
      if (place.verified) {
        score += 5;
      }

      return { ...place, score };
    });

    // Sort by score (highest first)
    filteredPlaces.sort((a, b) => b.score - a.score);

    // Optimize number of places based on available time
    const timeMultiplier = {
      1: 3,   // 1 hour -> max 3 places
      2: 5,   // 2 hours -> max 5 places
      3: 8,   // 3 hours -> max 8 places
      4: 12,  // 4 hours -> max 12 places
      8: 20   // Full day -> max 20 places
    };

    const maxPlaces = timeMultiplier[effectiveTime] || 8;
    
    // Ensure diversity of categories if possible
    let optimizedPlaces = diversifyPlaces(filteredPlaces.slice(0, maxPlaces * 2), effectiveInterests, maxPlaces);
    
    // FALLBACK LOGIC: If no places found, show nearby places with interests
    if (optimizedPlaces.length === 0) {
      console.log('No places found with filters, applying fallback logic');
      
      // Get all places within radius, sorted by distance
      const nearbyPlaces = allPlaces
        .map(place => ({
          ...place,
          tags: parseTags(place.tags),
          distance: distanceMeters(center, { lat: place.lat, lng: place.lng })
        }))
        .filter(place => place.distance <= effectiveRadius * 1.5) // Expand radius for fallback
        .sort((a, b) => a.distance - b.distance);
      
      // Try to find places that match at least one interest
      if (effectiveInterests.length > 0) {
        const interestSet = new Set(effectiveInterests);
        const matchingPlaces = nearbyPlaces.filter(place => 
          place.tags.some(tag => interestSet.has(tag))
        );
        
        if (matchingPlaces.length > 0) {
          optimizedPlaces = matchingPlaces.slice(0, Math.min(3, maxPlaces));
        }
      }
      
      // If still no places, get the most popular nearby places
      if (optimizedPlaces.length === 0) {
        optimizedPlaces = nearbyPlaces
          .sort((a, b) => (b.rating || 4.0) - (a.rating || 4.0)) // Sort by rating
          .slice(0, Math.min(3, maxPlaces));
      }
    }

    // Calculate estimated total time
    const estimatedTime = optimizedPlaces.reduce((total, place) => {
      return total + (place.base_duration || 30); // Default 30 min if not specified
    }, 0);

    // Add walking time between places (estimated 2 min per 100m)
    const walkingTime = optimizedPlaces.reduce((total, place, index) => {
      if (index === 0) return total;
      const prevPlace = optimizedPlaces[index - 1];
      const walkDistance = distanceMeters(
        { lat: prevPlace.lat, lng: prevPlace.lng },
        { lat: place.lat, lng: place.lng }
      );
      return total + Math.ceil(walkDistance / 100) * 2; // 2 min per 100m
    }, 0);

    const totalEstimatedTime = estimatedTime + walkingTime;
    
    // Calculate average distance from center
    const avgDistance = optimizedPlaces.length > 0 
      ? optimizedPlaces.reduce((sum, p) => sum + p.distance, 0) / optimizedPlaces.length / 1000
      : 0;

    res.json({
      places: optimizedPlaces,
      totalPlaces: optimizedPlaces.length,
      estimatedTime: totalEstimatedTime,
      avgDistance,
      filters: { interests: effectiveInterests, time: effectiveTime, radius: effectiveRadius },
      center,
      fallback: optimizedPlaces.length > 0 && filteredPlaces.length === 0 // Indicate if fallback was used
    });

  } catch (error) {
    console.error('Advanced filtering error:', error);
    res.status(500).json({ error: 'Filtering failed', details: error.message });
  }
});

// Helper function to diversify places by category
function diversifyPlaces(places, interests, maxPlaces) {
  if (places.length <= maxPlaces) return places;
  
  const result = [];
  const categoryCounts = {};
  const maxPerCategory = Math.ceil(maxPlaces / interests.length) || 2;
  
  // Initialize category counts
  interests.forEach(interest => {
    categoryCounts[interest] = 0;
  });
  
  // First pass: ensure at least one place per interest
  for (const place of places) {
    if (result.length >= maxPlaces) break;
    
    const placeInterests = place.tags.filter(tag => interests.includes(tag));
    const canAdd = placeInterests.some(interest => 
      categoryCounts[interest] < maxPerCategory
    );
    
    if (canAdd) {
      result.push(place);
      placeInterests.forEach(interest => {
        if (interests.includes(interest)) {
          categoryCounts[interest]++;
        }
      });
    }
  }
  
  // Second pass: fill remaining slots with highest scored places
  for (const place of places) {
    if (result.length >= maxPlaces) break;
    if (!result.find(p => p.id === place.id)) {
      result.push(place);
    }
  }
  
  return result.slice(0, maxPlaces);
}

// =================== COUPON SYSTEM API ===================

// Get all active coupons
app.get('/api/coupons', (req, res) => {
  try {
    const { place_id, lat, lng, radius = 5000 } = req.query;
    
    let query = `
      SELECT c.*
      FROM coupons c 
      WHERE c.is_active = 1 AND c.valid_until >= date('now')
    `;
    
    let params = [];
    
    if (place_id) {
      query += ' AND (c.place_id = ? OR c.place_id IS NULL)';
      params.push(place_id);
    }
    
    const coupons = db.prepare(query).all(...params);
    
    // Filter by location if coordinates provided
    let filteredCoupons = coupons;
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxRadius = parseInt(radius);
      
      filteredCoupons = coupons.filter(coupon => {
        if (!coupon.place_lat || !coupon.place_lng) {
          return true; // Universal coupons (no location restriction)
        }
        
        const distance = distanceMeters(
          { lat: userLat, lng: userLng },
          { lat: coupon.place_lat, lng: coupon.place_lng }
        );
        
        return distance <= maxRadius;
      });
    }
    
    // Add usage statistics
    const enrichedCoupons = filteredCoupons.map(coupon => {
      const usageCount = db.prepare('SELECT COUNT(*) as count FROM coupon_usage WHERE coupon_id = ?').get(coupon.id);
      
      return {
        ...coupon,
        current_usage: usageCount?.count || 0,
        is_available: (!coupon.usage_limit || (usageCount?.count || 0) < coupon.usage_limit)
      };
    });
    
    res.json(enrichedCoupons);
  } catch (error) {
    console.error('Coupon fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

// Get coupons for a specific place
app.get('/api/places/:placeId/coupons', (req, res) => {
  try {
    const { placeId } = req.params;
    
    const coupons = db.prepare(`
      SELECT c.*
      FROM coupons c 
      WHERE c.is_active = 1 
        AND c.valid_until >= date('now')
        AND (c.place_id = ? OR c.place_id IS NULL)
      ORDER BY c.created_at DESC
    `).all(placeId);
    
    // Add usage statistics
    const enrichedCoupons = coupons.map(coupon => {
      const usageCount = db.prepare('SELECT COUNT(*) as count FROM coupon_usage WHERE coupon_id = ?').get(coupon.id);
      
      return {
        ...coupon,
        current_usage: usageCount?.count || 0,
        is_available: (!coupon.usage_limit || (usageCount?.count || 0) < coupon.usage_limit)
      };
    });
    
    res.json(enrichedCoupons);
  } catch (error) {
    console.error('Place coupons fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch place coupons' });
  }
});

// Use/redeem a coupon
app.post('/api/coupons/:couponId/redeem', (req, res) => {
  try {
    const { couponId } = req.params;
    const { user_id, place_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get coupon details
    const coupon = db.prepare(`
      SELECT c.*
      FROM coupons c 
      WHERE c.id = ?
    `).get(couponId);
    
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    
    // Check if coupon is still valid
    if (!coupon.is_active) {
      return res.status(400).json({ error: 'Coupon is no longer active' });
    }
    
    if (new Date(coupon.valid_until) < new Date()) {
      return res.status(400).json({ error: 'Coupon has expired' });
    }
    
    // Check usage limit
    if (coupon.usage_limit) {
      const currentUsage = db.prepare('SELECT COUNT(*) as count FROM coupon_usage WHERE coupon_id = ?').get(couponId);
      if (currentUsage.count >= coupon.usage_limit) {
        return res.status(400).json({ error: 'Coupon usage limit reached' });
      }
    }
    
    // Check if user has already used this coupon (if one-time per user)
    const existingUsage = db.prepare('SELECT * FROM coupon_usage WHERE coupon_id = ? AND user_id = ?').get(couponId, user_id);
    if (existingUsage) {
      return res.status(400).json({ error: 'You have already used this coupon' });
    }
    
    // Validate place if coupon is place-specific
    if (coupon.place_id && place_id && coupon.place_id != place_id) {
      return res.status(400).json({ error: 'This coupon can only be used at the specified location' });
    }
    
    // Record coupon usage
    const usageId = uuidv4();
    db.prepare(`
      INSERT INTO coupon_usage (
        id, coupon_id, user_id, place_id, used_at, discount_applied
      ) VALUES (?, ?, ?, ?, datetime('now'), ?)
    `).run(usageId, couponId, user_id, place_id || coupon.place_id, coupon.discount_value);
    
    // Update place visit metrics if place specified
    if (place_id || coupon.place_id) {
      const targetPlaceId = place_id || coupon.place_id;
      try {
        db.prepare(`
          INSERT INTO place_visits (id, place_id, user_id, visit_date, source)
          VALUES (?, ?, ?, date('now'), 'coupon_redemption')
        `).run(uuidv4(), targetPlaceId, user_id);
      } catch (err) {
        console.log('Place visit already recorded today:', err.message);
      }
    }
    
    res.json({
      success: true,
      message: 'Coupon redeemed successfully!',
      usage_id: usageId,
      discount_applied: coupon.discount_value,
      coupon: {
        title: coupon.title,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        place_name: coupon.place_name
      }
    });
    
  } catch (error) {
    console.error('Coupon redemption error:', error);
    res.status(500).json({ error: 'Failed to redeem coupon' });
  }
});

// Get user's coupon usage history
app.get('/api/users/:userId/coupons', (req, res) => {
  try {
    const { userId } = req.params;
    
    const usedCoupons = db.prepare(`
      SELECT 
        cu.*, 
        c.title, c.description, c.discount_type, c.discount_value
      FROM coupon_usage cu
      JOIN coupons c ON cu.coupon_id = c.id
      WHERE cu.user_id = ?
      ORDER BY cu.used_at DESC
    `).all(userId);
    
    res.json(usedCoupons);
  } catch (error) {
    console.error('User coupon history error:', error);
    res.status(500).json({ error: 'Failed to fetch coupon history' });
  }
});

// Health
// Routes API endpoints
app.post('/api/routes', (req, res) => {
  try {
    const { name, user_id, places, total_distance, estimated_time } = req.body;
    
    if (!name || !user_id || !places || places.length < 2) {
      return res.status(400).json({ error: 'Invalid route data' });
    }

    // Create routes table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS routes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        user_id TEXT NOT NULL,
        total_distance REAL DEFAULT 0,
        estimated_time REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create route_places table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS route_places (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        route_id INTEGER NOT NULL,
        place_id INTEGER NOT NULL,
        order_index INTEGER NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        FOREIGN KEY (route_id) REFERENCES routes (id) ON DELETE CASCADE
      )
    `);

    // Insert route
    const insertRoute = db.prepare(`
      INSERT INTO routes (name, user_id, total_distance, estimated_time)
      VALUES (?, ?, ?, ?)
    `);
    
    const routeResult = insertRoute.run(name, user_id, total_distance || 0, estimated_time || 0);
    const routeId = routeResult.lastInsertRowid;

    // Insert route places
    const insertRoutePlace = db.prepare(`
      INSERT INTO route_places (route_id, place_id, order_index, lat, lng)
      VALUES (?, ?, ?, ?, ?)
    `);

    places.forEach((place, index) => {
      insertRoutePlace.run(routeId, place.place_id, place.order || index + 1, place.lat, place.lng);
    });

    res.json({
      id: routeId,
      name,
      user_id,
      places: places.length,
      total_distance,
      estimated_time,
      created_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error saving route:', error);
    res.status(500).json({ error: 'Failed to save route' });
  }
});

// Get user's saved routes
app.get('/api/users/:userId/routes', (req, res) => {
  try {
    const { userId } = req.params;
    
    const routes = db.prepare(`
      SELECT 
        r.*,
        COUNT(rp.id) as place_count
      FROM routes r
      LEFT JOIN route_places rp ON r.id = rp.route_id
      WHERE r.user_id = ?
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `).all(userId);

    res.json(routes);
  } catch (error) {
    console.error('Error fetching user routes:', error);
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

// Get specific route with places
app.get('/api/routes/:routeId', (req, res) => {
  try {
    const { routeId } = req.params;
    
    // Get route info
    const route = db.prepare(`
      SELECT * FROM routes WHERE id = ?
    `).get(routeId);

    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    // Get route places with place details
    const routePlaces = db.prepare(`
      SELECT 
        rp.*,
        p.name,
        p.description,
        p.category,
        p.tags,
        p.rating,
        p.address
      FROM route_places rp
      LEFT JOIN place p ON rp.place_id = p.id
      WHERE rp.route_id = ?
      ORDER BY rp.order_index
    `).all(routeId);

    res.json({
      ...route,
      places: routePlaces
    });
  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(500).json({ error: 'Failed to fetch route' });
  }
});

// Delete route
app.delete('/api/routes/:routeId', (req, res) => {
  try {
    const { routeId } = req.params;
    
    // Delete route places first (due to foreign key)
    db.prepare('DELETE FROM route_places WHERE route_id = ?').run(routeId);
    
    // Delete route
    const result = db.prepare('DELETE FROM routes WHERE id = ?').run(routeId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    console.error('Error deleting route:', error);
    res.status(500).json({ error: 'Failed to delete route' });
  }
});

app.get('/api/health', (req, res) => res.json({ ok:true }));

app.listen(PORT, () => {
  console.log(`[API] Listening on http://localhost:${PORT}`);
});
