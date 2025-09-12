import axios from 'axios';
import { distanceMeters } from '../utils.js';

// Walking speed constants (meters per minute)
const WALKING_SPEED_FLAT = 83; // 5 km/h
const WALKING_SPEED_UPHILL = 50; // 3 km/h  
const WALKING_SPEED_DOWNHILL = 100; // 6 km/h

// Ibagué elevation data (approximate, for better calculations)
const IBAGUE_ELEVATION = {
  center: { lat: 4.4389, lng: -75.2043, elevation: 1285 }, // Plaza de Bolívar
  north: { lat: 4.45, lng: -75.20, elevation: 1320 },
  south: { lat: 4.42, lng: -75.21, elevation: 1250 },
  east: { lat: 4.44, lng: -75.18, elevation: 1400 },
  west: { lat: 4.44, lng: -75.23, elevation: 1200 }
};

// Estimate elevation based on location (rough approximation for Ibagué)
function estimateElevation(lat, lng) {
  // Simple interpolation based on known points
  const center = IBAGUE_ELEVATION.center;
  const distanceFromCenter = distanceMeters({ lat, lng }, center);
  
  // Ibagué generally slopes from east (higher) to west (lower)
  const eastWestFactor = (lng - center.lng) * -200; // Higher to the east
  const northSouthFactor = (lat - center.lat) * 100; // Slight north-south variation
  
  return center.elevation + eastWestFactor + northSouthFactor;
}

// Calculate walking time considering terrain
export function calculateWalkingTime(fromLat, fromLng, toLat, toLng) {
  const distance = distanceMeters({ lat: fromLat, lng: fromLng }, { lat: toLat, lng: toLng });
  
  if (distance < 50) return 1; // Minimum 1 minute for very short distances
  
  // Estimate elevations
  const fromElevation = estimateElevation(fromLat, fromLng);
  const toElevation = estimateElevation(toLat, toLng);
  const elevationDiff = toElevation - fromElevation;
  
  // Choose walking speed based on terrain
  let speed = WALKING_SPEED_FLAT;
  if (elevationDiff > 20) {
    speed = WALKING_SPEED_UPHILL;
  } else if (elevationDiff < -20) {
    speed = WALKING_SPEED_DOWNHILL;
  }
  
  const baseTime = distance / speed;
  
  // Add penalty for steep climbs
  const climbPenalty = Math.max(0, elevationDiff) / 10; // 1 minute per 10m climb
  
  return Math.ceil(baseTime + climbPenalty);
}

// Get real routing data from external services
export async function getRouteData(fromLat, fromLng, toLat, toLng, mode = 'walking') {
  const results = {
    distance: distanceMeters({ lat: fromLat, lng: fromLng }, { lat: toLat, lng: toLng }),
    duration: calculateWalkingTime(fromLat, fromLng, toLat, toLng),
    mode,
    source: 'estimated'
  };

  // Try to get real routing data if APIs are available
  try {
    // Try OpenRouteService (free tier available)
    const orsResult = await getOpenRouteServiceRoute(fromLat, fromLng, toLat, toLng, mode);
    if (orsResult) {
      return { ...results, ...orsResult, source: 'openrouteservice' };
    }

    // Try Mapbox Directions API
    const mapboxResult = await getMapboxRoute(fromLat, fromLng, toLat, toLng, mode);
    if (mapboxResult) {
      return { ...results, ...mapboxResult, source: 'mapbox' };
    }

    // Try Google Directions API
    const googleResult = await getGoogleRoute(fromLat, fromLng, toLat, toLng, mode);
    if (googleResult) {
      return { ...results, ...googleResult, source: 'google' };
    }
  } catch (error) {
    console.error('Routing API error:', error.message);
  }

  return results;
}

// OpenRouteService API (free tier)
async function getOpenRouteServiceRoute(fromLat, fromLng, toLat, toLng, mode) {
  const orsApiKey = process.env.OPENROUTE_SERVICE_API_KEY;
  if (!orsApiKey) return null;

  const profile = mode === 'driving' ? 'driving-car' : 'foot-walking';
  const url = `https://api.openrouteservice.org/v2/directions/${profile}`;

  try {
    const response = await axios.post(url, {
      coordinates: [[fromLng, fromLat], [toLng, toLat]],
      format: 'json'
    }, {
      headers: {
        'Authorization': orsApiKey,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    const route = response.data.routes[0];
    if (route) {
      return {
        distance: route.summary.distance, // meters
        duration: Math.ceil(route.summary.duration / 60), // convert to minutes
        geometry: route.geometry,
        steps: route.segments[0]?.steps || []
      };
    }
  } catch (error) {
    console.error('OpenRouteService error:', error.message);
  }

  return null;
}

// Mapbox Directions API
async function getMapboxRoute(fromLat, fromLng, toLat, toLng, mode) {
  const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
  if (!mapboxToken) return null;

  const profile = mode === 'driving' ? 'driving' : 'walking';
  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${fromLng},${fromLat};${toLng},${toLat}`;

  try {
    const response = await axios.get(url, {
      params: {
        access_token: mapboxToken,
        geometries: 'geojson',
        steps: true
      },
      timeout: 5000
    });

    const route = response.data.routes[0];
    if (route) {
      return {
        distance: route.distance, // meters
        duration: Math.ceil(route.duration / 60), // convert to minutes
        geometry: route.geometry,
        steps: route.legs[0]?.steps || []
      };
    }
  } catch (error) {
    console.error('Mapbox Directions error:', error.message);
  }

  return null;
}

// Google Directions API
async function getGoogleRoute(fromLat, fromLng, toLat, toLng, mode) {
  const googleApiKey = process.env.GOOGLE_DIRECTIONS_API_KEY;
  if (!googleApiKey) return null;

  const travelMode = mode === 'driving' ? 'driving' : 'walking';
  const url = 'https://maps.googleapis.com/maps/api/directions/json';

  try {
    const response = await axios.get(url, {
      params: {
        origin: `${fromLat},${fromLng}`,
        destination: `${toLat},${toLng}`,
        mode: travelMode,
        key: googleApiKey,
        language: 'es',
        region: 'CO'
      },
      timeout: 5000
    });

    if (response.data.status === 'OK' && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const leg = route.legs[0];
      
      return {
        distance: leg.distance.value, // meters
        duration: Math.ceil(leg.duration.value / 60), // convert to minutes
        steps: leg.steps,
        polyline: route.overview_polyline.points
      };
    }
  } catch (error) {
    console.error('Google Directions error:', error.message);
  }

  return null;
}

// Calculate route between multiple waypoints
export async function calculateMultiPointRoute(waypoints, mode = 'walking') {
  if (waypoints.length < 2) {
    return { totalDistance: 0, totalDuration: 0, segments: [] };
  }

  const segments = [];
  let totalDistance = 0;
  let totalDuration = 0;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const from = waypoints[i];
    const to = waypoints[i + 1];
    
    const routeData = await getRouteData(from.lat, from.lng, to.lat, to.lng, mode);
    
    segments.push({
      from: { ...from, index: i },
      to: { ...to, index: i + 1 },
      ...routeData
    });
    
    totalDistance += routeData.distance;
    totalDuration += routeData.duration;
  }

  return {
    totalDistance,
    totalDuration,
    segments,
    waypoints
  };
}

// Find optimal route order (simple nearest neighbor heuristic)
export function optimizeRouteOrder(startPoint, destinations) {
  if (destinations.length <= 1) return destinations;

  const unvisited = [...destinations];
  const route = [];
  let current = startPoint;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = distanceMeters(current, unvisited[0]);

    for (let i = 1; i < unvisited.length; i++) {
      const distance = distanceMeters(current, unvisited[i]);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    const nearest = unvisited.splice(nearestIndex, 1)[0];
    route.push(nearest);
    current = nearest;
  }

  return route;
}

// Estimate travel modes based on distance and context
export function suggestTravelMode(distanceMeters, context = {}) {
  const { hasPublicTransport = true, allowsDriving = true } = context;

  if (distanceMeters < 500) {
    return { mode: 'walking', confidence: 'high', reason: 'Short distance, perfect for walking' };
  } else if (distanceMeters < 2000) {
    return { mode: 'walking', confidence: 'medium', reason: 'Walkable distance, good exercise' };
  } else if (distanceMeters < 5000 && hasPublicTransport) {
    return { mode: 'transit', confidence: 'high', reason: 'Good distance for public transport' };
  } else if (distanceMeters > 5000 && allowsDriving) {
    return { mode: 'driving', confidence: 'high', reason: 'Long distance, driving recommended' };
  } else {
    return { mode: 'walking', confidence: 'low', reason: 'Walking is the only available option' };
  }
}

// Calculate isochrones (areas reachable within time limit)
export function calculateWalkingIsochrone(centerLat, centerLng, maxMinutes) {
  // Simple circular approximation for now
  // In production, you'd use more sophisticated algorithms
  const maxDistance = maxMinutes * WALKING_SPEED_FLAT;
  
  const points = [];
  const numPoints = 32;
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const lat = centerLat + (maxDistance / 111320) * Math.cos(angle);
    const lng = centerLng + (maxDistance / (111320 * Math.cos(centerLat * Math.PI / 180))) * Math.sin(angle);
    points.push({ lat, lng });
  }
  
  return {
    center: { lat: centerLat, lng: centerLng },
    maxMinutes,
    maxDistance,
    boundary: points
  };
}

export default {
  calculateWalkingTime,
  getRouteData,
  calculateMultiPointRoute,
  optimizeRouteOrder,
  suggestTravelMode,
  calculateWalkingIsochrone
};