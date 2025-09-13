// Sistema de Misiones Gamificadas para Ibagué - Rutas Vivas
export class GameMissionsSystem {
  constructor() {
    this.missions = new Map();
    this.zones = new Map();
    this.powerUps = new Map();
    this.pets = new Map();
    this.bossBattles = new Map();
    this.playerProgress = {
      level: 1,
      experience: 0,
      unlockedZones: ['centro_historico'],
      completedMissions: [],
      currentStreak: 0,
      activePowerUps: [],
      pet: null,
      achievements: []
    };
    this.initializeGameSystem();
  }

  initializeGameSystem() {
    // Inicializar zonas del mapa estilo Candy Crush
    this.initializeZones();
    
    // Crear misiones narrativas
    this.initializeMissions();
    
    // Sistema de power-ups
    this.initializePowerUps();
    
    // Mascotas virtuales
    this.initializePets();
    
    // Boss battles en lugares emblemáticos
    this.initializeBossBattles();
  }

  initializeZones() {
    // Zona 1: Centro Histórico (Siempre desbloqueada)
    this.zones.set('centro_historico', {
      id: 'centro_historico',
      name: 'Centro Histórico',
      description: 'El corazón musical de Colombia',
      unlockLevel: 1,
      isUnlocked: true,
      backgroundImage: 'centro_historico_bg.png',
      color: '#E74C7C', // Rosa ocobo
      missions: ['tutorial_plaza', 'first_checkin', 'coffee_culture'],
      boss: 'guardian_plaza',
      coordinates: { x: 2, y: 2 },
      pathConnections: ['barrio_belen', 'zona_rosa'],
      visualEffects: {
        particles: 'musical_notes',
        aura: 'golden_glow',
        unlock_animation: 'rose_petals_fall'
      }
    });

    // Zona 2: Barrio Belén (Se desbloquea en nivel 3)
    this.zones.set('barrio_belen', {
      id: 'barrio_belen',
      name: 'Barrio Belén',
      description: 'Tradiciones que perduran',
      unlockLevel: 3,
      isUnlocked: false,
      backgroundImage: 'belen_bg.png',
      color: '#2D6C4F', // Verde bosque
      missions: ['family_traditions', 'tamales_quest', 'sunday_market'],
      boss: 'abuela_sabiduría',
      coordinates: { x: 1, y: 3 },
      pathConnections: ['centro_historico', 'jardin_botanico'],
      visualEffects: {
        particles: 'family_hearts',
        aura: 'warm_orange',
        unlock_animation: 'traditional_dance'
      }
    });

    // Zona 3: Zona Rosa (Se desbloquea en nivel 5)
    this.zones.set('zona_rosa', {
      id: 'zona_rosa',
      name: 'Zona Rosa',
      description: 'Modernidad y gastronomía',
      unlockLevel: 5,
      isUnlocked: false,
      backgroundImage: 'zona_rosa_bg.png',
      color: '#FFB020', // Dorado
      missions: ['gourmet_adventure', 'nightlife_explorer', 'social_butterfly'],
      boss: 'chef_supremo',
      coordinates: { x: 3, y: 2 },
      pathConnections: ['centro_historico', 'conservatorio'],
      visualEffects: {
        particles: 'golden_coins',
        aura: 'neon_lights',
        unlock_animation: 'champagne_celebration'
      }
    });

    // Zona 4: Conservatorio Musical (Se desbloquea en nivel 7)
    this.zones.set('conservatorio', {
      id: 'conservatorio',
      name: 'Conservatorio Musical',
      description: 'Melodías que trascienden',
      unlockLevel: 7,
      isUnlocked: false,
      backgroundImage: 'conservatorio_bg.png',
      color: '#8A2BE2', // Púrpura musical
      missions: ['musical_legends', 'composer_challenge', 'concert_master'],
      boss: 'maestro_eternal',
      coordinates: { x: 4, y: 1 },
      pathConnections: ['zona_rosa', 'mirador'],
      visualEffects: {
        particles: 'musical_symphony',
        aura: 'rainbow_notes',
        unlock_animation: 'piano_cascade'
      }
    });

    // Zona 5: Jardín Botánico (Se desbloquea en nivel 10)
    this.zones.set('jardin_botanico', {
      id: 'jardin_botanico',
      name: 'Jardín Botánico San Jorge',
      description: 'Naturaleza en armonía',
      unlockLevel: 10,
      isUnlocked: false,
      backgroundImage: 'jardin_bg.png',
      color: '#4CAF50', // Verde natura
      missions: ['eco_warrior', 'butterfly_dance', 'ancient_trees'],
      boss: 'spirit_nature',
      coordinates: { x: 1, y: 4 },
      pathConnections: ['barrio_belen', 'thermal_springs'],
      visualEffects: {
        particles: 'flower_petals',
        aura: 'nature_green',
        unlock_animation: 'tree_growth'
      }
    });

    // Zona 6: Mirador (Se desbloquea en nivel 15 - Zona Final)
    this.zones.set('mirador', {
      id: 'mirador',
      name: 'Mirador de Ibagué',
      description: 'La vista de los dioses',
      unlockLevel: 15,
      isUnlocked: false,
      backgroundImage: 'mirador_bg.png',
      color: '#FF6B6B', // Rojo atardecer
      missions: ['peak_conqueror', 'sunset_photographer', 'ibague_master'],
      boss: 'titan_montaña',
      coordinates: { x: 5, y: 0 },
      pathConnections: ['conservatorio'],
      visualEffects: {
        particles: 'golden_sunset',
        aura: 'mountain_mist',
        unlock_animation: 'eagle_soar'
      }
    });
  }

  initializeMissions() {
    // MISIÓN TUTORIAL - Centro Histórico
    this.missions.set('tutorial_plaza', {
      id: 'tutorial_plaza',
      title: '🎵 Primeros Pasos en la Capital Musical',
      description: 'Descubre el corazón de Ibagué',
      zone: 'centro_historico',
      type: 'tutorial',
      difficulty: 'easy',
      estimatedTime: '10 min',
      narrative: {
        intro: '¡Bienvenido aventurero! Tu viaje por la Capital Musical comienza en la histórica Plaza de Bolívar...',
        progression: [
          'Camina hasta el centro de la plaza y siente la historia bajo tus pies',
          'Toca la estatua de Bolívar para activar tu primera pista',
          'Escucha el eco de las campanas que han sonado durante siglos',
          'Haz check-in para completar tu primera misión'
        ],
        completion: '¡Felicitaciones! Has desbloqueado el poder del explorador. La música de Ibagué ahora corre por tus venas.'
      },
      objectives: [
        { id: 'visit_plaza', description: 'Visita la Plaza de Bolívar', completed: false, points: 50 },
        { id: 'checkin_plaza', description: 'Haz check-in en la plaza', completed: false, points: 100 },
        { id: 'take_photo', description: 'Toma una foto memorable', completed: false, points: 75 }
      ],
      rewards: {
        experience: 200,
        points: 225,
        unlocks: ['pet_ocobo_baby'],
        powerUps: ['points_x2_1h'],
        badge: 'Primer Explorador'
      },
      gameElements: {
        collectibles: ['nota_musical_plaza', 'moneda_historica'],
        visualEffects: ['golden_trail', 'musical_notes_spiral'],
        soundEffects: ['plaza_ambience', 'victory_fanfare']
      }
    });

    // MISIÓN NARRATIVA - El Tesoro Tolimense
    this.missions.set('tesoro_tolimense', {
      id: 'tesoro_tolimense',
      title: '💰 El Tesoro Tolimense Perdido',
      description: 'Una aventura épica a través de la historia',
      zone: 'multiple', // Misión que abarca múltiples zonas
      type: 'epic_quest',
      difficulty: 'legendary',
      estimatedTime: '3-4 horas',
      narrative: {
        intro: 'Cuenta la leyenda que los compositores de Ibagué escondieron un tesoro musical que contiene las melodías más hermosas jamás creadas...',
        chapters: [
          {
            title: 'El Mapa Secreto',
            location: 'centro_historico',
            story: 'En los archivos de la biblioteca encuentras un mapa antiguo...',
            challenge: 'Descifra las pistas musicales ocultas en la arquitectura colonial'
          },
          {
            title: 'La Llave de los Compositores',
            location: 'conservatorio',
            story: 'El conservatorio guarda secretos en cada nota...',
            challenge: 'Toca la melodía correcta en el piano encantado'
          },
          {
            title: 'El Guardián del Tesoro',
            location: 'mirador',
            story: 'En lo alto de la montaña, un guardián espera al digno...',
            challenge: 'Boss Battle contra el Titán de la Montaña'
          }
        ]
      },
      objectives: [
        { id: 'find_map', description: 'Encuentra el mapa en la biblioteca', completed: false, points: 300 },
        { id: 'solve_riddles', description: 'Resuelve 5 acertijos musicales', completed: false, points: 500 },
        { id: 'collect_keys', description: 'Recolecta 3 llaves de los compositores', completed: false, points: 800 },
        { id: 'defeat_guardian', description: 'Derrota al Guardián del Tesoro', completed: false, points: 1000 }
      ],
      rewards: {
        experience: 2000,
        points: 2600,
        unlocks: ['legendary_pet_condor', 'golden_avatar_skin'],
        powerUps: ['treasure_magnet', 'experience_x3_24h'],
        badge: 'Cazador de Tesoros Legendario',
        specialReward: 'Acceso VIP a eventos musicales reales'
      }
    });

    // MISIÓN GRUPAL - Raid Familiar
    this.missions.set('family_raid', {
      id: 'family_raid',
      title: '👨‍👩‍👧‍👦 Raid Familiar: Unidos por la Música',
      description: 'Misión cooperativa para familias',
      zone: 'multiple',
      type: 'group_raid',
      difficulty: 'medium',
      minPlayers: 2,
      maxPlayers: 6,
      estimatedTime: '1-2 horas',
      narrative: {
        intro: 'La música tiene el poder de unir corazones. Trabajen juntos para restaurar la armonía perdida de Ibagué...',
        cooperation: 'Cada miembro de la familia tiene un rol especial: Líder, Explorador, Fotógrafo, Músico...'
      },
      objectives: [
        { id: 'form_band', description: 'Formen su banda familiar', completed: false, points: 200 },
        { id: 'visit_venues', description: 'Visiten 4 lugares musicales juntos', completed: false, points: 400 },
        { id: 'group_photo', description: 'Tomen una foto grupal épica', completed: false, points: 300 },
        { id: 'harmonize', description: 'Completen el desafío de armonía grupal', completed: false, points: 500 }
      ],
      rewards: {
        experience: 800,
        points: 1400,
        unlocks: ['family_badge', 'group_avatar_frames'],
        powerUps: ['family_bonus_7d'],
        specialReward: 'Descuento familiar en restaurantes partner'
      }
    });
  }

  initializePowerUps() {
    this.powerUps.set('points_x2', {
      id: 'points_x2',
      name: '✨ Multiplicador de Puntos x2',
      description: 'Duplica tus puntos durante 1 hora',
      duration: 3600000, // 1 hora en ms
      effect: 'multiplier',
      value: 2,
      visualEffect: 'golden_sparkles',
      soundEffect: 'power_up_activate',
      rarity: 'common',
      cost: 100
    });

    this.powerUps.set('treasure_magnet', {
      id: 'treasure_magnet',
      name: '🧲 Imán de Cupones',
      description: 'Atrae cupones automáticamente por 30 min',
      duration: 1800000, // 30 min
      effect: 'auto_collect',
      value: 'coupons',
      visualEffect: 'magnetic_field',
      soundEffect: 'magnet_pull',
      rarity: 'rare',
      cost: 250
    });

    this.powerUps.set('streak_shield', {
      id: 'streak_shield',
      name: '🛡️ Escudo de Racha',
      description: 'Protege tu racha de check-ins por 1 día',
      duration: 86400000, // 24 horas
      effect: 'protection',
      value: 'streak',
      visualEffect: 'protective_aura',
      soundEffect: 'shield_activate',
      rarity: 'epic',
      cost: 500
    });

    this.powerUps.set('time_freeze', {
      id: 'time_freeze',
      name: '⏰ Congelación Temporal',
      description: 'Congela el tiempo para misiones urgentes',
      duration: 300000, // 5 min
      effect: 'time_extension',
      value: 900000, // +15 min extra
      visualEffect: 'time_crystals',
      soundEffect: 'time_freeze',
      rarity: 'legendary',
      cost: 1000
    });
  }

  initializePets() {
    this.pets.set('ocobo_baby', {
      id: 'ocobo_baby',
      name: 'Ocobo Bebé',
      species: 'Flor Ocobo',
      description: 'Una pequeña flor ocobo que crece con tus aventuras',
      rarity: 'common',
      evolutionStages: [
        {
          stage: 1,
          name: 'Brote Ocobo',
          appearance: 'small_pink_bud.png',
          checkinsRequired: 0,
          abilities: ['basic_companion']
        },
        {
          stage: 2,
          name: 'Ocobo Joven',
          appearance: 'young_pink_flower.png',
          checkinsRequired: 10,
          abilities: ['basic_companion', 'points_boost_5']
        },
        {
          stage: 3,
          name: 'Ocobo Adulto',
          appearance: 'mature_pink_flower.png',
          checkinsRequired: 25,
          abilities: ['basic_companion', 'points_boost_10', 'rare_item_finder']
        },
        {
          stage: 4,
          name: 'Ocobo Legendario',
          appearance: 'legendary_golden_ocobo.png',
          checkinsRequired: 50,
          abilities: ['basic_companion', 'points_boost_20', 'rare_item_finder', 'streak_protection']
        }
      ],
      personality: {
        happy: 'Brilla con intensidad rosa',
        excited: 'Libera pétalos dorados',
        tired: 'Se marchita ligeramente',
        proud: 'Despliega corona de luz'
      },
      interactions: [
        'Acariciar pétalos (+happiness)',
        'Regar con amor (+growth)',
        'Cantar juntos (+bond)',
        'Explorar lugares (+experience)'
      ]
    });

    this.pets.set('condor_musical', {
      id: 'condor_musical',
      name: 'Cóndor Musical',
      species: 'Ave Legendaria',
      description: 'Un majestuoso cóndor que lleva las melodías por los cielos',
      rarity: 'legendary',
      unlockRequirement: 'Complete epic quest "Tesoro Tolimense"',
      evolutionStages: [
        {
          stage: 1,
          name: 'Polluelo Alado',
          appearance: 'baby_condor.png',
          checkinsRequired: 0,
          abilities: ['flight_companion', 'aerial_view']
        },
        {
          stage: 2,
          name: 'Cóndor Aprendiz',
          appearance: 'young_condor.png',
          checkinsRequired: 20,
          abilities: ['flight_companion', 'aerial_view', 'weather_forecast']
        },
        {
          stage: 3,
          name: 'Cóndor Maestro',
          appearance: 'master_condor.png',
          checkinsRequired: 50,
          abilities: ['flight_companion', 'aerial_view', 'weather_forecast', 'hidden_locations']
        }
      ],
      specialAbilities: [
        'Vuela hacia lugares ocultos',
        'Predice el clima para planear aventuras',
        'Encuentra eventos especiales desde el cielo'
      ]
    });
  }

  initializeBossBattles() {
    this.bossBattles.set('guardian_plaza', {
      id: 'guardian_plaza',
      name: 'Guardián de la Plaza',
      title: 'Protector de la Historia',
      zone: 'centro_historico',
      description: 'Un espíritu ancestral que protege los secretos de la plaza',
      difficulty: 'normal',
      requiredLevel: 5,
      appearance: {
        model: 'spectral_guardian.png',
        animations: ['float', 'pulse_aura', 'history_whispers'],
        aura: 'golden_historical'
      },
      battleMechanics: {
        type: 'knowledge_challenge',
        phases: [
          {
            phase: 1,
            challenge: 'Responde 3 preguntas sobre la historia de Ibagué',
            timeLimit: 60,
            difficulty: 'easy'
          },
          {
            phase: 2,
            challenge: 'Encuentra 5 elementos históricos en AR',
            timeLimit: 90,
            difficulty: 'medium'
          },
          {
            phase: 3,
            challenge: 'Recrea la melodía del himno de Ibagué',
            timeLimit: 120,
            difficulty: 'hard'
          }
        ]
      },
      rewards: {
        experience: 500,
        points: 800,
        unlocks: ['guardian_blessing', 'historical_avatar'],
        rare_items: ['ancient_coin', 'history_scroll'],
        achievement: 'Conquistador de la Historia'
      },
      defeatQuotes: [
        'Has demostrado ser digno de conocer nuestros secretos...',
        'La historia de Ibagué ahora vive en ti, joven explorador.',
        'Lleva estas melodías ancestrales con honor.'
      ]
    });

    this.bossBattles.set('maestro_eternal', {
      id: 'maestro_eternal',
      name: 'Maestro Eterno',
      title: 'El Compositor Inmortal',
      zone: 'conservatorio',
      description: 'La esencia de todos los grandes compositores tolimenses',
      difficulty: 'legendary',
      requiredLevel: 15,
      appearance: {
        model: 'eternal_composer.png',
        animations: ['conduct_orchestra', 'note_spiral', 'harmony_wave'],
        aura: 'rainbow_musical'
      },
      battleMechanics: {
        type: 'musical_duel',
        phases: [
          {
            phase: 1,
            challenge: 'Identifica 10 melodías colombianas',
            timeLimit: 180,
            difficulty: 'expert'
          },
          {
            phase: 2,
            challenge: 'Crea tu propia composición',
            timeLimit: 300,
            difficulty: 'master'
          },
          {
            phase: 3,
            challenge: 'Duelo musical épico final',
            timeLimit: 240,
            difficulty: 'legendary'
          }
        ],
        specialMechanics: [
          'El Maestro cambia de estilo musical cada minuto',
          'Debes adaptar tu estrategia a ritmos cambiantes',
          'Los errores musicales te hacen perder puntos de vida'
        ]
      },
      rewards: {
        experience: 2000,
        points: 3000,
        unlocks: ['composer_crown', 'musical_mastery_title'],
        legendary_items: ['eternal_baton', 'melody_crystal'],
        achievement: 'Maestro de la Música Eterna',
        specialReward: 'Acceso a masterclass exclusiva con músicos reales'
      }
    });
  }

  // MÉTODOS DE GAMEPLAY

  // Verificar si una zona puede desbloquearse
  canUnlockZone(zoneId, playerLevel) {
    const zone = this.zones.get(zoneId);
    if (!zone) return false;
    
    return playerLevel >= zone.unlockLevel && !zone.isUnlocked;
  }

  // Desbloquear nueva zona con efectos especiales
  unlockZone(zoneId, playerLevel) {
    if (!this.canUnlockZone(zoneId, playerLevel)) {
      return { success: false, reason: 'Level requirement not met or already unlocked' };
    }

    const zone = this.zones.get(zoneId);
    zone.isUnlocked = true;
    this.playerProgress.unlockedZones.push(zoneId);

    return {
      success: true,
      zone: zone,
      unlockAnimation: zone.visualEffects.unlock_animation,
      celebrationEffects: [
        'screen_flash_gold',
        'confetti_explosion',
        'triumphant_music'
      ],
      rewards: {
        experience: zone.unlockLevel * 100,
        points: zone.unlockLevel * 150,
        title: `Explorador de ${zone.name}`
      }
    };
  }

  // Activar power-up
  activatePowerUp(powerUpId) {
    const powerUp = this.powerUps.get(powerUpId);
    if (!powerUp) return { success: false, reason: 'Power-up not found' };

    const activePowerUp = {
      ...powerUp,
      activatedAt: Date.now(),
      expiresAt: Date.now() + powerUp.duration
    };

    this.playerProgress.activePowerUps.push(activePowerUp);

    return {
      success: true,
      powerUp: activePowerUp,
      visualEffect: powerUp.visualEffect,
      soundEffect: powerUp.soundEffect,
      message: `${powerUp.name} activado por ${powerUp.duration / 60000} minutos!`
    };
  }

  // Evolucionar mascota
  evolvePet(petId, checkinsCount) {
    const pet = this.pets.get(petId);
    if (!pet) return { success: false, reason: 'Pet not found' };

    // Encontrar la siguiente etapa de evolución
    const currentStage = pet.evolutionStages.find(stage => 
      checkinsCount >= stage.checkinsRequired &&
      (pet.evolutionStages.indexOf(stage) === pet.evolutionStages.length - 1 ||
       checkinsCount < pet.evolutionStages[pet.evolutionStages.indexOf(stage) + 1]?.checkinsRequired)
    );

    if (!currentStage) return { success: false, reason: 'No evolution available' };

    return {
      success: true,
      newStage: currentStage,
      evolutionAnimation: 'pet_evolution_spiral',
      celebrationEffects: ['hearts_explosion', 'sparkle_shower'],
      newAbilities: currentStage.abilities,
      message: `¡${pet.name} ha evolucionado a ${currentStage.name}!`
    };
  }

  // Iniciar boss battle
  startBossBattle(bossId, playerLevel) {
    const boss = this.bossBattles.get(bossId);
    if (!boss) return { success: false, reason: 'Boss not found' };
    
    if (playerLevel < boss.requiredLevel) {
      return { 
        success: false, 
        reason: `Necesitas nivel ${boss.requiredLevel} para enfrentar a ${boss.name}` 
      };
    }

    return {
      success: true,
      boss: boss,
      battleIntro: {
        animation: 'boss_appears',
        music: 'epic_battle_theme',
        dialogue: `${boss.name} aparece ante ti con una aura ${boss.appearance.aura}!`
      },
      firstPhase: boss.battleMechanics.phases[0]
    };
  }

  // Obtener misiones disponibles para una zona
  getAvailableMissions(zoneId, playerLevel, completedMissions = []) {
    const zone = this.zones.get(zoneId);
    if (!zone || !zone.isUnlocked) return [];

    return zone.missions
      .map(missionId => this.missions.get(missionId))
      .filter(mission => 
        mission && 
        !completedMissions.includes(mission.id) &&
        (mission.requiredLevel || 1) <= playerLevel
      );
  }

  // Sistema de streaks y efectos visuales
  updateStreak(newCheckIn) {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    // Verificar si el check-in mantiene la racha
    if (this.playerProgress.lastCheckIn && 
        now - this.playerProgress.lastCheckIn <= oneDayMs * 1.5) { // 1.5 días de tolerancia
      this.playerProgress.currentStreak++;
    } else {
      this.playerProgress.currentStreak = 1;
    }

    this.playerProgress.lastCheckIn = now;

    // Efectos visuales por streak
    let streakEffects = [];
    if (this.playerProgress.currentStreak >= 30) {
      streakEffects = ['legendary_fire_aura', 'golden_crown', 'epic_fanfare'];
    } else if (this.playerProgress.currentStreak >= 14) {
      streakEffects = ['fire_trail', 'flame_aura', 'power_music'];
    } else if (this.playerProgress.currentStreak >= 7) {
      streakEffects = ['sparks_trail', 'energy_glow', 'success_chime'];
    } else if (this.playerProgress.currentStreak >= 3) {
      streakEffects = ['star_sparkles', 'warm_glow'];
    }

    return {
      currentStreak: this.playerProgress.currentStreak,
      visualEffects: streakEffects,
      bonusMultiplier: Math.min(this.playerProgress.currentStreak * 0.1, 2.0), // Max 200% bonus
      message: `¡Racha de ${this.playerProgress.currentStreak} días! Bonus: ${Math.round((Math.min(this.playerProgress.currentStreak * 0.1, 2.0)) * 100)}%`
    };
  }

  // Generar mapa visual estilo Candy Crush
  generateGameMap() {
    const mapData = {
      zones: Array.from(this.zones.values()).map(zone => ({
        ...zone,
        isAccessible: zone.isUnlocked || this.canUnlockZone(zone.id, this.playerProgress.level),
        glowEffect: zone.isUnlocked ? 'available_glow' : 'locked_dim',
        pathAnimations: zone.isUnlocked ? 'flowing_energy' : 'dormant_path'
      })),
      playerAvatar: {
        position: this.getCurrentPlayerPosition(),
        level: this.playerProgress.level,
        experience: this.playerProgress.experience,
        activePowerUps: this.playerProgress.activePowerUps,
        pet: this.getActivePet(),
        visualEffects: this.getPlayerVisualEffects()
      },
      activeEvents: this.getActiveEvents(),
      treasure_chests: this.generateTreasureChests(),
      collectibles: this.getVisibleCollectibles()
    };

    return mapData;
  }

  getCurrentPlayerPosition() {
    // Lógica para determinar la posición actual del jugador en el mapa
    const lastUnlockedZone = this.playerProgress.unlockedZones[this.playerProgress.unlockedZones.length - 1];
    const zone = this.zones.get(lastUnlockedZone);
    return zone ? zone.coordinates : { x: 2, y: 2 }; // Default centro
  }

  getPlayerVisualEffects() {
    const effects = [];
    
    // Efectos por streak
    if (this.playerProgress.currentStreak >= 7) {
      effects.push('fire_aura');
    }
    
    // Efectos por power-ups activos
    this.playerProgress.activePowerUps.forEach(powerUp => {
      effects.push(powerUp.visualEffect);
    });
    
    // Efectos por level
    if (this.playerProgress.level >= 15) {
      effects.push('legendary_crown');
    } else if (this.playerProgress.level >= 10) {
      effects.push('golden_glow');
    }
    
    return effects;
  }

  // Sistema de eventos temporales
  getActiveEvents() {
    const now = new Date();
    const events = [];
    
    // Evento fin de semana
    if (now.getDay() === 0 || now.getDay() === 6) {
      events.push({
        id: 'weekend_bonus',
        name: '🎉 Bonificación de Fin de Semana',
        description: 'Puntos x1.5 en todas las actividades',
        multiplier: 1.5,
        visualEffect: 'weekend_party',
        duration: 'until_monday'
      });
    }
    
    // Evento música en vivo (viernes por la noche)
    if (now.getDay() === 5 && now.getHours() >= 18) {
      events.push({
        id: 'live_music_night',
        name: '🎵 Noche de Música en Vivo',
        description: 'Misiones especiales en lugares con música',
        specialMissions: ['street_musician_quest', 'concert_photographer'],
        visualEffect: 'musical_notes_rain',
        duration: '6_hours'
      });
    }
    
    return events;
  }
}

export const gameMissionsSystem = new GameMissionsSystem();