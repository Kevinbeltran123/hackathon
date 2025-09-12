import axios from 'axios';

// Enhanced places service using external APIs
export class EnhancedPlacesService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours
  }

  // Get places from OpenStreetMap Overpass API
  async getOSMPlaces(lat, lng, radius = 2000, categories = []) {
    try {
      const bbox = this.calculateBoundingBox(lat, lng, radius);
      
      // Map categories to OSM tags
      const osmTags = this.mapCategoriesToOSMTags(categories);
      
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["amenity"~"restaurant|cafe|bar|fast_food|food_court"]["name"](bbox);
          node["tourism"~"museum|gallery|attraction|information"]["name"](bbox);
          node["leisure"~"park|garden|sports_centre"]["name"](bbox);
          node["shop"~"mall|market|supermarket|clothes"]["name"](bbox);
          node["historic"~"monument|memorial|castle|church"]["name"](bbox);
          node["natural"~"park|beach|waterfall"]["name"](bbox);
        );
        out center meta;
      `;

      const response = await axios.get('https://overpass-api.de/api/interpreter', {
        params: { data: overpassQuery },
        timeout: 10000
      });

      return this.processOSMResults(response.data.elements, lat, lng);
    } catch (error) {
      console.error('OSM API Error:', error.message);
      return [];
    }
  }

  // Get places from Google Places API (if key available)
  async getGooglePlaces(lat, lng, radius = 2000, types = []) {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) return [];

    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
        params: {
          location: `${lat},${lng}`,
          radius: radius,
          type: types.join('|'),
          key: apiKey
        },
        timeout: 10000
      });

      return this.processGoogleResults(response.data.results || [], lat, lng);
    } catch (error) {
      console.error('Google Places API Error:', error.message);
      return [];
    }
  }

  // Enhanced search combining multiple sources
  async searchPlaces(lat, lng, radius = 2000, interests = [], time = 3) {
    const cacheKey = `places_${lat}_${lng}_${radius}_${interests.join(',')}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      // Get places from multiple sources
      const [osmPlaces, googlePlaces] = await Promise.all([
        this.getOSMPlaces(lat, lng, radius, interests),
        this.getGooglePlaces(lat, lng, radius, this.mapInterestsToGoogleTypes(interests))
      ]);

      // Combine and deduplicate results
      const allPlaces = [...osmPlaces, ...googlePlaces];
      const uniquePlaces = this.deduplicatePlaces(allPlaces);

      // Categorize and score places
      const categorizedPlaces = this.categorizePlaces(uniquePlaces, interests);
      const scoredPlaces = this.scorePlaces(categorizedPlaces, lat, lng, interests, time);

      // Sort by score and limit results
      const maxPlaces = this.getMaxPlacesForTime(time);
      const result = scoredPlaces.slice(0, maxPlaces);

      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('Enhanced places search error:', error);
      return [];
    }
  }

  // Helper methods
  calculateBoundingBox(lat, lng, radius) {
    const earthRadius = 6371000; // meters
    const latDelta = (radius / earthRadius) * (180 / Math.PI);
    const lngDelta = (radius / earthRadius) * (180 / Math.PI) / Math.cos(lat * Math.PI / 180);
    
    return `${lng - lngDelta},${lat - latDelta},${lng + lngDelta},${lat + latDelta}`;
  }

  mapCategoriesToOSMTags(categories) {
    const mapping = {
      'gastro': ['restaurant', 'cafe', 'bar', 'fast_food'],
      'cultura': ['museum', 'gallery', 'theatre', 'arts_centre'],
      'naturaleza': ['park', 'garden', 'nature_reserve'],
      'shopping': ['mall', 'market', 'shop'],
      'recreacion': ['cinema', 'sports_centre', 'leisure'],
      'servicios': ['bank', 'pharmacy', 'hospital', 'post_office']
    };
    
    return categories.flatMap(cat => mapping[cat] || []);
  }

  mapInterestsToGoogleTypes(interests) {
    const mapping = {
      'gastro': ['restaurant', 'cafe', 'bar', 'food'],
      'cultura': ['museum', 'art_gallery', 'theater'],
      'naturaleza': ['park', 'zoo', 'aquarium'],
      'shopping': ['shopping_mall', 'store'],
      'recreacion': ['movie_theater', 'amusement_park', 'bowling_alley'],
      'servicios': ['bank', 'pharmacy', 'hospital']
    };
    
    return interests.flatMap(interest => mapping[interest] || []);
  }

  processOSMResults(elements, centerLat, centerLng) {
    return elements.map(element => {
      const lat = element.lat || element.center?.lat;
      const lng = element.lon || element.center?.lng;
      
      if (!lat || !lng) return null;

      return {
        id: `osm_${element.id}`,
        name: element.tags?.name || 'Sin nombre',
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        tags: this.extractOSMTags(element.tags),
        category: this.categorizeOSMPlace(element.tags),
        rating: 4.0, // Default rating
        verified: false,
        source: 'osm',
        address: this.buildAddress(element.tags),
        distance: this.calculateDistance(centerLat, centerLng, lat, lng)
      };
    }).filter(Boolean);
  }

  processGoogleResults(results, centerLat, centerLng) {
    return results.map(place => ({
      id: `google_${place.place_id}`,
      name: place.name,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      tags: this.extractGoogleTypes(place.types),
      category: this.categorizeGooglePlace(place.types),
      rating: place.rating || 4.0,
      verified: true,
      source: 'google',
      address: place.vicinity,
      distance: this.calculateDistance(centerLat, centerLng, place.geometry.location.lat, place.geometry.location.lng)
    }));
  }

  extractOSMTags(tags) {
    const categoryMap = {
      'restaurant': 'gastro',
      'cafe': 'gastro',
      'bar': 'gastro',
      'fast_food': 'gastro',
      'museum': 'cultura',
      'gallery': 'cultura',
      'theatre': 'cultura',
      'park': 'naturaleza',
      'garden': 'naturaleza',
      'mall': 'shopping',
      'market': 'shopping',
      'cinema': 'recreacion',
      'sports_centre': 'recreacion',
      'bank': 'servicios',
      'pharmacy': 'servicios',
      'hospital': 'servicios'
    };

    return Object.keys(tags)
      .filter(key => categoryMap[key])
      .map(key => categoryMap[key]);
  }

  extractGoogleTypes(types) {
    const categoryMap = {
      'restaurant': 'gastro',
      'cafe': 'gastro',
      'bar': 'gastro',
      'food': 'gastro',
      'museum': 'cultura',
      'art_gallery': 'cultura',
      'theater': 'cultura',
      'park': 'naturaleza',
      'zoo': 'naturaleza',
      'shopping_mall': 'shopping',
      'store': 'shopping',
      'movie_theater': 'recreacion',
      'amusement_park': 'recreacion',
      'bank': 'servicios',
      'pharmacy': 'servicios',
      'hospital': 'servicios'
    };

    return types
      .filter(type => categoryMap[type])
      .map(type => categoryMap[type]);
  }

  categorizeOSMPlace(tags) {
    if (tags.restaurant || tags.cafe || tags.bar) return 'gastro';
    if (tags.museum || tags.gallery || tags.theatre) return 'cultura';
    if (tags.park || tags.garden) return 'naturaleza';
    if (tags.mall || tags.market) return 'shopping';
    if (tags.cinema || tags.sports_centre) return 'recreacion';
    if (tags.bank || tags.pharmacy || tags.hospital) return 'servicios';
    return 'default';
  }

  categorizeGooglePlace(types) {
    if (types.includes('restaurant') || types.includes('cafe') || types.includes('bar')) return 'gastro';
    if (types.includes('museum') || types.includes('art_gallery') || types.includes('theater')) return 'cultura';
    if (types.includes('park') || types.includes('zoo')) return 'naturaleza';
    if (types.includes('shopping_mall') || types.includes('store')) return 'shopping';
    if (types.includes('movie_theater') || types.includes('amusement_park')) return 'recreacion';
    if (types.includes('bank') || types.includes('pharmacy') || types.includes('hospital')) return 'servicios';
    return 'default';
  }

  buildAddress(tags) {
    const parts = [];
    if (tags['addr:street']) parts.push(tags['addr:street']);
    if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
    if (tags['addr:city']) parts.push(tags['addr:city']);
    return parts.join(' ') || 'Ibagué, Tolima';
  }

  categorizePlaces(places, interests) {
    return places.map(place => {
      const matchingInterests = place.tags.filter(tag => interests.includes(tag));
      return {
        ...place,
        matchingInterests,
        relevanceScore: matchingInterests.length / Math.max(interests.length, 1)
      };
    });
  }

  scorePlaces(places, centerLat, centerLng, interests, time) {
    return places.map(place => {
      let score = 0;
      
      // Distance score (closer is better)
      const maxDistance = 5000; // 5km max
      const distanceScore = Math.max(0, 40 - (place.distance / maxDistance) * 40);
      score += distanceScore;
      
      // Rating score
      const ratingScore = (place.rating / 5.0) * 30;
      score += ratingScore;
      
      // Relevance score
      const relevanceScore = place.relevanceScore * 30;
      score += relevanceScore;
      
      // Verification bonus
      if (place.verified) score += 5;
      
      return { ...place, score };
    }).sort((a, b) => b.score - a.score);
  }

  deduplicatePlaces(places) {
    const seen = new Set();
    return places.filter(place => {
      const key = `${place.lat.toFixed(4)}_${place.lng.toFixed(4)}_${place.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  getMaxPlacesForTime(time) {
    const timeMultiplier = {
      1: 3,   // 1 hour -> max 3 places
      2: 5,   // 2 hours -> max 5 places
      3: 8,   // 3 hours -> max 8 places
      4: 12,  // 4 hours -> max 12 places
      8: 20   // Full day -> max 20 places
    };
    return timeMultiplier[time] || 8;
  }

  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in meters
  }
}

export const enhancedPlacesService = new EnhancedPlacesService();
