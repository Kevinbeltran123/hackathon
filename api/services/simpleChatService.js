import db from '../db.js';
import NodeCache from 'node-cache';

// Cache for responses and rate limiting
const chatCache = new NodeCache({ stdTTL: parseInt(process.env.CHAT_CACHE_TTL_HOURS || 6) * 3600 });
const userLimits = new NodeCache({ stdTTL: 86400 }); // 24 hours

const MAX_MESSAGES_PER_DAY = parseInt(process.env.MAX_CHAT_MESSAGES_PER_DAY || 50);

// Common responses for frequently asked questions
const COMMON_RESPONSES = {
  'saludo': '¡Hola! Soy tu guía turístico virtual de Ibagué, la Capital Musical de Colombia 🎵. ¿En qué puedo ayudarte a descubrir nuestra hermosa ciudad?',
  'despedida': '¡Que disfrutes mucho tu visita a Ibagué! Recuerda hacer check-in en los lugares que visites para ganar sellos. ¡Hasta pronto! 👋',
  'ubicacion_general': 'Ibagué está ubicada en el centro de Colombia, es la capital del Tolima y se conoce como la "Capital Musical de Colombia". ¿Te gustaría saber sobre algún lugar específico?',
  'comida': 'La gastronomía tolimense es deliciosa. Te recomiendo probar los tamales tolimenses, el sancocho de gallina y la lechona. ¿Te gustaría que te recomiende restaurantes cerca de tu ubicación?'
};

// Rate limiting function
function checkUserLimit(userId) {
  const userKey = `user_${userId}`;
  const currentCount = userLimits.get(userKey) || 0;
  
  if (currentCount >= MAX_MESSAGES_PER_DAY) {
    return false;
  }
  
  userLimits.set(userKey, currentCount + 1);
  return true;
}

// Get nearby places and activities for context
function getNearbyContext(lat, lng, maxDistance = 2000) {
  try {
    // Get nearby places
    const places = db.prepare(`
      SELECT name, lat, lng, address, tags, business_type, description 
      FROM place 
      WHERE verified = 1
    `).all();
    
    // Filter by distance (simple calculation)
    const nearby = places.filter(place => {
      const distance = calculateDistance(lat, lng, place.lat, place.lng);
      return distance <= maxDistance;
    }).slice(0, 10);

    // Get current activities
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const activities = db.prepare(`
      SELECT a.title, a.duration, a.time_start, a.time_end, a.benefit_text, p.name as place_name
      FROM micro_activity a
      JOIN place p ON p.id = a.place_id
      WHERE a.active = 1 AND a.time_start <= ? AND a.time_end >= ?
    `).all(currentTime, currentTime);

    return { nearby, activities };
  } catch (error) {
    console.error('Error getting nearby context:', error);
    return { nearby: [], activities: [] };
  }
}

// Simple distance calculation (Haversine)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

// Check if message matches common patterns
function getCommonResponse(message) {
  const msg = message.toLowerCase().trim();
  
  if (msg.match(/^(hola|hi|hello|buenos días|buenas tardes|buenas noches)/)) {
    return COMMON_RESPONSES.saludo;
  }
  
  if (msg.match(/(adiós|chao|bye|hasta luego|gracias|thanks)/)) {
    return COMMON_RESPONSES.despedida;
  }
  
  if (msg.match(/(dónde|donde|ubicación|ubicacion|queda)/)) {
    return COMMON_RESPONSES.ubicacion_general;
  }
  
  if (msg.match(/(comer|comida|restaurante|gastronomía|gastronomia|tamal|sancocho)/)) {
    return COMMON_RESPONSES.comida;
  }
  
  return null;
}

// Generate contextual responses based on user input and location
function generateSmartResponse(message, context = {}) {
  const msg = message.toLowerCase();
  
  // Location-specific responses
  if (context.nearbyPlaces && context.nearbyPlaces.length > 0) {
    const nearbyPlace = context.nearbyPlaces[0];
    if (msg.includes('cerca') || msg.includes('actividad')) {
      return `¡Perfecto! Estás cerca de ${nearbyPlace.name}. ${nearbyPlace.description || 'Es un lugar muy interesante para visitar'}. ¿Te gustaría hacer check-in aquí? 📍`;
    }
  }
  
  // Question-specific responses with rich content
  if (msg.includes('comer') || msg.includes('comida') || msg.includes('restaurante')) {
    return `🍽️ ¡La gastronomía tolimense es increíble! Te recomiendo:

• **Tamales Tolimenses** - El plato más famoso de la región
• **Sancocho de Gallina** - Sopa tradicional perfecta para cualquier momento
• **Lechona** - Especialidad para celebraciones especiales
• **Café del Tolima** - Reconocido mundialmente

Para auténtica comida local, visita el **Mercado La 21** o busca restaurantes tradicionales en el centro. ¡No olvides hacer check-in! 🥘`;
  }
  
  if (msg.includes('historia') || msg.includes('cultura')) {
    return `🏛️ **Ibagué: Capital Musical de Colombia**

La ciudad tiene una rica historia desde 1550:

• **Plaza de Bolívar** - Corazón histórico de la ciudad
• **Conservatorio del Tolima** - Cuna de grandes músicos
• **Teatro Tolima** - Principal escenario cultural
• **Panóptico** - Antigua cárcel convertida en museo
• **Catedral Primada** - Patrimonio arquitectónico religioso

¿Te interesa algún período histórico específico? 📚`;
  }
  
  if (msg.includes('música') || msg.includes('musical')) {
    return `🎵 **¡Ibagué es la Capital Musical de Colombia!**

• **Conservatorio del Tolima** - Centro de formación musical
• **Festival Nacional del Folclor** - Evento anual más importante
• **Bambucos y Pasillos** - Ritmos tradicionales
• **Teatro Tolima** - Conciertos y presentaciones
• **Casa de la Cultura** - Talleres de música andina

¿Te gustaría asistir a algún concierto o taller musical? 🎼`;
  }
  
  if (msg.includes('naturaleza') || msg.includes('parque') || msg.includes('aire libre')) {
    return `🌿 **Espacios Naturales en Ibagué:**

• **Jardín Botánico San Jorge** - Especies nativas del Tolima, perfecto para aprender
• **Mirador Cerro de San Javier** - Vista panorámica espectacular de la ciudad
• **Parque Centenario** - Ideal para caminatas y ejercicio urbano
• **Parque Deportivo** - Actividades al aire libre y deportes

¿Prefieres senderismo, observación de flora o actividades deportivas? 🏞️`;
  }
  
  if (msg.includes('actividad') || msg.includes('hacer') || msg.includes('plan')) {
    const activities = context.activities || [];
    if (activities.length > 0) {
      const activity = activities[0];
      return `🎪 **¡Hay actividades disponibles ahora!**

"**${activity.title}**" en ${activity.place_name}
⏰ Duración: ${activity.duration} minutos
💡 ${activity.benefit_text}

¿Te interesa participar? También hay tours históricos, talleres culturales y degustaciones gastronómicas disponibles. 🎯`;
    } else {
      return `🎯 **Actividades recomendadas en Ibagué:**

• **Tours históricos** - Descubre el patrimonio de la ciudad
• **Talleres culturales** - Aprende música andina y artesanías
• **Degustaciones gastronómicas** - Prueba la comida típica
• **Senderismo urbano** - Explora parques y miradores
• **Conciertos** - Disfruta la música en vivo

¿Qué tipo de experiencia buscas? ¿Cultural, gastronómica o al aire libre? 🎊`;
    }
  }
  
  // Shopping and commerce
  if (msg.includes('comprar') || msg.includes('shopping') || msg.includes('artesanías')) {
    return `🛍️ **Comercio Local en Ibagué:**

• **Centro Comercial La Estación** - Ubicado en la antigua estación del tren
• **Mercado La 21** - Productos locales y artesanías auténticas
• **Centro Histórico** - Tiendas tradicionales y souvenirs
• **Artesanías en guadua** - Productos únicos de la región
• **Tejidos tradicionales** - Bordados y cestería local

¿Buscas algo específico? ¡Apoya el comercio local! 🏪`;
  }
  
  // Transportation and getting around
  if (msg.includes('transporte') || msg.includes('moverse') || msg.includes('llegar')) {
    return `🚌 **Moverse por Ibagué:**

• **A pie** - El centro histórico es muy caminable
• **Transporte público** - Buses urbanos conectan toda la ciudad
• **Terminal de Transportes** - Para viajes a otras ciudades
• **Taxis** - Disponibles en toda la ciudad

La mayoría de lugares turísticos están cerca entre sí. ¿Necesitas direcciones específicas? 🚶‍♂️`;
  }
  
  // Default contextual response based on nearby places
  if (context.nearbyPlaces && context.nearbyPlaces.length > 0) {
    const place = context.nearbyPlaces[0];
    return `📍 **Cerca de tu ubicación:**

Estás cerca de **${place.name}**, un lugar ${place.verified ? 'verificado' : 'interesante'} ${place.description ? `donde ${place.description.toLowerCase()}` : 'para visitar'}.

¿Te gustaría saber más sobre este lugar o prefieres explorar otras opciones cerca de ti? 🗺️`;
  }
  
  // Generic helpful response
  return `¡Bienvenido a Ibagué, la Capital Musical de Colombia! 🎵 

**Te puedo ayudar con:**
• 📍 **Lugares emblemáticos** para visitar
• 🍽️ **Gastronomía típica** tolimense  
• 🎭 **Actividades culturales** disponibles
• 🌿 **Espacios naturales** y parques
• 🏛️ **Historia y patrimonio** local
• 🛍️ **Comercio local** y artesanías

¿Qué te gustaría descubrir de nuestra hermosa ciudad? ¡Estoy aquí para ayudarte a vivir la mejor experiencia en Ibagué! 😊`;
}

// Main chat function
export async function processChatMessage(message, context = {}) {
  const userId = context.userId || 'anonymous';
  
  // Check rate limiting
  if (!checkUserLimit(userId)) {
    return {
      success: false,
      message: 'Has alcanzado el límite diario de mensajes. Inténtalo mañana.',
      isRateLimit: true
    };
  }

  // Check cache for responses
  const cacheKey = `msg_${message.toLowerCase().trim().substring(0, 50)}`;
  const cachedResponse = chatCache.get(cacheKey);
  if (cachedResponse) {
    return {
      success: true,
      message: cachedResponse,
      fromCache: true
    };
  }

  // Check for common patterns first
  const commonResponse = getCommonResponse(message);
  if (commonResponse) {
    chatCache.set(cacheKey, commonResponse);
    return {
      success: true,
      message: commonResponse,
      isCommon: true
    };
  }

  // Build context if location provided
  let enrichedContext = { ...context };
  if (context.lat && context.lng) {
    const nearby = getNearbyContext(context.lat, context.lng);
    enrichedContext.nearbyPlaces = nearby.nearby;
    enrichedContext.activities = nearby.activities;
  }

  // Generate smart contextual response
  const smartResponse = generateSmartResponse(message, enrichedContext);
  chatCache.set(cacheKey, smartResponse);
  
  return {
    success: true,
    message: smartResponse,
    isDemo: true, // This version works without external APIs
    contextUsed: !!enrichedContext.nearbyPlaces?.length
  };
}

// Get usage statistics
export function getChatStats() {
  const cacheKeys = chatCache.keys();
  const userKeys = userLimits.keys();
  
  const userUsage = {};
  userKeys.forEach(key => {
    const userId = key.replace('user_', '');
    userUsage[userId] = userLimits.get(key);
  });

  return {
    cachedResponses: cacheKeys.length,
    activeUsers: userKeys.length,
    userUsage,
    modelUsed: 'Smart Local Responses',
    totalInteractions: cacheKeys.length
  };
}

// Clean expired cache
export function cleanChatCache() {
  chatCache.flushAll();
  console.log('Chat cache cleaned');
}

export default {
  processChatMessage,
  getChatStats,
  cleanChatCache
};