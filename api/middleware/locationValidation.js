import { validateLocation, geocodeAddress } from '../services/geocoding.js';
import db from '../db.js';

// Middleware to validate location data
export async function validateLocationMiddleware(req, res, next) {
  try {
    const { name, lat, lng, address } = req.body;
    
    // Skip validation if coordinates are not provided
    if (!lat || !lng) {
      return next();
    }

    const numLat = parseFloat(lat);
    const numLng = parseFloat(lng);

    // Validate coordinates format
    if (isNaN(numLat) || isNaN(numLng)) {
      return res.status(400).json({
        error: 'Invalid coordinates format',
        details: 'Latitude and longitude must be valid numbers'
      });
    }

    // Validate the location
    const validation = await validateLocation(name || address, numLat, numLng);
    
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid location',
        details: validation.reason,
        suggestions: validation.suggestions || null,
        bounds: validation.suggestedBounds || null
      });
    }

    // Add validation info to request for use in route handlers
    req.locationValidation = validation;
    req.body.lat = numLat;
    req.body.lng = numLng;

    next();
  } catch (error) {
    console.error('Location validation error:', error);
    res.status(500).json({
      error: 'Location validation failed',
      details: 'Could not validate location with external services'
    });
  }
}

// Middleware to enrich location with external data
export async function enrichLocationMiddleware(req, res, next) {
  try {
    const { name, address, lat, lng } = req.body;
    
    if (!name && !address) {
      return next();
    }

    // Try to get additional data from geocoding services
    const searchTerm = address || name;
    const geocodeResults = await geocodeAddress(searchTerm);
    
    if (geocodeResults.length > 0) {
      const bestMatch = geocodeResults[0];
      
      // Enrich request body with additional data
      req.body.enrichedData = {
        verified_address: bestMatch.address,
        google_place_id: bestMatch.google_place_id,
        osm_id: bestMatch.osm_id,
        mapbox_id: bestMatch.mapbox_id,
        business_type: bestMatch.types ? bestMatch.types.join(',') : null,
        confidence: bestMatch.confidence,
        verification_source: bestMatch.source,
        verified_at: new Date().toISOString()
      };
    }

    next();
  } catch (error) {
    console.error('Location enrichment error:', error);
    // Don't fail the request, just continue without enrichment
    next();
  }
}

// Helper function to check if location needs re-verification
export function needsReVerification(lastVerified, maxAgeHours = 24 * 30) { // 30 days default
  if (!lastVerified) return true;
  
  const lastVerifiedDate = new Date(lastVerified);
  const maxAge = maxAgeHours * 60 * 60 * 1000;
  
  return (Date.now() - lastVerifiedDate.getTime()) > maxAge;
}

// Middleware to check existing places for verification status
export async function checkVerificationStatusMiddleware(req, res, next) {
  try {
    const { place_id } = req.body;
    
    if (!place_id) {
      return next();
    }

    const place = db.prepare('SELECT * FROM place WHERE id = ?').get(place_id);
    
    if (!place) {
      return res.status(404).json({
        error: 'Place not found',
        place_id
      });
    }

    // Check if place needs re-verification
    if (!place.verified || needsReVerification(place.last_verified)) {
      try {
        const validation = await validateLocation(place.name, place.lat, place.lng);
        
        if (validation.valid) {
          // Update verification status
          db.prepare(`
            UPDATE place 
            SET verified = 1, 
                verification_source = ?, 
                last_verified = ?,
                address = COALESCE(address, ?)
            WHERE id = ?
          `).run(
            validation.verificationSource,
            validation.verifiedAt,
            validation.address,
            place_id
          );
        } else {
          console.warn(`Place ${place_id} failed re-verification:`, validation.reason);
        }
      } catch (verificationError) {
        console.error(`Re-verification failed for place ${place_id}:`, verificationError);
      }
    }

    req.place = place;
    next();
  } catch (error) {
    console.error('Verification status check error:', error);
    next(); // Continue without blocking the request
  }
}

// Middleware to validate activity locations
export async function validateActivityLocationMiddleware(req, res, next) {
  try {
    const { place_id, title } = req.body;
    
    if (!place_id) {
      return res.status(400).json({
        error: 'place_id is required for activities'
      });
    }

    const place = db.prepare('SELECT * FROM place WHERE id = ?').get(place_id);
    
    if (!place) {
      return res.status(404).json({
        error: 'Place not found',
        place_id
      });
    }

    if (!place.verified) {
      return res.status(400).json({
        error: 'Cannot create activity for unverified location',
        place_id,
        place_name: place.name,
        suggestion: 'Please verify the location first'
      });
    }

    // Check if the activity makes sense for this place type
    if (place.business_type) {
      const businessTypes = place.business_type.split(',');
      const activityValidation = validateActivityForBusinessType(title, businessTypes);
      
      if (!activityValidation.valid) {
        return res.status(400).json({
          error: 'Activity not suitable for this location type',
          details: activityValidation.reason,
          place_type: place.business_type,
          suggestions: activityValidation.suggestions
        });
      }
    }

    req.verifiedPlace = place;
    next();
  } catch (error) {
    console.error('Activity location validation error:', error);
    res.status(500).json({
      error: 'Failed to validate activity location'
    });
  }
}

// Helper function to validate activity types against business types
function validateActivityForBusinessType(activityTitle, businessTypes) {
  const activityLower = activityTitle.toLowerCase();
  
  // Define activity-business type compatibility
  const compatibility = {
    restaurant: ['comida', 'comer', 'degust', 'menu', 'almuerzo', 'cena'],
    cafe: ['café', 'coffee', 'bebida', 'desayuno', 'merienda'],
    museum: ['exhibición', 'tour', 'visita', 'historia', 'arte', 'cultura'],
    park: ['caminata', 'ejercicio', 'naturaleza', 'aire libre', 'deportes'],
    shop: ['compras', 'shopping', 'artesanías', 'souvenirs'],
    church: ['visita', 'oración', 'historia', 'arquitectura', 'cultura'],
    hotel: ['hospedaje', 'descanso', 'alojamiento']
  };

  // Check if activity matches business type
  for (const businessType of businessTypes) {
    const typeKey = businessType.toLowerCase();
    const compatibleActivities = compatibility[typeKey] || [];
    
    const isCompatible = compatibleActivities.some(keyword => 
      activityLower.includes(keyword)
    );

    if (isCompatible) {
      return { valid: true };
    }
  }

  // Generate suggestions based on business type
  const suggestions = [];
  for (const businessType of businessTypes) {
    const typeKey = businessType.toLowerCase();
    if (compatibility[typeKey]) {
      suggestions.push(...compatibility[typeKey]);
    }
  }

  return {
    valid: false,
    reason: `Activity "${activityTitle}" may not be suitable for ${businessTypes.join(', ')}`,
    suggestions: suggestions.slice(0, 5)
  };
}

export default {
  validateLocationMiddleware,
  enrichLocationMiddleware,
  checkVerificationStatusMiddleware,
  validateActivityLocationMiddleware,
  needsReVerification
};