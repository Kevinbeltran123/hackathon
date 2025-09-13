export class StorytellingEngine {
  constructor() {
    this.stories = new Map();
    this.culturalNarrations = new Map();
    this.interactiveElements = new Map();
    this.initializeStories();
  }

  initializeStories() {
    // Historical narratives of Ibagué
    this.stories.set('plaza_bolivar', {
      title: 'La Plaza de Bolívar: Corazón de Tres Siglos',
      chapters: [
        {
          id: 'origins',
          title: 'Los Orígenes (1550)',
          content: `🏛️ **El Nacimiento de una Ciudad**\n\nEn 1550, cuando los conquistadores españoles arribaron al valle del Magdalena, encontraron un territorio habitado por los Pijaos, guerreros valientes que defendieron estas tierras con honor. La plaza que hoy conoces como Plaza de Bolívar era entonces el centro ceremonial de estos pueblos originarios.\n\nAndrés López de Galarza fundó oficialmente Ibagué en este lugar, convirtiéndolo en el corazón de lo que sería la "Capital Musical de Colombia".`,
          interactiveElements: ['audio_pijao_legends', 'ar_founding_scene'],
          duration: '3-4 min lectura'
        },
        {
          id: 'colonial',
          title: 'La Época Colonial (1550-1810)',
          content: `⛪ **Siglos de Tradición**\n\nDurante casi tres siglos, la plaza fue testigo de misas dominicales, mercados indígenas, y las primeras manifestaciones musicales que darían fama a Ibagué. Los frailes franciscanos establecieron aquí las primeras escuelas de música, plantando las semillas de nuestra identidad musical.\n\n🎵 Dato fascinante: Las campanas de la iglesia colonial tocaban melodías que los habitantes tarareaban, creando las primeras composiciones populares ibaguereñas.`,
          interactiveElements: ['colonial_music_sample', 'church_bells_audio'],
          duration: '2-3 min lectura'
        },
        {
          id: 'independence',
          title: 'Grito de Independencia (1810-1819)',
          content: `🗽 **La Libertad Resuena**\n\nEl 4 de junio de 1810, desde esta misma plaza, los patriotas ibaguereños proclamaron su independencia. Las voces que gritaron "¡Libertad!" ese día resonaron entre estas piedras que aún puedes tocar.\n\nSimón Bolívar mismo pisó estas baldosas en 1815, y cuenta la leyenda que fue aquí donde compuso una de sus cartas más emotivas a Manuelita Sáenz.`,
          interactiveElements: ['independence_audio', 'bolivar_letter_excerpt'],
          duration: '3 min lectura'
        },
        {
          id: 'musical_capital',
          title: 'Capital Musical (1886-presente)',
          content: `🎼 **El Alma Musical de Colombia**\n\nEn 1886 se funda el Conservatorio del Tolima, convirtiendo oficialmente a Ibagué en la Capital Musical de Colombia. Grandes compositores como Alberto Castilla, Cantalicio Rojas y Jorge Villamil caminaron por esta plaza, inspirándose en sus sonidos cotidianos.\n\n¿Sabías que el famoso "Bunde Tolimense" se interpretó por primera vez públicamente aquí en 1936?`,
          interactiveElements: ['bunde_audio', 'composer_gallery', 'musical_timeline'],
          duration: '4-5 min lectura'
        }
      ],
      totalDuration: '12-15 min',
      difficulty: 'Básico',
      tags: ['historia', 'música', 'independencia', 'cultura'],
      locations: [
        { lat: 4.4389, lng: -75.2322, name: 'Plaza de Bolívar' },
        { lat: 4.4392, lng: -75.2319, name: 'Catedral Primada' }
      ],
      rewards: {
        points: 150,
        badge: 'Historiador de Ibagué',
        unlocks: ['conservatorio_tour', 'musical_legends_story']
      }
    });

    this.stories.set('conservatorio', {
      title: 'El Conservatorio: Cuna de Leyendas Musicales',
      chapters: [
        {
          id: 'founding',
          title: 'La Fundación del Sueño Musical',
          content: `🎹 **1886: Nace un Sueño**\n\nAmalia de Lleras, una visionaria tolimense, soñaba con un lugar donde la música floreciera como las flores del valle. Su sueño se materializó cuando el Conservatorio del Tolima abrió sus puertas, convirtiéndose en el primero de Colombia.\n\nEn estos pasillos que puedes recorrer, resonaron las primeras notas que definirían la identidad musical de toda una nación.`,
          interactiveElements: ['amalia_portrait_ar', 'first_notes_audio'],
          duration: '3 min'
        },
        {
          id: 'golden_age',
          title: 'La Época Dorada (1920-1960)',
          content: `🌟 **Los Grandes Maestros**\n\nAlberto Castilla, el 'Poeta de la Música Colombiana', paseaba por estos jardines componiendo obras inmortales. Sus "Tres Piezas para Piano" nacieron aquí, inspiradas por el murmullo del río Combeima que aún puedes escuchar.\n\nCantalicio Rojas, compositor del himno del Tolima, enseñó en estas aulas. Sus estudiantes recuerdan que componía melodías usando los sonidos naturales: el viento entre los bambúes, el canto de los mirlos...`,
          interactiveElements: ['castilla_compositions', 'nature_sounds_mixer', 'student_testimonials'],
          duration: '4-5 min'
        }
      ],
      totalDuration: '7-8 min',
      difficulty: 'Intermedio',
      tags: ['música', 'educación', 'compositores', 'cultura'],
      rewards: {
        points: 200,
        badge: 'Melómano Tolimense',
        unlocks: ['composer_quest', 'musical_ar_experience']
      }
    });

    // Cultural immersion experiences
    this.culturalNarrations.set('gastronomy_journey', {
      title: 'Sabores que Cuentan Historias',
      experiences: [
        {
          dish: 'Lechona Tolimense',
          story: `🐷 **La Lechona: Tradición de Domingos**\n\nCada domingo desde hace más de 200 años, las familias ibaguereñas se reúnen alrededor de la lechona. Esta tradición comenzó cuando los pobladores necesitaban una comida que durara todo el día de mercado.\n\nLa receta original incluye un secreto: las especias se maceran durante 24 horas con chicha de maíz, bebida sagrada de los pijaos.`,
          preparation: 'La lechona se prepara desde las 4 AM, cocinándose lentamente durante 8 horas.',
          culturalSignificance: 'Representa la unión familiar y la persistencia de tradiciones indígenas.',
          bestPlaces: ['Mercado La 21', 'Plaza de Bolívar (domingos)', 'Barrio Belén'],
          interactiveElements: ['recipe_ar', 'cooking_sounds', 'family_stories']
        },
        {
          dish: 'Tamales Tolimenses',
          story: `🌽 **Tamales: El Abrazo en Hoja de Plátano**\n\nLos tamales llegaron a Ibagué con los esclavos africanos, pero fueron las mujeres indígenas quienes agregaron el toque tolimense: hojas de achira y un sofrito especial con cebolla larga y comino.\n\nCada tamal es envuelto con una técnica que se transmite de madres a hijas, considerada un arte ancestral.`,
          preparation: 'Se preparan tradicionalmente en luna llena, cuando las hojas están más flexibles.',
          culturalSignificance: 'Simboliza el mestizaje cultural: ingredientes indígenas, técnica africana, especias españolas.',
          bestPlaces: ['Barrio Ambalá', 'Mercado Colon', 'La Pola (Zona Rosa)'],
          interactiveElements: ['wrapping_tutorial', 'ingredient_origins_map', 'grandmother_recipes']
        }
      ]
    });

    this.interactiveElements.set('ar_experiences', {
      plaza_time_travel: {
        name: 'Viaje en el Tiempo - Plaza',
        description: 'Usa tu cámara para ver cómo ha cambiado la plaza a lo largo de 500 años',
        triggers: [
          { era: '1550', overlay: 'indigenous_settlement.3d' },
          { era: '1810', overlay: 'independence_scene.3d' },
          { era: '1950', overlay: 'golden_age_plaza.3d' },
          { era: '2024', overlay: 'modern_plaza.3d' }
        ]
      },
      musical_spirits: {
        name: 'Espíritus Musicales',
        description: 'Escucha composiciones de grandes maestros en los lugares donde fueron creadas',
        ghostComposers: [
          { name: 'Alberto Castilla', location: { lat: 4.4385, lng: -75.2315 }, composition: 'Tres Piezas para Piano' },
          { name: 'Jorge Villamil', location: { lat: 4.4380, lng: -75.2330 }, composition: 'Espumas' }
        ]
      }
    });
  }

  // Main storytelling methods
  getStory(storyId, userContext = {}) {
    const story = this.stories.get(storyId);
    if (!story) return null;

    return {
      ...story,
      personalizedIntro: this.generatePersonalizedIntro(story, userContext),
      adaptedContent: this.adaptContentToUser(story, userContext),
      recommendedNext: this.getRecommendedStories(storyId, userContext)
    };
  }

  generatePersonalizedIntro(story, context) {
    const { userPoints = 0, visitCount = 1, interests = [], timeOfDay = 'day' } = context;
    
    let intro = `🎭 **${story.title}**\n\n`;

    if (visitCount === 1) {
      intro += `¡Bienvenido a tu primera experiencia narrativa en Ibagué! `;
    } else if (userPoints > 500) {
      intro += `Como explorador experimentado (${userPoints} puntos), esta historia revelará secretos especiales. `;
    }

    if (timeOfDay === 'evening') {
      intro += `\n🌅 *El atardecer es el momento perfecto para historias. Los ancianos decían que las piedras de Ibagué susurran más fuerte cuando el sol se despide...*`;
    }

    if (interests.includes('music')) {
      intro += `\n🎵 *Veo que amas la música. Esta historia tiene elementos sonoros especiales para ti.*`;
    }

    return intro;
  }

  adaptContentToUser(story, context) {
    const { storyMode = 'standard', userAge = 'adult', languageLevel = 'native' } = context;
    
    return story.chapters.map(chapter => {
      let adaptedContent = chapter.content;
      
      if (storyMode === 'immersive') {
        adaptedContent = this.addImmersiveElements(adaptedContent);
      } else if (storyMode === 'quick') {
        adaptedContent = this.summarizeContent(adaptedContent);
      }
      
      if (languageLevel === 'tourist') {
        adaptedContent = this.simplifyLanguage(adaptedContent);
      }
      
      return {
        ...chapter,
        content: adaptedContent,
        estimatedReadTime: this.calculateReadTime(adaptedContent, context)
      };
    });
  }

  addImmersiveElements(content) {
    // Add sensory descriptions, sound cues, and interactive prompts
    return content.replace(/🏛️/g, '🏛️ *[Escucha: campanas coloniales de fondo]*')
                  .replace(/🎵/g, '🎵 *[Audio: melodía de época]*')
                  .replace(/🗽/g, '🗽 *[Siente el eco de los gritos de libertad]*');
  }

  summarizeContent(content) {
    // Create concise versions for users in a hurry
    return content.split('\n\n')[0] + '\n\n📖 *[Versión resumida - Activa modo completo para más detalles]*';
  }

  simplifyLanguage(content) {
    // Simplify for international tourists
    return content.replace(/palabras complejas/g, 'palabras simples')
                  .replace(/expresiones regionales/g, 'expresiones universales');
  }

  // Interactive storytelling methods
  startInteractiveNarration(storyId, userLocation, callback) {
    const story = this.getStory(storyId);
    if (!story) return;

    // Check if user is at the correct location
    const requiredLocation = story.locations[0];
    const distance = this.calculateDistance(userLocation, requiredLocation);
    
    if (distance > 0.1) { // 100m tolerance
      callback({
        type: 'location_error',
        message: `🚶‍♀️ Para vivir esta experiencia completamente, dirígete a ${requiredLocation.name}. Estás a ${Math.round(distance * 1000)}m del punto ideal.`,
        suggestedAction: 'navigate_to_location'
      });
      return;
    }

    // Start the interactive narration
    this.currentNarration = {
      storyId,
      currentChapter: 0,
      startTime: Date.now(),
      userEngagement: []
    };

    callback({
      type: 'narration_start',
      chapter: story.chapters[0],
      totalChapters: story.chapters.length,
      interactiveElements: this.getActiveInteractiveElements(story.chapters[0])
    });
  }

  getActiveInteractiveElements(chapter) {
    return chapter.interactiveElements?.map(elementId => ({
      id: elementId,
      ...this.interactiveElements.get('ar_experiences')?.[elementId]
    })) || [];
  }

  // Cultural immersion
  getCulturalExperience(experienceId, userPreferences = {}) {
    const experience = this.culturalNarrations.get(experienceId);
    if (!experience) return null;

    return {
      ...experience,
      personalizedExperiences: experience.experiences.filter(exp => 
        this.matchesUserPreferences(exp, userPreferences)
      ),
      culturalTips: this.generateCulturalTips(experience, userPreferences),
      socialElements: this.getSocialCulturalElements(experienceId)
    };
  }

  matchesUserPreferences(experience, preferences) {
    const { dietaryRestrictions = [], spiceLevel = 'medium', interests = [] } = preferences;
    
    // Filter based on dietary restrictions and preferences
    if (dietaryRestrictions.includes('vegetarian') && experience.dish.includes('carne')) {
      return false;
    }
    
    return true;
  }

  generateCulturalTips(experience, preferences) {
    return [
      '🤝 Saluda con un "Buenos días" cálido - los ibaguereños aprecian la cortesía',
      '🎵 Si escuchas música, es probable que sea un homenaje a algún compositor local',
      '☕ El café se toma fuerte y con panela - es parte de la hospitalidad tolimense',
      '🕐 Los horarios son flexibles, especialmente los domingos - relájate y disfruta el ritmo local'
    ];
  }

  // Utility methods
  calculateDistance(loc1, loc2) {
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  calculateReadTime(content, context) {
    const wordsPerMinute = context.languageLevel === 'tourist' ? 120 : 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  getRecommendedStories(currentStoryId, context) {
    // AI-powered story recommendations based on user behavior and interests
    const recommendations = [];
    
    if (currentStoryId === 'plaza_bolivar') {
      recommendations.push('conservatorio', 'cathedral_mysteries');
    }
    
    if (context.interests?.includes('music')) {
      recommendations.push('conservatorio', 'street_musicians_tales');
    }
    
    return recommendations.map(id => ({
      id,
      title: this.stories.get(id)?.title,
      estimatedDuration: this.stories.get(id)?.totalDuration,
      difficulty: this.stories.get(id)?.difficulty
    }));
  }

  // Social storytelling features
  createGroupNarration(storyId, groupMembers) {
    const story = this.getStory(storyId);
    
    return {
      ...story,
      groupElements: {
        roles: this.assignStorytellingRoles(groupMembers),
        interactiveQuestions: this.generateGroupQuestions(story),
        sharedChallenges: this.createGroupChallenges(story),
        collectiveRewards: this.calculateGroupRewards(story, groupMembers.length)
      }
    };
  }

  assignStorytellingRoles(members) {
    const roles = ['Narrador Principal', 'Guía Histórico', 'Especialista Musical', 'Fotógrafo Oficial'];
    return members.map((member, index) => ({
      userId: member.id,
      role: roles[index % roles.length],
      responsibilities: this.getRoleResponsibilities(roles[index % roles.length])
    }));
  }

  getRoleResponsibilities(role) {
    const responsibilities = {
      'Narrador Principal': ['Lee las partes principales de la historia', 'Modera las discusiones grupales'],
      'Guía Histórico': ['Comparte datos históricos adicionales', 'Responde preguntas sobre contexto'],
      'Especialista Musical': ['Identifica elementos musicales', 'Guía experiencias sonoras'],
      'Fotógrafo Oficial': ['Captura momentos clave', 'Documenta la experiencia grupal']
    };
    
    return responsibilities[role] || ['Participa activamente', 'Comparte observaciones'];
  }
}

// Export singleton instance
export const storytellingEngine = new StorytellingEngine();