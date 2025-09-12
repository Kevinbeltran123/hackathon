import db from '../db.js';
import NodeCache from 'node-cache';

// Cache for responses and rate limiting
const chatCache = new NodeCache({ stdTTL: parseInt(process.env.CHAT_CACHE_TTL_HOURS || 6) * 3600 });
const userLimits = new NodeCache({ stdTTL: 86400 }); // 24 hours

const MAX_MESSAGES_PER_DAY = parseInt(process.env.MAX_CHAT_MESSAGES_PER_DAY || 50);

// Comprehensive knowledge base about Ibagué
const IBAGUE_KNOWLEDGE = `
# GUÍA TURÍSTICA DE IBAGUÉ - CAPITAL MUSICAL DE COLOMBIA

## Historia y Cultura
Ibagué es la capital del departamento del Tolima, conocida como la "Capital Musical de Colombia" y "Ciudad de los Parques".
Fundada en 1550, es la cuna del Bambuco y centro cultural de la región.

## Lugares Emblemáticos
- Plaza de Bolívar: Corazón histórico de la ciudad, lugar perfecto para caminatas y fotografías
- Conservatorio del Tolima: Institución musical más importante de la región
- Teatro Tolima: Principal escenario cultural con espectáculos y obras teatrales
- Catedral Primada: Importante patrimonio arquitectónico religioso
- Panóptico de Ibagué: Antigua cárcel convertida en museo histórico

## Naturaleza y Parques
- Jardín Botánico San Jorge: Especies nativas del Tolima, ideal para aprender sobre biodiversidad
- Mirador Cerro de San Javier: Vista panorámica de toda la ciudad, perfecto para atardeceres
- Parque Centenario: Espacio urbano para ejercicio y actividades familiares

## Gastronomía Típica
- Tamales Tolimenses: Plato tradicional con pollo, cerdo y verduras
- Sancocho de Gallina: Sopa tradicional de la región
- Lechona: Cerdo relleno típico de celebraciones
- Café del Tolima: Reconocido mundialmente por su calidad

## Comercio Local y Artesanías
- Mercado Tradicional La 21: Productos locales, frutas tropicales y comida típica
- Centro Comercial La Estación: Ubicado en la antigua estación del tren
- Artesanías en guadua y cestería
- Tejidos y bordados tradicionales

## Música y Festivales
- Festival Nacional del Folclor: Celebración anual más importante
- Festival de la Música Colombiana: Evento cultural destacado
- Bambucos y pasillos: Ritmos tradicionales de la región
- Trova y música andina: Patrimonio cultural inmaterial

## Consejos para Turistas
- Mejor época: Todo el año (clima cálido)
- Transporte: Terminal de transportes para conexiones regionales
- Moneda: Peso colombiano
- Idioma: Español
- Hospitalidad: Los ibaguereños son conocidos por su amabilidad

## Actividades Recomendadas
- Caminatas históricas por el centro
- Visitas a museos y galerías
- Tours gastronómicos
- Senderismo en cerros cercanos
- Participación en talleres culturales
`;

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

// Build context-aware prompt
function buildPrompt(message, context = {}) {
  const { userLocation, nearbyPlaces, activeRoute, activities } = context;
  
  let contextInfo = '';
  
  if (nearbyPlaces && nearbyPlaces.length > 0) {
    contextInfo += `\n\nLugares cercanos al usuario:\n`;
    nearbyPlaces.forEach(place => {
      contextInfo += `- ${place.name}: ${place.description || 'Lugar verificado'}\n`;
    });
  }
  
  if (activities && activities.length > 0) {
    contextInfo += `\n\nActividades disponibles ahora:\n`;
    activities.forEach(activity => {
      contextInfo += `- ${activity.title} en ${activity.place_name} (${activity.duration} min)\n`;
    });
  }
  
  if (activeRoute && activeRoute.length > 0) {
    contextInfo += `\n\nRuta actual del usuario:\n`;
    activeRoute.forEach((item, index) => {
      contextInfo += `${index + 1}. ${item.title || item.name}\n`;
    });
  }

  return `Eres un guía turístico experto de Ibagué, Colombia. Responde de manera amigable, útil y en español colombiano natural.

${IBAGUE_KNOWLEDGE}

${contextInfo}

INSTRUCCIONES:
- Mantén respuestas concisas (máximo 200 palabras)
- Usa emojis ocasionalmente para ser más amigable
- Promueve el turismo local y responsable
- Sugiere hacer check-ins en lugares visitados
- Si no sabes algo, sugiere lugares relacionados que sí conoces
- Enfócate en experiencias auténticas de Ibagué

Pregunta del turista: ${message}

Respuesta:`;
}

// This function is kept for potential future Groq integration
function buildPrompt(message, context = {}) {
  // Future implementation placeholder
  return message;
}

// Generate contextual fallback responses without AI
function generateContextualFallback(message, context = {}) {
  const msg = message.toLowerCase();
  
  // Location-specific responses
  if (context.nearbyPlaces && context.nearbyPlaces.length > 0) {
    const nearbyPlace = context.nearbyPlaces[0];
    if (msg.includes('cerca') || msg.includes('actividad')) {
      return `¡Perfecto! Estás cerca de ${nearbyPlace.name}. ${nearbyPlace.description || 'Es un lugar muy interesante para visitar'}. ¿Te gustaría hacer check-in aquí? 📍`;
    }
  }
  
  // Question-specific responses
  if (msg.includes('comer') || msg.includes('comida') || msg.includes('restaurante')) {
    return '🍽️ Para comida típica tolimense te recomiendo probar los famosos tamales tolimenses, sancocho de gallina y lechona. En el Mercado La 21 encontrarás auténtica gastronomía local. ¡No olvides hacer check-in al visitarlo!';
  }
  
  if (msg.includes('historia') || msg.includes('cultura')) {
    return '🏛️ Ibagué tiene una rica historia como Capital Musical de Colombia. Te recomiendo visitar la Plaza de Bolívar (corazón histórico), el Conservatorio del Tolima y el Panóptico convertido en museo. ¡Cada lugar tiene su propia historia fascinante!';
  }
  
  if (msg.includes('música') || msg.includes('musical')) {
    return '🎵 ¡Ibagué es la Capital Musical de Colombia! El Conservatorio del Tolima es donde nacen los grandes músicos. También puedes disfrutar del Festival Nacional del Folclor y escuchar bambucos y pasillos auténticos. ¿Te interesa algún lugar musical específico?';
  }
  
  if (msg.includes('naturaleza') || msg.includes('parque') || msg.includes('aire libre')) {
    return '🌿 Para conectar con la naturaleza, visita el Jardín Botánico San Jorge con especies nativas del Tolima, o el Mirador Cerro de San Javier para vistas panorámicas. El Parque Centenario es perfecto para caminatas familiares.';
  }
  
  if (msg.includes('actividad') || msg.includes('hacer') || msg.includes('plan')) {
    return '🎯 Hay muchas actividades geniales en Ibagué: tours históricos, talleres culturales, senderismo, degustaciones gastronómicas y conciertos. ¿Qué tipo de experiencia buscas? ¿Cultural, gastronómica o al aire libre?';
  }
  
  // Default contextual response
  const activities = context.activities || [];
  if (activities.length > 0) {
    const activity = activities[0];
    return `🎪 Ahora mismo hay actividades disponibles como "${activity.title}" en ${activity.place_name}. ¡Una gran oportunidad para vivir Ibagué de manera auténtica! ¿Te interesa participar?`;
  }
  
  // Generic helpful response
  return `¡Bienvenido a Ibagué, la Capital Musical de Colombia! 🎵 

Te puedo ayudar con:
• 📍 Lugares emblemáticos para visitar
• 🍽️ Gastronomía típica tolimense  
• 🎭 Actividades culturales disponibles
• 🌿 Espacios naturales y parques
• 🏛️ Historia y patrimonio local

¿Qué te gustaría descubrir de nuestra hermosa ciudad?`;
}

// Main chat function (Smart local responses + optional AI)
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

  // Check cache for common responses
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

  // Use smart contextual fallback (works great without AI!)
  const contextualResponse = generateContextualFallback(message, enrichedContext);
  chatCache.set(cacheKey, contextualResponse);
  
  return {
    success: true,
    message: contextualResponse,
    isDemo: !process.env.GROQ_API_KEY
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
    modelUsed: 'Smart Contextual Responses',
    groqEnabled: !!process.env.GROQ_API_KEY
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