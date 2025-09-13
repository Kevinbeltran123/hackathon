import { useState, useRef, useEffect, useCallback } from 'react';
import { sendChatMessage } from '../lib/api.js';
import { useRoute } from '../store/store.js';
import { storytellingEngine } from './StorytellingEngine.js';

export default function TourGuideChat({ userLocation, userPoints = 0, lastCheckIn = null, currentActivity = null, onPointsUpdate = null, onCheckInUpdate = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showProactiveMessage, setShowProactiveMessage] = useState(false);
  const [contextualSuggestions, setContextualSuggestions] = useState([]);
  const [storyMode, setStoryMode] = useState(false);
  const [userId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const lastContextRef = useRef(null);
  const { items: activeRoute } = useRoute();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Contextual AI response system
  const generateContextualResponse = useCallback((context) => {
    const responses = {
      checkIn: [
        `¡Excelente! Has hecho check-in. Te recomiendo explorar los alrededores y buscar el lugar perfecto para una foto 📸`,
        `¿Sabías que donde estás tiene una historia fascinante? Te puedo contar sobre este lugar mientras exploras.`,
        `¡Perfecto timing! Hay actividades especiales cerca de tu ubicación que podrían interesarte.`
      ],
      pointsEarned: [
        `¡Felicitaciones! Has ganado ${context.points} puntos. ¿Te gustaría saber qué experiencias puedes desbloquear?`,
        `Con ${context.totalPoints} puntos acumulados, ya puedes acceder a experiencias premium. ¿Quieres que te muestre las opciones?`,
        `¡Increíble progreso! Estás a solo ${context.nextReward - context.totalPoints} puntos de tu próxima recompensa especial.`
      ],
      nearPlace: [
        `Estás muy cerca de ${context.placeName}. ¿Te gustaría que te cuente la historia de este lugar?`,
        `¡Qué coincidencia! ${context.placeName} tiene eventos especiales hoy. ¿Quieres que te informe?`,
        `Dato curioso sobre ${context.placeName}: ${context.funFact || 'Es uno de los lugares más fotografiados de Ibagué'}`
      ],
      timeOfDay: {
        morning: '¡Buenos días! Es el momento perfecto para visitar el centro histórico antes de que lleguen las multitudes.',
        afternoon: 'La tarde es ideal para disfrutar de un café en la Plaza de Bolívar y observar la vida local.',
        evening: '¡Qué hermoso atardecer! Te recomiendo el Mirador para capturar la ciudad iluminada.'
      }
    };
    
    return responses[context.type]?.[Math.floor(Math.random() * responses[context.type].length)] || 
           responses.timeOfDay[context.timeOfDay] || null;
  }, []);

  // Proactive interaction triggers
  const triggerProactiveMessage = useCallback((context) => {
    const response = generateContextualResponse(context);
    if (response && !showProactiveMessage) {
      setShowProactiveMessage(true);
      setTimeout(() => {
        const proactiveMsg = {
          id: Date.now(),
          type: 'bot',
          content: response,
          timestamp: new Date(),
          isProactive: true,
          context: context.type
        };
        setMessages(prev => [...prev, proactiveMsg]);
        setShowProactiveMessage(false);
      }, 2000);
    }
  }, [generateContextualResponse, showProactiveMessage]);

  // Context monitoring
  useEffect(() => {
    const currentContext = {
      userLocation,
      userPoints,
      lastCheckIn,
      currentActivity,
      timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'
    };

    // Detect context changes
    if (lastContextRef.current) {
      const prev = lastContextRef.current;
      
      // Check-in detected
      if (lastCheckIn && (!prev.lastCheckIn || lastCheckIn.timestamp !== prev.lastCheckIn.timestamp)) {
        triggerProactiveMessage({ type: 'checkIn', place: lastCheckIn.place });
        
        // Update check-in integration
        if (onCheckInUpdate) {
          onCheckInUpdate(lastCheckIn);
        }
      }
      
      // Points increase detected
      if (userPoints > prev.userPoints) {
        triggerProactiveMessage({ 
          type: 'pointsEarned', 
          points: userPoints - prev.userPoints,
          totalPoints: userPoints,
          nextReward: Math.ceil(userPoints / 100) * 100
        });
        
        // Trigger wallet integration
        if (onPointsUpdate) {
          onPointsUpdate(userPoints, 'chat_interaction');
        }
      }
      
      // Location change near interesting place
      if (userLocation && prev.userLocation) {
        const distance = calculateDistance(userLocation, prev.userLocation);
        if (distance > 0.1) { // 100m threshold
          const nearbyPlace = findNearbyPlace(userLocation);
          if (nearbyPlace) {
            triggerProactiveMessage({ 
              type: 'nearPlace', 
              placeName: nearbyPlace.name,
              funFact: nearbyPlace.funFact
            });
          }
        }
      }
    }
    
    lastContextRef.current = currentContext;
  }, [userLocation, userPoints, lastCheckIn, currentActivity, triggerProactiveMessage]);

  // Utility functions
  const calculateDistance = (loc1, loc2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const findNearbyPlace = (location) => {
    const places = [
      { name: 'Plaza de Bolívar', lat: 4.4389, lng: -75.2322, funFact: 'Es el corazón histórico de Ibagué desde 1550' },
      { name: 'Catedral Primada', lat: 4.4392, lng: -75.2319, funFact: 'Su campanario es visible desde toda la ciudad' },
      { name: 'Conservatorio', lat: 4.4385, lng: -75.2315, funFact: 'Cuna de grandes músicos colombianos' },
      { name: 'Parque de la Música', lat: 4.4380, lng: -75.2330, funFact: 'Escenario de los festivales más importantes' }
    ];
    
    return places.find(place => {
      const distance = calculateDistance(location, place);
      return distance < 0.2; // 200m radius
    });
  };

  // Dynamic contextual suggestions
  useEffect(() => {
    const updateContextualSuggestions = () => {
      const hour = new Date().getHours();
      const baseQuestions = [
        "¿Qué lugares puedo visitar cerca?",
        "Cuéntame una historia de este lugar",
        "¿Qué actividades hay disponibles?"
      ];
      
      const contextualQuestions = [];
      
      if (hour >= 6 && hour < 11) {
        contextualQuestions.push("¿Dónde desayunar típico?", "¿Qué lugares abren temprano?");
      } else if (hour >= 11 && hour < 15) {
        contextualQuestions.push("¿Dónde almorzar comida tradicional?", "¿Hay tours disponibles ahora?");
      } else if (hour >= 15 && hour < 19) {
        contextualQuestions.push("¿Dónde tomar café?", "¿Qué lugares tienen buena vista?");
      } else {
        contextualQuestions.push("¿Qué hacer en la noche?", "¿Dónde escuchar música en vivo?");
      }
      
      if (userPoints >= 100) {
        contextualQuestions.push("¿Qué experiencias premium puedo desbloquear?");
      }
      
      if (activeRoute.length > 0) {
        contextualQuestions.push("Optimiza mi ruta actual", "¿Cuánto tiempo necesito para mi ruta?");
      }
      
      setContextualSuggestions([...baseQuestions, ...contextualQuestions]);
    };
    
    updateContextualSuggestions();
    const interval = setInterval(updateContextualSuggestions, 300000); // Update every 5 minutes
    
    return () => clearInterval(interval);
  }, [userPoints, activeRoute.length]);

  // Initial welcome message with context
  useEffect(() => {
    if (messages.length === 0) {
      const hour = new Date().getHours();
      let greeting = '¡Hola!';
      
      if (hour >= 6 && hour < 12) greeting = '¡Buenos días!';
      else if (hour >= 12 && hour < 19) greeting = '¡Buenas tardes!';
      else greeting = '¡Buenas noches!';
      
      const welcomeMessage = `${greeting} Soy tu guía turístico virtual de Ibagué 🎵 

Estoy aquí para ayudarte a descubrir nuestra hermosa Capital Musical de Colombia. Puedo contarte historias, recomendarte lugares, y ayudarte a sacar el máximo provecho de tu visita.

¿En qué puedo ayudarte hoy?`;
      
      setMessages([{
        id: 1,
        type: 'bot',
        content: welcomeMessage,
        timestamp: new Date(),
        isWelcome: true
      }]);
    }
  }, [messages.length]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMsg = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Enhanced context with intelligent assistance features
      const context = {
        userId,
        lat: userLocation?.lat,
        lng: userLocation?.lng,
        userPoints,
        lastCheckIn,
        currentActivity,
        storyMode,
        timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening',
        activeRoute: activeRoute.map(item => ({
          title: item.title || item.name,
          place_name: item.place_name
        })),
        conversationHistory: messages.slice(-5).map(m => ({ type: m.type, content: m.content })),
        // Decision assistance context
        needsAssistance: {
          routePlanning: inputMessage.toLowerCase().includes('ruta') || inputMessage.toLowerCase().includes('itinerario'),
          budgetHelp: inputMessage.toLowerCase().includes('precio') || inputMessage.toLowerCase().includes('costo'),
          timeOptimization: inputMessage.toLowerCase().includes('tiempo') || inputMessage.toLowerCase().includes('rápido'),
          groupCoordination: inputMessage.toLowerCase().includes('grupo') || inputMessage.toLowerCase().includes('familia'),
          accessibility: inputMessage.toLowerCase().includes('acceso') || inputMessage.toLowerCase().includes('discapacidad'),
          emergency: inputMessage.toLowerCase().includes('emergencia') || inputMessage.toLowerCase().includes('ayuda')
        },
        // Smart recommendations based on current situation
        smartContext: {
          weather: 'sunny', // Could be fetched from weather API
          crowdLevel: 'medium',
          nearbyEvents: [], // Could be fetched from events API
          personalPreferences: ['culture', 'music', 'food'], // Could be learned from user behavior
          walletBalance: userPoints,
          checkinStreak: 5 // Could be calculated from check-in history
        }
      };

      const response = await sendChatMessage(userMsg.content, context);
      
      let content = response.message;
      
      // Enhanced intelligent responses
      let enhancementType = 'standard';
      
      if (inputMessage.toLowerCase().includes('historia') || inputMessage.toLowerCase().includes('cuéntame')) {
        setStoryMode(true);
        content = `🎭 **Modo Historia Activado**\n\n${content}\n\n*¿Te gustaría que continúe con más detalles históricos o prefieres explorar otro aspecto?*`;
        enhancementType = 'story';
      } else if (inputMessage.toLowerCase().includes('puntos') || inputMessage.toLowerCase().includes('recompensa')) {
        content = `💎 **Centro de Recompensas**\n\n${content}\n\n*Tienes **${userPoints} puntos**. Puedes usarlos en el Marketplace para experiencias premium, cupones gastronómicos o tours exclusivos.*`;
        enhancementType = 'rewards';
      } else if (inputMessage.toLowerCase().includes('cerca') || inputMessage.toLowerCase().includes('dónde')) {
        content = `📍 **Asistente de Ubicación**\n\n${content}\n\n*Recomendación personalizada basada en tu ubicación, hora del día y preferencias.*`;
        enhancementType = 'location';
      } else if (context.needsAssistance.routePlanning) {
        content = `🗺️ **Planificador de Rutas**\n\n${content}\n\n*💡 Tip: Puedo optimizar tu ruta según tiempo disponible, interés y nivel de energía. ¿Quieres que cree un itinerario personalizado?*`;
        enhancementType = 'planning';
      } else if (context.needsAssistance.groupCoordination) {
        content = `👥 **Coordinador Grupal**\n\n${content}\n\n*📱 Funciones disponibles: Compartir ubicación en tiempo real, crear grupos de chat, dividir costos, y votar destinos. ¿Quieres activar el modo grupo?*`;
        enhancementType = 'group';
      } else if (context.needsAssistance.emergency) {
        content = `🆘 **Asistencia de Emergencia**\n\n${content}\n\n*📞 Servicios disponibles: Emergencias médicas (123), Policía (112), Bomberos (119), Cruz Roja Tolima (8-277-2727). ¿Necesitas que contacte alguno?*`;
        enhancementType = 'emergency';
      }
      
      const botMsg = {
        id: Date.now() + 1,
        type: 'bot',
        content,
        timestamp: new Date(),
        isDemo: response.isDemo,
        fromCache: response.fromCache,
        isFallback: response.isFallback,
        tokensUsed: response.tokensUsed,
        hasEnhancement: enhancementType !== 'standard',
        enhancementType
      };

      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error('Chat error:', error);
      
      // Intelligent fallback responses based on context
      const fallbackResponses = [
        `Lo siento, tengo problemas de conexión. Mientras tanto, te recomiendo visitar el centro histórico de Ibagué 🏛️`,
        `Ups, problemas técnicos. ¿Sabías que puedes explorar la Plaza de Bolívar mientras se restablece la conexión? 🎵`,
        `Conectividad intermitente. Te sugiero caminar hacia la Catedral Primada, un lugar perfecto para fotos 📸`,
        `Error temporal. Aprovecha para descubrir los murales urbanos en el centro mientras me reconecto 🎨`
      ];
      
      const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      const errorMsg = {
        id: Date.now() + 1,
        type: 'bot',
        content: randomFallback,
        timestamp: new Date(),
        isError: true,
        isFallback: true
      };

      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Toggle story mode
  const toggleStoryMode = () => {
    setStoryMode(!storyMode);
    const modeMsg = {
      id: Date.now(),
      type: 'bot',
      content: storyMode 
        ? '📖 Modo historia desactivado. Volveré a respuestas concisas.'
        : '🎭 ¡Modo historia activado! Te contaré relatos detallados y fascinantes sobre cada lugar.',
      timestamp: new Date(),
      isSystemMessage: true
    };
    setMessages(prev => [...prev, modeMsg]);
  };

  // Story activation system
  const [activeStory, setActiveStory] = useState(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [availableStories, setAvailableStories] = useState([]);
  
  // Initialize available stories based on location
  useEffect(() => {
    if (userLocation) {
      const nearbyStories = [];
      
      // Check if user is near Plaza de Bolívar
      const plazaDistance = calculateDistance(userLocation, { lat: 4.4389, lng: -75.2322 });
      if (plazaDistance < 0.2) {
        nearbyStories.push({
          id: 'plaza_bolivar',
          name: 'Historia de la Plaza de Bolívar',
          distance: plazaDistance,
          estimatedTime: '12-15 min',
          difficulty: 'Básico'
        });
      }
      
      // Check if user is near Conservatorio
      const conservatorioDistance = calculateDistance(userLocation, { lat: 4.4385, lng: -75.2315 });
      if (conservatorioDistance < 0.2) {
        nearbyStories.push({
          id: 'conservatorio',
          name: 'Leyendas del Conservatorio',
          distance: conservatorioDistance,
          estimatedTime: '7-8 min',
          difficulty: 'Intermedio'
        });
      }
      
      setAvailableStories(nearbyStories);
    }
  }, [userLocation]);
  
  // Start interactive story
  const startStory = (storyId) => {
    const story = storytellingEngine.getStory(storyId, {
      userPoints,
      interests: ['music', 'history'],
      timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'
    });
    
    if (story) {
      setActiveStory(story);
      setStoryProgress(0);
      setStoryMode(true);
      
      const storyIntroMsg = {
        id: Date.now(),
        type: 'bot',
        content: `🎭 **Historia Interactiva Iniciada**\n\n${story.personalizedIntro}\n\n**Capítulo 1:** ${story.chapters[0].title}\n\n${story.chapters[0].content}\n\n*Duración estimada: ${story.chapters[0].duration}*`,
        timestamp: new Date(),
        isStory: true,
        storyData: {
          id: storyId,
          chapter: 0,
          totalChapters: story.chapters.length,
          progress: 0
        }
      };
      
      setMessages(prev => [...prev, storyIntroMsg]);
    }
  };
  
  // Continue story to next chapter
  const continueStory = () => {
    if (activeStory && storyProgress < activeStory.chapters.length - 1) {
      const nextChapter = storyProgress + 1;
      setStoryProgress(nextChapter);
      
      const nextChapterMsg = {
        id: Date.now(),
        type: 'bot',
        content: `📖 **Capítulo ${nextChapter + 1}:** ${activeStory.chapters[nextChapter].title}\n\n${activeStory.chapters[nextChapter].content}\n\n*Duración: ${activeStory.chapters[nextChapter].duration}*`,
        timestamp: new Date(),
        isStory: true,
        storyData: {
          id: activeStory.id,
          chapter: nextChapter,
          totalChapters: activeStory.chapters.length,
          progress: Math.round(((nextChapter + 1) / activeStory.chapters.length) * 100)
        }
      };
      
      setMessages(prev => [...prev, nextChapterMsg]);
      
      // Check if story is complete
      if (nextChapter === activeStory.chapters.length - 1) {
        setTimeout(() => {
          const completionMsg = {
            id: Date.now() + 1,
            type: 'bot',
            content: `🎉 **¡Historia Completada!**\n\nHas ganado **${activeStory.rewards.points} puntos** y desbloqueado el logro "${activeStory.rewards.badge}".\n\n✨ **Historias recomendadas:**\n${activeStory.recommendedNext?.map(rec => `• ${rec.title} (${rec.estimatedDuration})`).join('\n') || 'Explora más lugares para descubrir nuevas historias'}`,
            timestamp: new Date(),
            isStoryComplete: true,
            rewards: activeStory.rewards
          };
          setMessages(prev => [...prev, completionMsg]);
          setActiveStory(null);
        }, 1000);
      }
    }
  };
  
  // Cultural experience starter
  const startCulturalExperience = (experienceId) => {
    const experience = storytellingEngine.getCulturalExperience(experienceId, {
      interests: ['food', 'culture'],
      dietaryRestrictions: [],
      spiceLevel: 'medium'
    });
    
    if (experience) {
      const experienceMsg = {
        id: Date.now(),
        type: 'bot',
        content: `🍽️ **Experiencia Cultural: ${experience.title}**\n\n${experience.personalizedExperiences[0]?.story}\n\n**🏠 Mejores lugares:**\n${experience.personalizedExperiences[0]?.bestPlaces.join(', ')}\n\n**💡 Tips culturales:**\n${experience.culturalTips?.slice(0, 2).join('\n') || 'Disfruta con respeto por las tradiciones locales'}`,
        timestamp: new Date(),
        isCultural: true,
        culturalData: experience
      };
      
      setMessages(prev => [...prev, experienceMsg]);
    }
  };

  // Enhanced quick action buttons
  const quickActions = [
    {
      icon: '🎭',
      label: storyMode ? 'Salir de historia' : 'Modo historia',
      action: storyMode ? () => {setStoryMode(false); setActiveStory(null);} : toggleStoryMode
    },
    {
      icon: '📍',
      label: 'Lugares cerca',
      action: () => setInputMessage('¿Qué lugares interesantes hay cerca de mi ubicación?')
    },
    {
      icon: '💎',
      label: 'Mis puntos',
      action: () => setInputMessage(`Tengo ${userPoints} puntos, ¿qué puedo hacer con ellos?`)
    },
    {
      icon: '🎵',
      label: 'Música en vivo',
      action: () => setInputMessage('¿Dónde puedo escuchar música en vivo hoy?')
    }
  ];
  
  // Story and cultural quick actions
  const storyActions = [
    ...availableStories.map(story => ({
      icon: '📚',
      label: story.name,
      action: () => startStory(story.id),
      subtitle: `${Math.round(story.distance * 1000)}m • ${story.estimatedTime}`
    })),
    {
      icon: '🍽️',
      label: 'Sabores de Ibagué',
      action: () => startCulturalExperience('gastronomy_journey'),
      subtitle: 'Experiencia gastronómica'
    }
  ];

  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 transition-all duration-300 flex items-center justify-center text-2xl ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
        title={isOpen ? 'Cerrar chat' : 'Chat con guía turístico'}
      >
        {isOpen ? '✕' : showProactiveMessage ? '💬' : '🎵'}
      </button>

      {/* Proactive Message Indicator */}
      {showProactiveMessage && !isOpen && (
        <div className="fixed bottom-24 right-6 w-80 max-w-[calc(100vw-2rem)] bg-blue-500 text-white p-3 rounded-xl shadow-lg z-45 animate-bounce">
          <p className="text-sm font-medium">💡 ¡Tengo algo interesante que contarte!</p>
          <button 
            onClick={() => setIsOpen(true)}
            className="text-xs text-blue-100 hover:text-white underline mt-1"
          >
            Abrir chat →
          </button>
        </div>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[500px] bg-white rounded-2xl shadow-2xl z-40 flex flex-col border border-gray-200">
          
          {/* Enhanced Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              {storyMode ? '🎭' : '🎵'}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg flex items-center gap-2">
                Guía de Ibagué
                {storyMode && <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Historia</span>}
              </h3>
              <p className="text-blue-100 text-sm">
                {userPoints > 0 ? `${userPoints} puntos • ` : ''}Capital Musical de Colombia
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
            >
              ✕
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : msg.isError
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : msg.isProactive
                      ? 'bg-gradient-to-r from-green-50 to-blue-50 text-gray-800 border border-green-200'
                      : msg.hasEnhancement
                      ? 'bg-gradient-to-r from-purple-50 to-blue-50 text-gray-800 border border-purple-200'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content.split('\n').map((line, index) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <p key={index} className="font-bold text-gray-900 mb-2">{line.slice(2, -2)}</p>;
                      }
                      if (line.startsWith('*') && line.endsWith('*')) {
                        return <p key={index} className="italic text-gray-600 text-xs mt-1">{line.slice(1, -1)}</p>;
                      }
                      return <p key={index} className={line ? 'mb-1' : 'mb-2'}>{line}</p>;
                    })}
                  </div>
                  
                  {/* Story Progress Bar */}
                  {msg.isStory && msg.storyData && (
                    <div className="mt-3 p-2 bg-purple-50 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-purple-600 font-medium">
                          Capítulo {msg.storyData.chapter + 1} de {msg.storyData.totalChapters}
                        </span>
                        <span className="text-xs text-purple-600">{msg.storyData.progress}%</span>
                      </div>
                      <div className="w-full bg-purple-200 rounded-full h-1.5">
                        <div 
                          className="bg-purple-600 h-1.5 rounded-full transition-all duration-500" 
                          style={{ width: `${(msg.storyData.chapter + 1) / msg.storyData.totalChapters * 100}%` }}
                        ></div>
                      </div>
                      {activeStory && storyProgress < activeStory.chapters.length - 1 && (
                        <button
                          onClick={continueStory}
                          className="mt-2 text-xs bg-purple-600 text-white px-3 py-1 rounded-full hover:bg-purple-700 transition-colors"
                        >
                          Continuar historia →
                        </button>
                      )}
                    </div>
                  )}
                  
                  {/* Story Completion Rewards */}
                  {msg.isStoryComplete && msg.rewards && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-yellow-50 to-green-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🏆</span>
                        <span className="font-bold text-green-700">¡Logro Desbloqueado!</span>
                      </div>
                      <p className="text-sm text-green-600 mb-1">
                        <strong>{msg.rewards.badge}</strong>
                      </p>
                      <p className="text-xs text-green-500">
                        +{msg.rewards.points} puntos ganados
                      </p>
                    </div>
                  )}
                  
                  {/* Cultural Experience Elements */}
                  {msg.isCultural && msg.culturalData && (
                    <div className="mt-3 p-2 bg-orange-50 rounded-lg">
                      <div className="text-xs text-orange-600 font-medium mb-1">
                        🌟 Experiencia Cultural Activa
                      </div>
                      <div className="text-xs text-orange-500">
                        Explora los lugares mencionados para desbloquear contenido adicional
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mt-1 opacity-70">
                    <span className="text-xs">
                      {formatTime(msg.timestamp)}
                    </span>
                    
                    {msg.isDemo && (
                      <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">
                        Demo
                      </span>
                    )}
                    
                    {msg.fromCache && (
                      <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
                        Caché
                      </span>
                    )}
                    
                    {msg.isProactive && (
                      <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
                        💡 Proactivo
                      </span>
                    )}
                    
                    {msg.hasEnhancement && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        msg.enhancementType === 'story' ? 'bg-purple-200 text-purple-800' :
                        msg.enhancementType === 'rewards' ? 'bg-yellow-200 text-yellow-800' :
                        msg.enhancementType === 'location' ? 'bg-blue-200 text-blue-800' :
                        msg.enhancementType === 'planning' ? 'bg-green-200 text-green-800' :
                        msg.enhancementType === 'group' ? 'bg-pink-200 text-pink-800' :
                        msg.enhancementType === 'emergency' ? 'bg-red-200 text-red-800' :
                        'bg-purple-200 text-purple-800'
                      }`}>
                        {
                          msg.enhancementType === 'story' ? '🎭 Historia' :
                          msg.enhancementType === 'rewards' ? '💎 Puntos' :
                          msg.enhancementType === 'location' ? '📍 Ubicación' :
                          msg.enhancementType === 'planning' ? '🗺️ Planificación' :
                          msg.enhancementType === 'group' ? '👥 Grupo' :
                          msg.enhancementType === 'emergency' ? '🆘 Emergencia' :
                          '✨ Mejorado'
                        }
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">Escribiendo...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Quick Actions with Stories */}
          {!isLoading && (
            <div className="px-4 pb-2 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-600">
                  {activeStory ? 'Historia activa:' : 'Acciones rápidas:'}
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={toggleStoryMode}
                    className={`text-xs px-2 py-1 rounded-full transition-colors ${
                      storyMode 
                        ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}
                  >
                    {storyMode ? '🎭 Historia ON' : '📖 Historia OFF'}
                  </button>
                  {availableStories.length > 0 && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full border border-green-200">
                      {availableStories.length} historia{availableStories.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Story Actions */}
              {storyMode && availableStories.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-purple-600 mb-1 font-medium">📚 Historias disponibles aquí:</p>
                  <div className="flex flex-wrap gap-1">
                    {storyActions.filter(action => action.icon === '📚').map((action, index) => (
                      <button
                        key={`story-${index}`}
                        onClick={action.action}
                        className="text-xs bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-200 transition-all duration-200 hover:shadow-sm flex flex-col items-start min-w-0 flex-1"
                      >
                        <div className="flex items-center gap-1 w-full">
                          <span>{action.icon}</span>
                          <span className="font-medium truncate">{action.label}</span>
                        </div>
                        <span className="text-xs text-purple-500 mt-0.5">{action.subtitle}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Cultural Experiences */}
              {storyMode && (
                <div className="mb-3">
                  <p className="text-xs text-orange-600 mb-1 font-medium">🌟 Experiencias culturales:</p>
                  <div className="flex flex-wrap gap-1">
                    {storyActions.filter(action => action.icon === '🍽️').map((action, index) => (
                      <button
                        key={`cultural-${index}`}
                        onClick={action.action}
                        className="text-xs bg-gradient-to-r from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 text-orange-700 px-3 py-1 rounded-full border border-orange-200 transition-all duration-200 hover:shadow-sm flex items-center gap-1"
                      >
                        <span>{action.icon}</span>
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Regular Actions */}
              <div className="flex flex-wrap gap-1">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="text-xs bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 text-gray-700 px-3 py-1 rounded-full border border-blue-200 transition-all duration-200 hover:shadow-sm flex items-center gap-1"
                  >
                    <span>{action.icon}</span>
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Contextual Suggestions */}
          {messages.length <= 2 && !isLoading && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-600 mb-2">Sugerencias personalizadas:</p>
              <div className="flex flex-wrap gap-1">
                {contextualSuggestions.slice(0, 4).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-xs bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 text-purple-700 px-3 py-1 rounded-full border border-purple-200 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Pregúntame sobre Ibagué..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  '➤'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}