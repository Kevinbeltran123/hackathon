// Servicio offline para turistas sin datos
export class OfflineGameService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.cachedData = new Map();
    this.pendingSync = [];
    this.offlineStorage = 'rutas_vivas_offline';
    this.initializeOfflineSupport();
  }

  initializeOfflineSupport() {
    // Escuchar cambios de conectividad
    window.addEventListener('online', this.handleOnlineStatus.bind(this));
    window.addEventListener('offline', this.handleOfflineStatus.bind(this));

    // Cargar datos offline del localStorage
    this.loadOfflineData();

    // Registrar Service Worker para cache
    this.registerServiceWorker();
  }

  // Registrar Service Worker para funcionalidad offline
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registrado:', registration);
      } catch (error) {
        console.log('Error registrando Service Worker:', error);
      }
    }
  }

  handleOnlineStatus() {
    this.isOnline = true;
    this.syncPendingData();
  }

  handleOfflineStatus() {
    this.isOnline = false;
  }

  // Datos esenciales para funcionamiento offline
  getOfflineGameData() {
    return {
      zones: {
        centro_historico: {
          id: 'centro_historico',
          name: 'Centro Histórico',
          description: 'El corazón musical de Colombia',
          coordinates: { lat: 4.4389, lng: -75.2322 },
          missions: ['tutorial_plaza', 'history_walk'],
          points_of_interest: [
            {
              id: 'plaza_bolivar',
              name: 'Plaza de Bolívar',
              description: 'Plaza principal de la ciudad',
              historical_fact: 'Fundada en 1550, corazón de Ibagué',
              photo_spots: ['Estatua de Bolívar', 'Catedral de fondo'],
              offline_content: {
                audio_guide: 'plaza_bolivar_audio.mp3',
                images: ['plaza_day.jpg', 'plaza_night.jpg'],
                ar_markers: ['bolivar_statue', 'cathedral_view']
              }
            },
            {
              id: 'catedral_primada',
              name: 'Catedral Primada',
              description: 'Arquitectura colonial religiosa',
              historical_fact: 'Construida en el siglo XVI',
              offline_content: {
                audio_guide: 'catedral_audio.mp3',
                images: ['catedral_exterior.jpg', 'catedral_interior.jpg']
              }
            }
          ]
        },
        conservatorio: {
          id: 'conservatorio',
          name: 'Conservatorio del Tolima',
          description: 'Cuna de la música colombiana',
          coordinates: { lat: 4.4385, lng: -75.2315 },
          missions: ['musical_legends'],
          points_of_interest: [
            {
              id: 'conservatorio_main',
              name: 'Conservatorio Principal',
              description: 'Institución musical histórica',
              historical_fact: 'Fundado en 1906, primer conservatorio de Colombia',
              offline_content: {
                audio_guide: 'conservatorio_audio.mp3',
                music_samples: ['bunde_tolimense.mp3', 'bambuco_sample.mp3'],
                composer_stories: 'composers_stories.json'
              }
            }
          ]
        }
      },
      missions: {
        tutorial_plaza: {
          id: 'tutorial_plaza',
          title: 'Primeros Pasos en la Capital Musical',
          description: 'Descubre el corazón de Ibagué',
          objectives: [
            {
              id: 'visit_plaza',
              description: 'Visita la Plaza de Bolívar',
              type: 'location_visit',
              target_location: { lat: 4.4389, lng: -75.2322, radius: 50 },
              points: 50
            },
            {
              id: 'learn_history',
              description: 'Aprende sobre la historia',
              type: 'content_interaction',
              offline_trigger: 'read_historical_plaque',
              points: 100
            },
            {
              id: 'take_photo',
              description: 'Toma una foto memorable',
              type: 'photo_challenge',
              photo_requirements: ['include_statue', 'good_lighting'],
              points: 75
            }
          ],
          rewards: {
            points: 225,
            badge: 'Primer Explorador',
            unlocks: ['conservatorio_access']
          },
          offline_content: {
            narrative_audio: 'tutorial_narrative.mp3',
            hint_images: ['plaza_hint1.jpg', 'plaza_hint2.jpg']
          }
        }
      },
      power_ups: {
        points_x2: {
          id: 'points_x2',
          name: 'Multiplicador de Puntos x2',
          description: 'Duplica puntos por 1 hora',
          duration: 3600000,
          cost: 100,
          offline_available: true
        },
        offline_boost: {
          id: 'offline_boost',
          name: 'Explorador Offline',
          description: 'Bonus especial para modo offline',
          duration: 7200000,
          cost: 50,
          offline_exclusive: true,
          effects: ['double_discovery_points', 'enhanced_photo_rewards']
        }
      },
      pets: {
        ocobo_offline: {
          id: 'ocobo_offline',
          name: 'Ocobo Guardián',
          description: 'Tu compañero en adventures offline',
          abilities: ['offline_navigation', 'cached_content_finder'],
          evolution_stages: [
            {
              stage: 1,
              name: 'Ocobo Explorador',
              offline_abilities: ['basic_navigation', 'point_finder']
            }
          ]
        }
      }
    };
  }

  // Cargar datos offline del almacenamiento local
  loadOfflineData() {
    try {
      const stored = localStorage.getItem(this.offlineStorage);
      if (stored) {
        const data = JSON.parse(stored);
        this.cachedData = new Map(Object.entries(data));
      } else {
        // Primera vez - crear cache inicial
        this.createInitialOfflineCache();
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
      this.createInitialOfflineCache();
    }
  }

  createInitialOfflineCache() {
    const offlineData = this.getOfflineGameData();
    this.cacheData('game_data', offlineData);
    this.saveToLocalStorage();
  }

  // Cache de datos para uso offline
  cacheData(key, data) {
    this.cachedData.set(key, {
      data,
      timestamp: Date.now(),
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
    });
  }

  // Obtener datos del cache
  getCachedData(key) {
    const cached = this.cachedData.get(key);
    if (!cached) return null;

    // Verificar si los datos han expirado
    if (Date.now() > cached.expires) {
      this.cachedData.delete(key);
      return null;
    }

    return cached.data;
  }

  // Guardar en localStorage
  saveToLocalStorage() {
    try {
      const dataToStore = Object.fromEntries(this.cachedData);
      localStorage.setItem(this.offlineStorage, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Obtener misiones disponibles offline
  getOfflineMissions(userLocation, userLevel = 1) {
    const gameData = this.getCachedData('game_data');
    if (!gameData) return [];

    const availableMissions = [];
    
    Object.values(gameData.missions).forEach(mission => {
      // Verificar si la misión está disponible en la ubicación actual
      if (this.isMissionAvailable(mission, userLocation, userLevel)) {
        availableMissions.push({
          ...mission,
          offline_mode: true,
          estimated_data_usage: '0 MB',
          cached_content: true
        });
      }
    });

    return availableMissions;
  }

  isMissionAvailable(mission, userLocation, userLevel) {
    if (!mission.objectives || !userLocation) return false;

    // Verificar proximidad para misiones basadas en ubicación
    return mission.objectives.some(objective => {
      if (objective.type === 'location_visit' && objective.target_location) {
        const distance = this.calculateDistance(
          userLocation,
          objective.target_location
        );
        return distance <= (objective.target_location.radius || 100);
      }
      return true;
    });
  }

  calculateDistance(pos1, pos2) {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = pos1.lat * Math.PI / 180;
    const φ2 = pos2.lat * Math.PI / 180;
    const Δφ = (pos2.lat - pos1.lat) * Math.PI / 180;
    const Δλ = (pos2.lng - pos1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  // Completar objetivo offline
  completeOfflineObjective(missionId, objectiveId, data = {}) {
    const completionData = {
      missionId,
      objectiveId,
      completedAt: Date.now(),
      location: data.location,
      photo: data.photo,
      offline_mode: true,
      sync_pending: true
    };

    // Añadir a la cola de sincronización
    this.pendingSync.push({
      type: 'objective_completion',
      data: completionData,
      timestamp: Date.now()
    });

    // Guardar progreso local
    this.saveOfflineProgress(completionData);

    // Calcular recompensas inmediatas
    return this.calculateOfflineRewards(missionId, objectiveId);
  }

  saveOfflineProgress(progress) {
    const existingProgress = this.getCachedData('user_progress') || [];
    existingProgress.push(progress);
    this.cacheData('user_progress', existingProgress);
    this.saveToLocalStorage();
  }

  calculateOfflineRewards(missionId, objectiveId) {
    const gameData = this.getCachedData('game_data');
    const mission = gameData?.missions[missionId];
    const objective = mission?.objectives.find(obj => obj.id === objectiveId);

    if (!objective) return { points: 0 };

    // Bonus para modo offline
    const offlineBonus = 1.2; // 20% bonus por jugar offline
    const basePoints = objective.points || 50;
    const finalPoints = Math.floor(basePoints * offlineBonus);

    return {
      points: finalPoints,
      offline_bonus: Math.floor(basePoints * 0.2),
      badge: objective.id === 'take_photo' ? 'Fotógrafo Offline' : null,
      message: `¡${finalPoints} puntos ganados! (+20% bonus offline)`
    };
  }

  // Obtener lugares de interés cercanos
  getNearbyPOIs(userLocation, radius = 500) {
    const gameData = this.getCachedData('game_data');
    if (!gameData || !userLocation) return [];

    const nearbyPOIs = [];

    Object.values(gameData.zones).forEach(zone => {
      zone.points_of_interest?.forEach(poi => {
        if (poi.coordinates) {
          const distance = this.calculateDistance(userLocation, poi.coordinates);
          if (distance <= radius) {
            nearbyPOIs.push({
              ...poi,
              distance,
              zone: zone.name,
              offline_content_available: !!poi.offline_content
            });
          }
        }
      });
    });

    return nearbyPOIs.sort((a, b) => a.distance - b.distance);
  }

  // Obtener contenido offline para un POI
  getOfflinePOIContent(poiId) {
    const gameData = this.getCachedData('game_data');
    if (!gameData) return null;

    for (const zone of Object.values(gameData.zones)) {
      const poi = zone.points_of_interest?.find(p => p.id === poiId);
      if (poi && poi.offline_content) {
        return {
          ...poi.offline_content,
          poi_info: {
            name: poi.name,
            description: poi.description,
            historical_fact: poi.historical_fact,
            photo_spots: poi.photo_spots
          },
          offline_mode: true
        };
      }
    }

    return null;
  }

  // Sincronizar datos pendientes cuando vuelve la conexión
  async syncPendingData() {
    if (!this.isOnline || this.pendingSync.length === 0) return;

    console.log(`Sincronizando ${this.pendingSync.length} elementos pendientes...`);

    const successfulSync = [];
    const failedSync = [];

    for (const item of this.pendingSync) {
      try {
        await this.syncItem(item);
        successfulSync.push(item);
      } catch (error) {
        console.error('Error syncing item:', error);
        failedSync.push(item);
      }
    }

    // Remover elementos sincronizados exitosamente
    this.pendingSync = failedSync;

    // Actualizar almacenamiento
    this.saveToLocalStorage();

    return {
      synced: successfulSync.length,
      failed: failedSync.length,
      total: successfulSync.length + failedSync.length
    };
  }

  async syncItem(item) {
    // Simular llamada API para sincronizar
    // En implementación real, esto sería una llamada HTTP al servidor
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Synced item:', item.type);
        resolve();
      }, 1000);
    });
  }

  // Obtener estadísticas de uso offline
  getOfflineStats() {
    const progress = this.getCachedData('user_progress') || [];
    const offlineProgress = progress.filter(p => p.offline_mode);

    return {
      offline_sessions: offlineProgress.length,
      offline_points_earned: offlineProgress.reduce((sum, p) => sum + (p.points || 0), 0),
      pending_sync: this.pendingSync.length,
      cache_size: JSON.stringify(Object.fromEntries(this.cachedData)).length,
      last_sync: this.getCachedData('last_sync_time') || 'Never',
      offline_missions_completed: offlineProgress.filter(p => p.type === 'mission_complete').length
    };
  }

  // Preparar datos para turistas (pre-descarga)
  async prepareOfflinePackage(touristProfile) {
    const package_data = {
      user_profile: touristProfile,
      recommended_zones: this.getRecommendedZones(touristProfile),
      emergency_info: this.getEmergencyInfo(),
      transportation: this.getTransportationInfo(),
      basic_phrases: this.getBasicSpanishPhrases(),
      offline_maps: this.getOfflineMapData(),
      estimated_size: '15 MB'
    };

    // Cache del paquete offline
    this.cacheData('tourist_package', package_data);
    this.saveToLocalStorage();

    return package_data;
  }

  getRecommendedZones(profile) {
    const interests = profile.interests || ['culture', 'history'];
    const zones = this.getCachedData('game_data')?.zones || {};
    
    return Object.values(zones).filter(zone => 
      interests.some(interest => 
        zone.description.toLowerCase().includes(interest) ||
        zone.missions?.some(m => m.includes(interest))
      )
    );
  }

  getEmergencyInfo() {
    return {
      police: '123',
      medical: '125',
      fire: '119',
      tourist_police: '+57 8 261 1000',
      hospital: 'Hospital Federico Lleras Acosta',
      embassy_contacts: {
        us: '+57 1 275 2000',
        uk: '+57 1 326 8300',
        germany: '+57 1 423 2600'
      }
    };
  }

  getTransportationInfo() {
    return {
      taxi_apps: ['Uber', 'Didi', 'Taxis Libres'],
      bus_routes: ['Ruta Centro', 'Ruta Norte', 'Ruta Sur'],
      walking_distances: {
        'Centro to Conservatorio': '5 min',
        'Plaza to Zona Rosa': '8 min'
      }
    };
  }

  getBasicSpanishPhrases() {
    return {
      greetings: {
        'Hello': 'Hola',
        'Good morning': 'Buenos días',
        'Thank you': 'Gracias',
        'Excuse me': 'Disculpe'
      },
      directions: {
        'Where is...?': '¿Dónde está...?',
        'How much?': '¿Cuánto cuesta?',
        'I need help': 'Necesito ayuda'
      },
      emergencies: {
        'Help': 'Ayuda',
        'Call police': 'Llame a la policía',
        'I am lost': 'Estoy perdido/a'
      }
    };
  }

  getOfflineMapData() {
    return {
      center: { lat: 4.4389, lng: -75.2322 },
      zoom_levels: [12, 14, 16, 18],
      tiles_cached: 450,
      coverage_area: '10 km radius',
      points_of_interest: 25
    };
  }

  // Verificar si hay contenido offline disponible
  hasOfflineContent() {
    const gameData = this.getCachedData('game_data');
    return gameData && Object.keys(gameData).length > 0;
  }

  // Limpiar cache offline (para testing o problemas de espacio)
  clearOfflineCache() {
    this.cachedData.clear();
    localStorage.removeItem(this.offlineStorage);
    this.createInitialOfflineCache();
  }

  // Estado de conectividad
  getConnectivityStatus() {
    return {
      isOnline: this.isOnline,
      pendingSyncItems: this.pendingSync.length,
      lastSyncAttempt: this.getCachedData('last_sync_attempt'),
      offlineMode: !this.isOnline,
      cacheStatus: this.hasOfflineContent() ? 'ready' : 'empty'
    };
  }
}

// Exportar instancia singleton
export const offlineGameService = new OfflineGameService();