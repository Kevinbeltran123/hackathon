// Sistema multi-idioma para turistas internacionales
export class MultiLanguageService {
  constructor() {
    this.currentLanguage = 'es'; // Español por defecto
    this.supportedLanguages = ['es', 'en', 'fr', 'de', 'pt', 'it', 'ja', 'ko', 'zh'];
    this.translations = new Map();
    this.audioTranslations = new Map();
    this.culturalAdaptations = new Map();
    this.initializeTranslations();
  }

  initializeTranslations() {
    // Cargar traducciones base
    this.loadBaseTranslations();
    
    // Cargar adaptaciones culturales
    this.loadCulturalAdaptations();
    
    // Detectar idioma del navegador
    this.detectUserLanguage();
  }

  detectUserLanguage() {
    const browserLang = navigator.language.split('-')[0];
    if (this.supportedLanguages.includes(browserLang)) {
      this.currentLanguage = browserLang;
    }
  }

  loadBaseTranslations() {
    // Español (idioma base)
    this.translations.set('es', {
      // UI General
      welcome: '¡Bienvenido a Ibagué!',
      explore: 'Explorar',
      missions: 'Misiones',
      rewards: 'Recompensas',
      profile: 'Perfil',
      settings: 'Configuración',
      
      // Navegación
      back: 'Atrás',
      next: 'Siguiente',
      continue: 'Continuar',
      start: 'Comenzar',
      finish: 'Finalizar',
      skip: 'Omitir',
      
      // Misiones
      mission_title: 'Misión: {title}',
      mission_progress: 'Progreso: {current}/{total}',
      mission_complete: '¡Misión Completada!',
      objective_complete: 'Objetivo Completado',
      points_earned: 'Puntos Ganados: {points}',
      
      // Lugares
      plaza_bolivar: 'Plaza de Bolívar',
      conservatorio: 'Conservatorio del Tolima',
      cathedral: 'Catedral Primada',
      botanical_garden: 'Jardín Botánico San Jorge',
      
      // Descripciones culturales
      musical_capital: 'Capital Musical de Colombia',
      historical_heart: 'Corazón histórico de Ibagué',
      cultural_heritage: 'Patrimonio cultural tolimense',
      
      // Interacciones
      take_photo: 'Tomar Foto',
      check_in: 'Hacer Check-in',
      learn_more: 'Aprender Más',
      share: 'Compartir',
      
      // Emergencias
      emergency: 'Emergencia',
      need_help: 'Necesito Ayuda',
      call_police: 'Llamar Policía',
      medical_assistance: 'Asistencia Médica',
      
      // Pet
      pet_happy: 'Tu mascota está feliz',
      pet_needs_attention: 'Tu mascota necesita atención',
      feed_pet: 'Alimentar Mascota',
      play_with_pet: 'Jugar con Mascota'
    });

    // English
    this.translations.set('en', {
      welcome: 'Welcome to Ibagué!',
      explore: 'Explore',
      missions: 'Missions',
      rewards: 'Rewards',
      profile: 'Profile',
      settings: 'Settings',
      
      back: 'Back',
      next: 'Next',
      continue: 'Continue',
      start: 'Start',
      finish: 'Finish',
      skip: 'Skip',
      
      mission_title: 'Mission: {title}',
      mission_progress: 'Progress: {current}/{total}',
      mission_complete: 'Mission Complete!',
      objective_complete: 'Objective Complete',
      points_earned: 'Points Earned: {points}',
      
      plaza_bolivar: 'Bolívar Square',
      conservatorio: 'Tolima Conservatory',
      cathedral: 'Primary Cathedral',
      botanical_garden: 'San Jorge Botanical Garden',
      
      musical_capital: 'Musical Capital of Colombia',
      historical_heart: 'Historical heart of Ibagué',
      cultural_heritage: 'Tolimense cultural heritage',
      
      take_photo: 'Take Photo',
      check_in: 'Check In',
      learn_more: 'Learn More',
      share: 'Share',
      
      emergency: 'Emergency',
      need_help: 'I Need Help',
      call_police: 'Call Police',
      medical_assistance: 'Medical Assistance',
      
      pet_happy: 'Your pet is happy',
      pet_needs_attention: 'Your pet needs attention',
      feed_pet: 'Feed Pet',
      play_with_pet: 'Play with Pet'
    });

    // Français
    this.translations.set('fr', {
      welcome: 'Bienvenue à Ibagué!',
      explore: 'Explorer',
      missions: 'Missions',
      rewards: 'Récompenses',
      profile: 'Profil',
      settings: 'Paramètres',
      
      back: 'Retour',
      next: 'Suivant',
      continue: 'Continuer',
      start: 'Commencer',
      finish: 'Terminer',
      skip: 'Passer',
      
      mission_title: 'Mission: {title}',
      mission_progress: 'Progrès: {current}/{total}',
      mission_complete: 'Mission Terminée!',
      objective_complete: 'Objectif Atteint',
      points_earned: 'Points Gagnés: {points}',
      
      plaza_bolivar: 'Place Bolívar',
      conservatorio: 'Conservatoire du Tolima',
      cathedral: 'Cathédrale Primaire',
      botanical_garden: 'Jardin Botanique San Jorge',
      
      musical_capital: 'Capitale Musicale de Colombie',
      historical_heart: 'Cœur historique d\'Ibagué',
      cultural_heritage: 'Patrimoine culturel tolimense',
      
      take_photo: 'Prendre Photo',
      check_in: 'S\'enregistrer',
      learn_more: 'En Savoir Plus',
      share: 'Partager',
      
      emergency: 'Urgence',
      need_help: 'J\'ai Besoin d\'Aide',
      call_police: 'Appeler Police',
      medical_assistance: 'Assistance Médicale',
      
      pet_happy: 'Votre animal est heureux',
      pet_needs_attention: 'Votre animal a besoin d\'attention',
      feed_pet: 'Nourrir Animal',
      play_with_pet: 'Jouer avec Animal'
    });

    // Deutsch
    this.translations.set('de', {
      welcome: 'Willkommen in Ibagué!',
      explore: 'Erkunden',
      missions: 'Missionen',
      rewards: 'Belohnungen',
      profile: 'Profil',
      settings: 'Einstellungen',
      
      back: 'Zurück',
      next: 'Weiter',
      continue: 'Fortfahren',
      start: 'Starten',
      finish: 'Beenden',
      skip: 'Überspringen',
      
      mission_title: 'Mission: {title}',
      mission_progress: 'Fortschritt: {current}/{total}',
      mission_complete: 'Mission Abgeschlossen!',
      objective_complete: 'Ziel Erreicht',
      points_earned: 'Punkte Erhalten: {points}',
      
      plaza_bolivar: 'Bolívar-Platz',
      conservatorio: 'Tolima Konservatorium',
      cathedral: 'Hauptkathedrale',
      botanical_garden: 'San Jorge Botanischer Garten',
      
      musical_capital: 'Musikhauptstadt Kolumbiens',
      historical_heart: 'Historisches Herz von Ibagué',
      cultural_heritage: 'Tolimense Kulturerbe',
      
      take_photo: 'Foto Machen',
      check_in: 'Einchecken',
      learn_more: 'Mehr Erfahren',
      share: 'Teilen',
      
      emergency: 'Notfall',
      need_help: 'Ich Brauche Hilfe',
      call_police: 'Polizei Rufen',
      medical_assistance: 'Medizinische Hilfe',
      
      pet_happy: 'Ihr Haustier ist glücklich',
      pet_needs_attention: 'Ihr Haustier braucht Aufmerksamkeit',
      feed_pet: 'Haustier Füttern',
      play_with_pet: 'Mit Haustier Spielen'
    });

    // Português
    this.translations.set('pt', {
      welcome: 'Bem-vindo a Ibagué!',
      explore: 'Explorar',
      missions: 'Missões',
      rewards: 'Recompensas',
      profile: 'Perfil',
      settings: 'Configurações',
      
      back: 'Voltar',
      next: 'Próximo',
      continue: 'Continuar',
      start: 'Começar',
      finish: 'Finalizar',
      skip: 'Pular',
      
      mission_title: 'Missão: {title}',
      mission_progress: 'Progresso: {current}/{total}',
      mission_complete: 'Missão Concluída!',
      objective_complete: 'Objetivo Concluído',
      points_earned: 'Pontos Ganhos: {points}',
      
      plaza_bolivar: 'Praça Bolívar',
      conservatorio: 'Conservatório do Tolima',
      cathedral: 'Catedral Primária',
      botanical_garden: 'Jardim Botânico San Jorge',
      
      musical_capital: 'Capital Musical da Colômbia',
      historical_heart: 'Coração histórico de Ibagué',
      cultural_heritage: 'Patrimônio cultural tolimense',
      
      take_photo: 'Tirar Foto',
      check_in: 'Fazer Check-in',
      learn_more: 'Saber Mais',
      share: 'Compartilhar',
      
      emergency: 'Emergência',
      need_help: 'Preciso de Ajuda',
      call_police: 'Chamar Polícia',
      medical_assistance: 'Assistência Médica',
      
      pet_happy: 'Seu pet está feliz',
      pet_needs_attention: 'Seu pet precisa de atenção',
      feed_pet: 'Alimentar Pet',
      play_with_pet: 'Brincar com Pet'
    });

    // 日本語 (Japanese)
    this.translations.set('ja', {
      welcome: 'イバゲへようこそ！',
      explore: '探索',
      missions: 'ミッション',
      rewards: '報酬',
      profile: 'プロフィール',
      settings: '設定',
      
      back: '戻る',
      next: '次へ',
      continue: '続行',
      start: '開始',
      finish: '完了',
      skip: 'スキップ',
      
      mission_title: 'ミッション: {title}',
      mission_progress: '進捗: {current}/{total}',
      mission_complete: 'ミッション完了！',
      objective_complete: '目標達成',
      points_earned: '獲得ポイント: {points}',
      
      plaza_bolivar: 'ボリーバル広場',
      conservatorio: 'トリマ音楽院',
      cathedral: '大聖堂',
      botanical_garden: 'サンホルヘ植物園',
      
      musical_capital: 'コロンビアの音楽首都',
      historical_heart: 'イバゲの歴史的中心地',
      cultural_heritage: 'トリマの文化遺産',
      
      take_photo: '写真を撮る',
      check_in: 'チェックイン',
      learn_more: '詳細を見る',
      share: '共有',
      
      emergency: '緊急事態',
      need_help: '助けが必要です',
      call_police: '警察を呼ぶ',
      medical_assistance: '医療援助',
      
      pet_happy: 'ペットは幸せです',
      pet_needs_attention: 'ペットが注意を必要としています',
      feed_pet: 'ペットに餌をやる',
      play_with_pet: 'ペットと遊ぶ'
    });
  }

  loadCulturalAdaptations() {
    // Adaptaciones culturales por idioma
    this.culturalAdaptations.set('en', {
      greeting_style: 'formal',
      date_format: 'MM/DD/YYYY',
      currency_display: 'USD equivalent',
      measurement_system: 'imperial',
      cultural_notes: {
        tipping: 'Tipping is appreciated but not mandatory in Colombia',
        greetings: 'Handshakes are common, hugs for close friends',
        dining: 'Lunch is the main meal, usually 12-2 PM'
      },
      local_customs: [
        'Coffee culture is very important - take time to enjoy it',
        'Music is everywhere - don\'t be surprised by street performances',
        'People are very friendly and helpful to tourists'
      ]
    });

    this.culturalAdaptations.set('fr', {
      greeting_style: 'formal',
      date_format: 'DD/MM/YYYY',
      currency_display: 'EUR equivalent',
      measurement_system: 'metric',
      cultural_notes: {
        tipping: 'Le pourboire est apprécié mais pas obligatoire en Colombie',
        greetings: 'Les poignées de main sont courantes',
        dining: 'Le déjeuner est le repas principal, généralement 12h-14h'
      }
    });

    this.culturalAdaptations.set('de', {
      greeting_style: 'formal',
      date_format: 'DD.MM.YYYY',
      currency_display: 'EUR equivalent',
      measurement_system: 'metric',
      cultural_notes: {
        tipping: 'Trinkgeld wird geschätzt, ist aber nicht verpflichtend',
        greetings: 'Händeschütteln ist üblich',
        dining: 'Das Mittagessen ist die Hauptmahlzeit, normalerweise 12-14 Uhr'
      }
    });

    this.culturalAdaptations.set('ja', {
      greeting_style: 'respectful',
      date_format: 'YYYY/MM/DD',
      currency_display: 'JPY equivalent',
      measurement_system: 'metric',
      cultural_notes: {
        tipping: 'チップは感謝されますが、コロンビアでは必須ではありません',
        greetings: '握手が一般的です',
        dining: '昼食がメインの食事で、通常12時〜14時です'
      }
    });
  }

  // Obtener traducción
  translate(key, params = {}) {
    const translations = this.translations.get(this.currentLanguage);
    if (!translations || !translations[key]) {
      // Fallback al español si no existe la traducción
      const fallback = this.translations.get('es')[key] || key;
      return this.interpolateString(fallback, params);
    }

    return this.interpolateString(translations[key], params);
  }

  // Interpolación de parámetros en strings
  interpolateString(string, params) {
    return string.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }

  // Cambiar idioma
  setLanguage(languageCode) {
    if (this.supportedLanguages.includes(languageCode)) {
      this.currentLanguage = languageCode;
      localStorage.setItem('user_language', languageCode);
      return true;
    }
    return false;
  }

  // Obtener idioma actual
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  // Obtener lista de idiomas soportados
  getSupportedLanguages() {
    return this.supportedLanguages.map(code => ({
      code,
      name: this.getLanguageName(code),
      nativeName: this.getLanguageNativeName(code),
      flag: this.getLanguageFlag(code)
    }));
  }

  getLanguageName(code) {
    const names = {
      'es': 'Spanish',
      'en': 'English',
      'fr': 'French',
      'de': 'German',
      'pt': 'Portuguese',
      'it': 'Italian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese'
    };
    return names[code] || code;
  }

  getLanguageNativeName(code) {
    const nativeNames = {
      'es': 'Español',
      'en': 'English',
      'fr': 'Français',
      'de': 'Deutsch',
      'pt': 'Português',
      'it': 'Italiano',
      'ja': '日本語',
      'ko': '한국어',
      'zh': '中文'
    };
    return nativeNames[code] || code;
  }

  getLanguageFlag(code) {
    const flags = {
      'es': '🇪🇸',
      'en': '🇺🇸',
      'fr': '🇫🇷',
      'de': '🇩🇪',
      'pt': '🇧🇷',
      'it': '🇮🇹',
      'ja': '🇯🇵',
      'ko': '🇰🇷',
      'zh': '🇨🇳'
    };
    return flags[code] || '🌐';
  }

  // Obtener adaptaciones culturales
  getCulturalAdaptation(key) {
    const adaptations = this.culturalAdaptations.get(this.currentLanguage);
    return adaptations ? adaptations[key] : null;
  }

  // Formatear fecha según el idioma
  formatDate(date, format = 'short') {
    const locale = this.getLocaleCode();
    const options = format === 'long' 
      ? { year: 'numeric', month: 'long', day: 'numeric' }
      : { year: 'numeric', month: 'short', day: 'numeric' };
    
    return new Intl.DateTimeFormat(locale, options).format(date);
  }

  // Formatear moneda
  formatCurrency(amount, currency = 'COP') {
    const locale = this.getLocaleCode();
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  // Obtener código de locale
  getLocaleCode() {
    const locales = {
      'es': 'es-CO',
      'en': 'en-US',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'pt': 'pt-BR',
      'it': 'it-IT',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'zh': 'zh-CN'
    };
    return locales[this.currentLanguage] || 'es-CO';
  }

  // Traducir contenido dinámico (como misiones)
  translateDynamicContent(content, type = 'mission') {
    if (this.currentLanguage === 'es') return content;

    // Para contenido dinámico, usamos traducciones básicas
    const dynamicTranslations = {
      en: {
        missions: {
          'Primeros Pasos en la Capital Musical': 'First Steps in the Musical Capital',
          'El Tesoro Tolimense Perdido': 'The Lost Tolimense Treasure',
          'Raid Familiar: Unidos por la Música': 'Family Raid: United by Music'
        },
        objectives: {
          'Visita la Plaza de Bolívar': 'Visit Bolívar Square',
          'Haz check-in en la plaza': 'Check in at the square',
          'Toma una foto memorable': 'Take a memorable photo',
          'Aprende sobre la historia': 'Learn about the history'
        }
      }
    };

    const translations = dynamicTranslations[this.currentLanguage];
    if (translations && translations[type] && translations[type][content]) {
      return translations[type][content];
    }

    return content;
  }

  // Obtener frases de emergencia
  getEmergencyPhrases() {
    const phrases = {
      es: [
        '¡Ayuda!',
        'Necesito ayuda',
        'Llame a la policía',
        'Emergencia médica',
        'Estoy perdido/a',
        'No hablo español bien',
        '¿Habla inglés?'
      ],
      en: [
        'Help!',
        'I need help',
        'Call the police',
        'Medical emergency',
        'I am lost',
        'I don\'t speak Spanish well',
        'Do you speak English?'
      ],
      fr: [
        'Au secours!',
        'J\'ai besoin d\'aide',
        'Appelez la police',
        'Urgence médicale',
        'Je suis perdu(e)',
        'Je ne parle pas bien espagnol',
        'Parlez-vous français?'
      ]
    };

    return phrases[this.currentLanguage] || phrases.es;
  }

  // Audio pronunciación para frases básicas
  getAudioPronunciation(phrase) {
    // En implementación real, esto retornaría un archivo de audio
    const audioMap = {
      'Hola': { file: 'audio/es/hola.mp3', phonetic: 'OH-lah' },
      'Gracias': { file: 'audio/es/gracias.mp3', phonetic: 'GRAH-see-ahs' },
      'Por favor': { file: 'audio/es/por_favor.mp3', phonetic: 'por fah-VOR' },
      '¿Dónde está?': { file: 'audio/es/donde_esta.mp3', phonetic: 'DOHN-deh ehs-TAH' }
    };

    return audioMap[phrase] || { phonetic: phrase };
  }

  // Detectar si el usuario necesita ayuda con el idioma
  needsLanguageAssistance() {
    return this.currentLanguage !== 'es';
  }

  // Obtener configuración de accesibilidad por idioma
  getAccessibilitySettings() {
    return {
      textToSpeech: this.currentLanguage !== 'es',
      fontSize: this.currentLanguage === 'ja' || this.currentLanguage === 'zh' ? 'large' : 'normal',
      rightToLeft: false, // Para idiomas como árabe en el futuro
      voiceNavigation: true,
      simplifiedInterface: this.needsLanguageAssistance()
    };
  }

  // Obtener consejos culturales
  getCulturalTips() {
    const adaptations = this.culturalAdaptations.get(this.currentLanguage);
    return adaptations?.cultural_notes || {};
  }

  // Traducciones contextúales por ubicación
  getLocationBasedTranslations(location) {
    const locationTranslations = {
      plaza_bolivar: {
        en: {
          welcome: 'Welcome to the heart of Ibagué!',
          history: 'This square has been the center of city life since 1550',
          tip: 'Look for the musical notes carved in the ground'
        },
        fr: {
          welcome: 'Bienvenue au cœur d\'Ibagué!',
          history: 'Cette place est le centre de la vie urbaine depuis 1550',
          tip: 'Cherchez les notes musicales gravées dans le sol'
        }
      }
    };

    return locationTranslations[location]?.[this.currentLanguage] || {};
  }
}

// Crear instancia singleton
export const multiLanguageService = new MultiLanguageService();

// Hook personalizado para React
export const useTranslation = () => {
  const translate = (key, params) => multiLanguageService.translate(key, params);
  const setLanguage = (lang) => multiLanguageService.setLanguage(lang);
  const currentLanguage = multiLanguageService.getCurrentLanguage();
  
  return {
    t: translate,
    setLanguage,
    currentLanguage,
    needsAssistance: multiLanguageService.needsLanguageAssistance()
  };
};