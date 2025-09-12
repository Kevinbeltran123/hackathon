import axios from 'axios';
import crypto from 'crypto';
import db from '../db.js';

// Ibagué bounds for validation
const IBAGUE_BOUNDS = {
  south: parseFloat(process.env.IBAGUE_BOUNDS_SOUTH) || 4.35,
  north: parseFloat(process.env.IBAGUE_BOUNDS_NORTH) || 4.55,
  west: parseFloat(process.env.IBAGUE_BOUNDS_WEST) || -75.35,
  east: parseFloat(process.env.IBAGUE_BOUNDS_EAST) || -75.15
};

const CACHE_TTL_HOURS = parseInt(process.env.LOCATION_CACHE_TTL_HOURS) || 24;

// Rate limiting
const apiCallCounts = new Map();
const MAX_CALLS_PER_MINUTE = parseInt(process.env.MAX_API_CALLS_PER_MINUTE) || 60;

function isWithinIbague(lat, lng) {
  return lat >= IBAGUE_BOUNDS.south && 
         lat <= IBAGUE_BOUNDS.north && 
         lng >= IBAGUE_BOUNDS.west && 
         lng <= IBAGUE_BOUNDS.east;
}

function createQueryHash(query, type) {
  return crypto.createHash('md5').update(`${type}:${JSON.stringify(query)}`).digest('hex');
}

function getFromCache(queryHash) {
  const cached = db.prepare('SELECT * FROM location_cache WHERE query_hash = ? AND expires_at > datetime("now")').get(queryHash);
  return cached ? JSON.parse(cached.response_data) : null;
}

function saveToCache(queryHash, data, apiSource) {
  const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString();
  const createdAt = new Date().toISOString();
  
  db.prepare(`
    INSERT OR REPLACE INTO location_cache (query_hash, response_data, api_source, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(queryHash, JSON.stringify(data), apiSource, createdAt, expiresAt);
}

function canMakeApiCall(apiName) {
  const now = Date.now();
  const minute = Math.floor(now / 60000);
  const key = `${apiName}_${minute}`;
  
  const count = apiCallCounts.get(key) || 0;
  if (count >= MAX_CALLS_PER_MINUTE) {
    return false;
  }
  
  apiCallCounts.set(key, count + 1);
  
  // Clean up old entries
  for (const [k, v] of apiCallCounts.entries()) {
    const keyMinute = parseInt(k.split('_')[1]);
    if (keyMinute < minute - 5) {
      apiCallCounts.delete(k);
    }
  }
  
  return true;
}

// OpenStreetMap Nominatim API (Free)
async function geocodeWithNominatim(address) {
  if (!canMakeApiCall('nominatim')) {
    throw new Error('Rate limit exceeded for Nominatim API');
  }

  const baseUrl = 'https://nominatim.openstreetmap.org/search';
  const params = {
    q: `${address}, Ibagué, Tolima, Colombia`,
    format: 'json',
    limit: 5,
    addressdetails: 1,
    extratags: 1,
    namedetails: 1
  };

  try {
    const response = await axios.get(baseUrl, {
      params,
      headers: {
        'User-Agent': 'Rutas-VIVAS-Ibague/1.0 (tourism-app)'
      },
      timeout: 5000
    });

    return response.data.map(item => ({
      name: item.display_name.split(',')[0],
      address: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      osm_id: item.osm_id,
      place_id: item.place_id,
      type: item.type,
      class: item.class,
      importance: item.importance,
      confidence: item.importance || 0.5,
      source: 'nominatim',
      raw: item
    })).filter(location => isWithinIbague(location.lat, location.lng));
  } catch (error) {
    console.error('Nominatim geocoding error:', error.message);
    return [];
  }
}

// Google Places API
async function geocodeWithGoogle(address) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return [];

  if (!canMakeApiCall('google')) {
    throw new Error('Rate limit exceeded for Google Places API');
  }

  const baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
  const params = {
    address: `${address}, Ibagué, Tolima, Colombia`,
    key: apiKey,
    language: 'es',
    region: 'CO'
  };

  try {
    const response = await axios.get(baseUrl, { params, timeout: 5000 });
    
    if (response.data.status !== 'OK') {
      console.error('Google geocoding error:', response.data.status);
      return [];
    }

    return response.data.results.map(item => {
      const location = item.geometry.location;
      return {
        name: item.formatted_address.split(',')[0],
        address: item.formatted_address,
        lat: location.lat,
        lng: location.lng,
        google_place_id: item.place_id,
        types: item.types,
        confidence: 0.9,
        source: 'google',
        raw: item
      };
    }).filter(location => isWithinIbague(location.lat, location.lng));
  } catch (error) {
    console.error('Google geocoding error:', error.message);
    return [];
  }
}

// Mapbox Geocoding API
async function geocodeWithMapbox(address) {
  const accessToken = process.env.MAPBOX_ACCESS_TOKEN;
  if (!accessToken) return [];

  if (!canMakeApiCall('mapbox')) {
    throw new Error('Rate limit exceeded for Mapbox API');
  }

  const baseUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`;
  const params = {
    access_token: accessToken,
    country: 'CO',
    proximity: '-75.2043,4.4389', // Ibagué center
    limit: 5,
    language: 'es'
  };

  try {
    const response = await axios.get(baseUrl, { params, timeout: 5000 });

    return response.data.features.map(item => {
      const [lng, lat] = item.center;
      return {
        name: item.text,
        address: item.place_name,
        lat: lat,
        lng: lng,
        mapbox_id: item.id,
        relevance: item.relevance,
        confidence: item.relevance || 0.7,
        source: 'mapbox',
        raw: item
      };
    }).filter(location => isWithinIbague(location.lat, location.lng));
  } catch (error) {
    console.error('Mapbox geocoding error:', error.message);
    return [];
  }
}

// Main geocoding function with fallbacks
export async function geocodeAddress(address) {
  const query = { address, type: 'geocode' };
  const queryHash = createQueryHash(query, 'geocode');
  
  // Check cache first
  const cached = getFromCache(queryHash);
  if (cached) {
    return cached;
  }

  let results = [];

  try {
    // Try Nominatim first (free)
    const nominatimResults = await geocodeWithNominatim(address);
    results = results.concat(nominatimResults);

    // If no results and we have Google API key, try Google
    if (results.length === 0 && process.env.GOOGLE_PLACES_API_KEY) {
      const googleResults = await geocodeWithGoogle(address);
      results = results.concat(googleResults);
    }

    // If still no results and we have Mapbox token, try Mapbox
    if (results.length === 0 && process.env.MAPBOX_ACCESS_TOKEN) {
      const mapboxResults = await geocodeWithMapbox(address);
      results = results.concat(mapboxResults);
    }

    // Sort by confidence/relevance
    results.sort((a, b) => (b.confidence || b.relevance || 0) - (a.confidence || a.relevance || 0));

    // Cache results
    saveToCache(queryHash, results, 'multiple');

    return results;
  } catch (error) {
    console.error('Geocoding failed:', error.message);
    return [];
  }
}

// Reverse geocoding (coordinates to address)
export async function reverseGeocode(lat, lng) {
  if (!isWithinIbague(lat, lng)) {
    throw new Error('Location is outside Ibagué bounds');
  }

  const query = { lat, lng, type: 'reverse' };
  const queryHash = createQueryHash(query, 'reverse');
  
  // Check cache first
  const cached = getFromCache(queryHash);
  if (cached) {
    return cached;
  }

  try {
    // Try Nominatim for reverse geocoding
    if (!canMakeApiCall('nominatim')) {
      throw new Error('Rate limit exceeded for reverse geocoding');
    }

    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat,
        lon: lng,
        format: 'json',
        addressdetails: 1,
        extratags: 1
      },
      headers: {
        'User-Agent': 'Rutas-VIVAS-Ibague/1.0 (tourism-app)'
      },
      timeout: 5000
    });

    const result = {
      address: response.data.display_name,
      name: response.data.name || response.data.display_name.split(',')[0],
      lat: parseFloat(response.data.lat),
      lng: parseFloat(response.data.lon),
      osm_id: response.data.osm_id,
      place_id: response.data.place_id,
      type: response.data.type,
      class: response.data.class,
      source: 'nominatim',
      raw: response.data
    };

    // Cache result
    saveToCache(queryHash, result, 'nominatim');

    return result;
  } catch (error) {
    console.error('Reverse geocoding failed:', error.message);
    throw error;
  }
}

// Validate if a location exists and is in Ibagué
export async function validateLocation(name, lat, lng) {
  if (!isWithinIbague(lat, lng)) {
    return {
      valid: false,
      reason: 'Location is outside Ibagué bounds',
      suggestedBounds: IBAGUE_BOUNDS
    };
  }

  try {
    // Try reverse geocoding to verify the location
    const reverseResult = await reverseGeocode(lat, lng);
    
    return {
      valid: true,
      verified: true,
      verificationSource: 'nominatim',
      verifiedAt: new Date().toISOString(),
      address: reverseResult.address,
      confidence: 0.8
    };
  } catch (error) {
    // If reverse geocoding fails, try forward geocoding with the name
    try {
      const geocodeResults = await geocodeAddress(name);
      const match = geocodeResults.find(result => 
        Math.abs(result.lat - lat) < 0.001 && Math.abs(result.lng - lng) < 0.001
      );

      if (match) {
        return {
          valid: true,
          verified: true,
          verificationSource: match.source,
          verifiedAt: new Date().toISOString(),
          address: match.address,
          confidence: match.confidence || 0.7
        };
      }

      return {
        valid: false,
        reason: 'Could not verify location coordinates',
        suggestions: geocodeResults.slice(0, 3)
      };
    } catch (innerError) {
      return {
        valid: false,
        reason: 'Location validation failed',
        error: innerError.message
      };
    }
  }
}

// Search for places by category in Ibagué
export async function searchPlacesByCategory(category, limit = 20) {
  const query = { category, limit, type: 'search' };
  const queryHash = createQueryHash(query, 'search');
  
  // Check cache first
  const cached = getFromCache(queryHash);
  if (cached) {
    return cached;
  }

  // Define search queries for different categories
  const categoryQueries = {
    restaurant: 'restaurante',
    cafe: 'café',
    hotel: 'hotel',
    museum: 'museo',
    park: 'parque',
    church: 'iglesia',
    shopping: 'centro comercial',
    tourist_attraction: 'atractivo turístico',
    cultural_center: 'centro cultural'
  };

  const searchTerm = categoryQueries[category] || category;
  const results = await geocodeAddress(`${searchTerm} Ibagué`);

  // Cache results
  saveToCache(queryHash, results.slice(0, limit), 'search');

  return results.slice(0, limit);
}

// Clean expired cache entries
export function cleanExpiredCache() {
  const deleted = db.prepare('DELETE FROM location_cache WHERE expires_at < datetime("now")').run();
  console.log(`Cleaned ${deleted.changes} expired cache entries`);
}

// Get API usage statistics
export function getApiUsageStats() {
  const stats = {};
  for (const [key, count] of apiCallCounts.entries()) {
    const [api, minute] = key.split('_');
    if (!stats[api]) stats[api] = 0;
    stats[api] += count;
  }
  return stats;
}