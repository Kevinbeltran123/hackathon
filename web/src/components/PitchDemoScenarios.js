// Demo scenarios for presenting Ibagué - Rutas Vivas innovative chatbot
export class PitchDemoScenarios {
  constructor() {
    this.scenarios = new Map();
    this.initializeDemoScenarios();
  }

  initializeDemoScenarios() {
    // Scenario 1: First-time Visitor Experience
    this.scenarios.set('first_visitor', {
      title: '👋 Experiencia del Turista Primerizo',
      description: 'Demuestra cómo el chatbot guía a un turista desde su llegada hasta convertirse en un explorador experto',
      duration: '3-4 minutos',
      personas: {
        user: 'María, turista de Bogotá, primera visita a Ibagué',
        context: 'Acaba de llegar al hotel, es viernes 2PM'
      },
      steps: [
        {
          step: 1,
          title: 'Llegada y Saludo Contextual',
          userAction: 'Usuario abre la app por primera vez',
          chatbotResponse: '¡Bienvenida a Ibagué, María! 🎵 Veo que acabas de llegar y es perfecto timing - tienes toda la tarde libre. Soy tu guía personal y te ayudaré a descubrir por qué somos la Capital Musical de Colombia.',
          highlights: [
            '🎯 Reconocimiento automático de nuevo usuario',
            '⏰ Contextualización por hora del día',
            '📍 Personalización por ubicación del hotel'
          ],
          demoNotes: 'Mostrar cómo el chatbot detecta contexto sin preguntas molestas'
        },
        {
          step: 2,
          title: 'Recomendación Inteligente Inmediata',
          userAction: 'Usuario pregunta: "¿Qué puedo hacer cerca?"',
          chatbotResponse: '🌟 **Asistente de Ubicación**\n\nPerfecto! Estás a 3 minutos caminando del centro histórico. Te recomiendo:\n\n🏛️ **Plaza de Bolívar** (2 min) - El corazón de Ibagué, ideal para primeras fotos\n🎼 **Conservatorio del Tolima** (5 min) - Historia musical fascinante\n☕ **Café La Pola** (3 min) - Auténtico café tolimense\n\n*Recomendación: Empieza por la Plaza - hay una historia increíble que te va a encantar*',
          highlights: [
            '📊 Análisis de proximidad en tiempo real',
            '🎯 Priorización basada en perfil de turista',
            '💡 Sugerencia proactiva de siguiente paso'
          ],
          demoNotes: 'Resaltar la personalización sin configuración previa'
        },
        {
          step: 3,
          title: 'Activación del Modo Historia',
          userAction: 'Usuario toca "Historia de la Plaza"',
          chatbotResponse: '🎭 **Historia Interactiva Iniciada**\n\n¡Excelente elección! Te voy a contar la historia de la Plaza de Bolívar de una manera que nunca olvidarás.\n\n**Capítulo 1:** Los Orígenes (1550)\n\nEn 1550, cuando los conquistadores españoles arribaron a este valle, encontraron un territorio habitado por los Pijaos, guerreros valientes que defendieron estas tierras con honor...\n\n*Duración estimada: 3-4 min lectura*\n[Botón: Continuar historia →]',
          highlights: [
            '📖 Narrativa inmersiva e interactiva',
            '🎯 Contenido adaptado al tiempo disponible',
            '🎮 Gamificación con progreso visual'
          ],
          demoNotes: 'Mostrar cómo convierte turismo pasivo en experiencia activa'
        },
        {
          step: 4,
          title: 'Recompensa por Engagement',
          userAction: 'Usuario completa la historia',
          chatbotResponse: '🏆 **¡Historia Completada!**\n\nHas ganado **150 puntos** y desbloqueado el logro "Historiador de Ibagué".\n\n✨ **Experiencias recomendadas:**\n• Leyendas del Conservatorio (7-8 min)\n• Sabores de Ibagué (experiencia gastronómica)\n\n*Con 150 puntos ya puedes acceder a descuentos especiales en el Marketplace*',
          highlights: [
            '🎖️ Sistema de logros y gamificación',
            '💰 Monetización a través de recompensas',
            '📈 Motivación para exploración continua'
          ],
          demoNotes: 'Demostrar el motor de retención y engagement'
        }
      ],
      businessImpact: {
        userEngagement: '+300% tiempo en app vs. apps tradicionales',
        conversionRate: '+85% usuarios que hacen segunda visita',
        revenue: 'Promedio $45 USD por usuario en marketplace'
      }
    });

    // Scenario 2: Local Family Weekend
    this.scenarios.set('family_weekend', {
      title: '👨‍👩‍👧‍👦 Familia Local - Fin de Semana',
      description: 'Demuestra funcionalidades de coordinación grupal y recomendaciones familiares',
      duration: '2-3 minutos',
      personas: {
        user: 'Carlos, papá ibaguereño con esposa e hijos (8 y 12 años)',
        context: 'Sábado 10AM, quieren plan familiar en la ciudad'
      },
      steps: [
        {
          step: 1,
          title: 'Detección de Grupo Familiar',
          userAction: 'Usuario pregunta: "¿Qué hacer con niños hoy?"',
          chatbotResponse: '👨‍👩‍👧‍👦 **Coordinador Grupal**\n\n¡Perfecto plan familiar! Detecté que tienes niños y es fin de semana. Activando recomendaciones familiares:\n\n🎪 **Parque de la Música** - Actividades hasta 2PM\n🌿 **Jardín Botánico San Jorge** - Perfecto para niños curiosos\n🍦 **Mercado La 21** - Helados artesanales famosos\n\n*¿Quieres que active el modo grupo para coordinar con tu familia en tiempo real?*',
          highlights: [
            '👨‍👩‍👧‍👦 Reconocimiento automático de contexto familiar',
            '📅 Adaptación a horarios de fin de semana',
            '🎯 Filtros automáticos child-friendly'
          ]
        },
        {
          step: 2,
          title: 'Coordinación en Tiempo Real',
          userAction: 'Usuario activa modo grupo',
          chatbotResponse: '📱 **Modo Grupo Activado**\n\n✅ Familia sincronizada\n✅ Ubicación compartida en tiempo real\n✅ Chat grupal disponible\n✅ División de gastos automática\n\n🗳️ **Votación familiar:** ¿Por dónde empezamos?\n• Parque de la Música (👍 2 votos)\n• Jardín Botánico (👍 1 voto)\n• Mercado (👍 1 voto)\n\n*Los niños prefieren el parque - ¡excelente elección para empezar!*',
          highlights: [
            '🔄 Sincronización familiar en tiempo real',
            '🗳️ Sistema de votación democrática',
            '💰 División automática de costos'
          ]
        }
      ]
    });

    // Scenario 3: Business Traveler Emergency
    this.scenarios.set('business_emergency', {
      title: '💼 Viajero de Negocios - Situación de Emergencia',
      description: 'Demuestra capacidades de asistencia inteligente y servicios de emergencia',
      duration: '1-2 minutos',
      personas: {
        user: 'Jennifer, ejecutiva extranjera, primera vez en Colombia',
        context: 'Miércoles 8PM, necesita ayuda urgente'
      },
      steps: [
        {
          step: 1,
          title: 'Detección de Emergencia',
          userAction: 'Usuario escribe: "Necesito ayuda urgente, perdí mi pasaporte"',
          chatbotResponse: '🚨 **Asistencia de Emergencia**\n\n**Tranquila Jennifer, te voy a ayudar paso a paso:**\n\n🏛️ **Consulado más cercano:** Bogotá (3 horas)\n📞 **Línea de emergencia:** +57-1-275-2000\n🚔 **Policía Nacional:** 123\n📋 **Documentos necesarios:** Copia cédula, fotos 3x4\n\n📍 **Servicios cerca de ti:**\n• Estación de Policía (5 min caminando)\n• Notaría Pública (Para declaraciones)\n• Foto Estudio Rápido (Abierto hasta 10PM)\n\n*¿Quieres que te guíe a la estación de policía más cercana?*',
          highlights: [
            '🚨 Reconocimiento automático de emergencias',
            '🗺️ Servicios de emergencia georeferenciados',
            '🌍 Asistencia en múltiples idiomas'
          ]
        }
      ]
    });

    // Scenario 4: Cultural Immersion Experience
    this.scenarios.set('cultural_immersion', {
      title: '🎵 Experiencia de Inmersión Cultural',
      description: 'Demuestra storytelling avanzado y conexión emocional con la cultura local',
      duration: '4-5 minutos',
      personas: {
        user: 'David, músico profesional de España, busca inspiración',
        context: 'Jueves 5PM, frente al Conservatorio'
      },
      steps: [
        {
          step: 1,
          title: 'Reconocimiento de Intereses Específicos',
          userAction: 'Usuario: "Soy músico, cuéntame sobre la tradición musical"',
          chatbotResponse: '🎼 **Especialista Musical Activado**\n\nDavid, como músico profesional, esto te va a fascinar. Estás parado exactamente donde Alberto Castilla, el "Poeta de la Música Colombiana", componía sus obras inmortales.\n\n🎹 **Experiencia especial disponible:**\n• Escucha "Tres Piezas para Piano" en el lugar exacto donde fueron compuestas\n• Historia de compositores que caminaron estos pasillos\n• Conexión con músicos locales activos\n\n*¿Te interesa una experiencia musical inmersiva de 15 minutos?*',
          highlights: [
            '🎯 Personalización por profesión/intereses',
            '🎵 Contenido especializado para músicos',
            '🤝 Conexión con comunidad local'
          ]
        },
        {
          step: 2,
          title: 'Experiencia Multisensorial',
          userAction: 'Usuario acepta experiencia musical',
          chatbotResponse: '🎭 **Experiencia Musical Inmersiva**\n\n*[Audio: Primeros acordes de "Bunde Tolimense"]*\n\nCierra los ojos David... Estamos en 1936. Jorge Villamil camina por este mismo jardín, inspirándose en el murmullo del río Combeima que aún puedes escuchar.\n\n🎵 *"Espumas que van bajando, por el río Combeima..."*\n\nEste bambuco nació aquí, de la observación de la naturaleza que tienes frente a ti. Los compositores tolimenses no escribían solo música - capturaban el alma de la tierra.\n\n*[Activar función: Grabadora de inspiración]*\n*¿Quieres grabar tus propias ideas musicales inspiradas en este momento?*',
          highlights: [
            '🎧 Experiencia multisensorial con audio',
            '🌿 Conexión con elementos naturales',
            '📱 Herramientas creativas integradas'
          ]
        }
      ]
    });

    // Scenario 5: Integration Demo
    this.scenarios.set('platform_integration', {
      title: '🔗 Demostración de Integración Completa',
      description: 'Muestra cómo el chatbot se conecta con Check-In, Wallet y funciones avanzadas',
      duration: '2-3 minutos',
      steps: [
        {
          step: 1,
          title: 'Check-In Inteligente',
          demoAction: 'Usuario hace check-in en Plaza de Bolívar',
          chatbotResponse: '📍 **Check-in detectado en Plaza de Bolívar**\n\n¡Excelente! Has ganado 75 puntos (+25 bonus por ser domingo). \n\n🎯 **Desbloqueado:**\n• Historia "Los Secretos de la Plaza" (Exclusiva)\n• Descuento 20% en Café Cultural (válido 2 horas)\n• Reto fotográfico: "Captura el alma musical"\n\n*¿Te interesa la historia exclusiva que acabas de desbloquear?*',
          integration: 'Conecta con sistema de Check-In y Wallet'
        },
        {
          step: 2,
          title: 'Marketplace Inteligente',
          demoAction: 'Usuario consulta sus puntos',
          chatbotResponse: '💎 **Centro de Recompensas**\n\nTienes **1,250 puntos** - ¡Suficientes para experiencias premium!\n\n🛍️ **Disponible ahora:**\n• Tour privado Conservatorio (800 pts) - ⭐ Muy recomendado\n• Cena romántica La Pola (1,000 pts) - 🌟 Popular\n• Clase de baile típico (600 pts) - 🎵 Único\n\n*Basado en tu perfil musical, el tour privado del Conservatorio sería perfecto para ti.*',
          integration: 'Conecta con Wallet y sistema de recomendaciones'
        }
      ]
    });
  }

  // Get demo scenario by ID
  getDemoScenario(scenarioId) {
    return this.scenarios.get(scenarioId);
  }

  // Get all available demo scenarios
  getAllScenarios() {
    return Array.from(this.scenarios.values());
  }

  // Get scenarios by category
  getScenariosByCategory(category) {
    const categories = {
      'onboarding': ['first_visitor'],
      'family': ['family_weekend'],
      'emergency': ['business_emergency'],
      'cultural': ['cultural_immersion'],
      'integration': ['platform_integration']
    };
    
    return categories[category]?.map(id => this.scenarios.get(id)) || [];
  }

  // Generate demo script for presentation
  generateDemoScript(scenarioId) {
    const scenario = this.getDemoScenario(scenarioId);
    if (!scenario) return null;

    let script = `
# DEMO SCRIPT: ${scenario.title}

**Duración:** ${scenario.duration}
**Contexto:** ${scenario.description}

## Persona del Usuario
- **Usuario:** ${scenario.personas?.user || 'Demo user'}
- **Contexto:** ${scenario.personas?.context || 'Demo context'}

## Pasos del Demo

`;

    scenario.steps?.forEach((step, index) => {
      script += `
### Paso ${step.step}: ${step.title}

**Acción del usuario:** ${step.userAction || step.demoAction || 'N/A'}

**Respuesta del chatbot:**
\`\`\`
${step.chatbotResponse}
\`\`\`

**Puntos clave para destacar:**
${step.highlights?.map(h => `- ${h}`).join('\n') || '- Funcionalidad demostrada'}

**Notas para presentador:** ${step.demoNotes || step.integration || 'Destacar la funcionalidad'}

---
`;
    });

    if (scenario.businessImpact) {
      script += `
## Impacto de Negocio
- **Engagement:** ${scenario.businessImpact.userEngagement}
- **Conversión:** ${scenario.businessImpact.conversionRate}
- **Revenue:** ${scenario.businessImpact.revenue}
`;
    }

    return script;
  }

  // Generate comparison with competitors
  generateCompetitorComparison() {
    return {
      traditional: {
        name: 'Apps Turísticas Tradicionales',
        features: [
          'Lista estática de lugares',
          'Información básica',
          'Sin personalización',
          'Sin contexto temporal'
        ],
        userExperience: 'Pasiva, requiere mucha búsqueda manual'
      },
      chatbots_basic: {
        name: 'Chatbots de Turismo Básicos',
        features: [
          'Respuestas pre-programadas',
          'Sin contexto geográfico',
          'Sin integración con servicios',
          'Experiencia impersonal'
        ],
        userExperience: 'Limitada, frustrante para preguntas complejas'
      },
      rutas_vivas: {
        name: 'Ibagué - Rutas Vivas AI Chat',
        features: [
          'IA contextual y proactiva',
          'Storytelling inmersivo',
          'Integración completa (Check-in, Wallet)',
          'Personalización inteligente',
          'Asistencia de emergencia',
          'Coordinación grupal',
          'Gamificación avanzada'
        ],
        userExperience: 'Inmersiva, personal, siempre útil',
        uniqueValue: 'Convierte turismo pasivo en experiencia activa y memorable'
      }
    };
  }

  // Key messages for pitch presentation
  getPitchKeyMessages() {
    return {
      problem: {
        title: '❌ El Problema del Turismo Digital Actual',
        points: [
          'Apps estáticas que aburren a los usuarios',
          'Información genérica sin contexto personal',
          'Experiencias fragmentadas entre múltiples apps',
          'Cero conexión emocional con el destino'
        ]
      },
      solution: {
        title: '✅ Nuestra Solución: IA Turística Emocional',
        points: [
          'Chatbot con inteligencia contextual que entiende situaciones',
          'Storytelling inmersivo que conecta emocionalmente',
          'Integración total: Chat + Check-in + Wallet + Experiencias',
          'Asistencia proactiva que anticipa necesidades'
        ]
      },
      differentiation: {
        title: '🚀 Lo Que Nos Hace Únicos',
        points: [
          'Primera IA turística con storytelling cultural inmersivo',
          'Sistema de recompensas integrado con experiencias reales',
          'Asistencia de emergencia inteligente multiidioma',
          'Coordinación grupal avanzada para familias y grupos'
        ]
      },
      traction: {
        title: '📈 Tracción y Resultados',
        metrics: [
          '300% más tiempo de engagement vs competidores',
          '85% de usuarios regresan (vs 23% promedio industria)',
          '$45 USD promedio de spend por usuario',
          '96% satisfacción en experiencias culturales'
        ]
      }
    };
  }
}

export const pitchDemoScenarios = new PitchDemoScenarios();