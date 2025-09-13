import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import GameMap from '../../components/GameMap';
import MissionInterface from '../../components/MissionInterface';
import VirtualPetSystem from '../../components/VirtualPetSystem';
import { gameMissionsSystem } from '../../components/GameMissionsSystem';
import { offlineGameService } from '../../services/OfflineGameService';
import { multiLanguageService, useTranslation } from '../../services/MultiLanguageService';

const GameDashboard = () => {
  const { user } = useAuth();
  const { t, setLanguage, currentLanguage } = useTranslation();
  
  // Estados del juego
  const [userLevel, setUserLevel] = useState(1);
  const [userPoints, setUserPoints] = useState(1250);
  const [userExperience, setUserExperience] = useState(200);
  const [checkInsCount, setCheckInsCount] = useState(12);
  const [userLocation, setUserLocation] = useState(null);
  const [currentMission, setCurrentMission] = useState(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [gameStats, setGameStats] = useState({
    totalMissionsCompleted: 3,
    totalPointsEarned: 1250,
    currentStreak: 5,
    unlockedZones: 2,
    achievements: ['Primer Explorador', 'Amante de la Música']
  });

  // Detectar geolocalización
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          // Fallback a ubicación de Ibagué
          setUserLocation({ lat: 4.4389, lng: -75.2322 });
        }
      );
    }
  }, []);

  // Detectar modo offline
  useEffect(() => {
    const handleOfflineStatus = () => {
      setIsOfflineMode(!navigator.onLine);
    };

    window.addEventListener('online', handleOfflineStatus);
    window.addEventListener('offline', handleOfflineStatus);
    handleOfflineStatus(); // Check initial status

    return () => {
      window.removeEventListener('online', handleOfflineStatus);
      window.removeEventListener('offline', handleOfflineStatus);
    };
  }, []);

  // Calcular nivel basado en experiencia
  useEffect(() => {
    const newLevel = Math.floor(userExperience / 300) + 1;
    if (newLevel !== userLevel) {
      setUserLevel(newLevel);
      showLevelUpEffect(newLevel);
    }
  }, [userExperience, userLevel]);

  const showLevelUpEffect = (newLevel) => {
    // Trigger level up animation
    console.log(`¡Subiste al nivel ${newLevel}!`);
  };

  // Manejar inicio de misión
  const handleMissionStart = (mission) => {
    setCurrentMission(mission);
  };

  // Manejar completado de misión
  const handleMissionComplete = (rewards, missionId) => {
    // Actualizar estadísticas
    setUserPoints(prev => prev + rewards.points);
    setUserExperience(prev => prev + rewards.experience);
    setGameStats(prev => ({
      ...prev,
      totalMissionsCompleted: prev.totalMissionsCompleted + 1,
      totalPointsEarned: prev.totalPointsEarned + rewards.points
    }));

    // Cerrar interfaz de misión
    setCurrentMission(null);

    // Mostrar recompensas
    showRewardsModal(rewards);
  };

  // Salir de misión
  const handleMissionExit = (completed) => {
    setCurrentMission(null);
    if (!completed) {
      console.log('Misión cancelada');
    }
  };

  // Manejar desbloqueo de zona
  const handleZoneUnlock = (rewards) => {
    setUserPoints(prev => prev + rewards.points);
    setUserExperience(prev => prev + rewards.experience);
    setGameStats(prev => ({
      ...prev,
      unlockedZones: prev.unlockedZones + 1
    }));
  };

  // Manejar evolución de mascota
  const handlePetEvolution = (evolutionData) => {
    setUserPoints(prev => prev + evolutionData.evolutionBonus);
    console.log('Pet evolved!', evolutionData);
  };

  // Interacción con mascota
  const handlePetInteraction = (interaction) => {
    if (interaction.effect.points) {
      setUserPoints(prev => prev + interaction.effect.points);
    }
  };

  const showRewardsModal = (rewards) => {
    // Implementar modal de recompensas
    console.log('Rewards earned:', rewards);
  };

  // Selector de idioma
  const LanguageSelector = () => {
    const supportedLanguages = multiLanguageService.getSupportedLanguages();

    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="relative">
          <button
            onClick={() => setShowLanguageSelector(!showLanguageSelector)}
            className="bg-white shadow-lg rounded-full p-3 hover:shadow-xl transition-all duration-200"
          >
            <span className="text-xl">
              {multiLanguageService.getLanguageFlag(currentLanguage)}
            </span>
          </button>

          {showLanguageSelector && (
            <div className="absolute right-0 top-12 bg-white rounded-xl shadow-xl border p-2 min-w-48">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 px-3">
                {t('choose_language', 'Elegir idioma')}
              </h3>
              {supportedLanguages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setShowLanguageSelector(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-100 transition-colors ${
                    currentLanguage === lang.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <div>
                    <div className="font-medium">{lang.nativeName}</div>
                    <div className="text-xs text-gray-500">{lang.name}</div>
                  </div>
                  {currentLanguage === lang.code && (
                    <span className="ml-auto text-blue-600">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Indicador de estado offline
  const OfflineIndicator = () => {
    if (!isOfflineMode) return null;

    return (
      <div className="fixed top-4 left-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
        <span className="w-2 h-2 bg-orange-300 rounded-full animate-pulse"></span>
        <span className="text-sm font-medium">
          {t('offline_mode', 'Modo Offline')}
        </span>
      </div>
    );
  };

  // Panel de estadísticas del jugador
  const PlayerStatsPanel = () => {
    return (
      <div className="fixed bottom-4 right-4 bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-4 shadow-lg z-30 min-w-64">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">{t('player_stats', 'Estadísticas')}</h3>
          <div className="flex items-center gap-1">
            <span className="text-2xl">⭐</span>
            <span className="font-bold text-blue-600">Lvl {userLevel}</span>
          </div>
        </div>

        {/* Barra de experiencia */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>{t('experience', 'Experiencia')}</span>
            <span>{userExperience}/{(userLevel * 300)} XP</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${((userExperience % 300) / 300) * 100}%` }}
            />
          </div>
        </div>

        {/* Estadísticas grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-center p-2 bg-yellow-50 rounded-lg">
            <div className="text-lg mb-1">💰</div>
            <div className="font-bold text-yellow-700">{userPoints.toLocaleString()}</div>
            <div className="text-xs text-gray-600">{t('points', 'Puntos')}</div>
          </div>
          
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <div className="text-lg mb-1">🔥</div>
            <div className="font-bold text-green-700">{gameStats.currentStreak}</div>
            <div className="text-xs text-gray-600">{t('streak', 'Racha')}</div>
          </div>
          
          <div className="text-center p-2 bg-purple-50 rounded-lg">
            <div className="text-lg mb-1">🎯</div>
            <div className="font-bold text-purple-700">{gameStats.totalMissionsCompleted}</div>
            <div className="text-xs text-gray-600">{t('missions', 'Misiones')}</div>
          </div>
          
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="text-lg mb-1">🗺️</div>
            <div className="font-bold text-blue-700">{gameStats.unlockedZones}</div>
            <div className="text-xs text-gray-600">{t('zones', 'Zonas')}</div>
          </div>
        </div>

        {/* Achievements recientes */}
        {gameStats.achievements.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-600 mb-2">
              {t('recent_achievements', 'Logros Recientes')}
            </p>
            <div className="flex flex-wrap gap-1">
              {gameStats.achievements.slice(-3).map((achievement, index) => (
                <span 
                  key={index}
                  className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full"
                >
                  {achievement}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (!userLocation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading_game', 'Cargando juego...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Fondo animado */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center"></div>
      </div>

      {/* Partículas flotantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full opacity-30 animate-float ${
              i % 3 === 0 ? 'bg-blue-400' : i % 3 === 1 ? 'bg-purple-400' : 'bg-pink-400'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Header del juego */}
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t('welcome', '¡Bienvenido')}, {user?.displayName || 'Explorador'}!
              </h1>
              <p className="text-gray-600 mt-1">
                {t('musical_capital', 'Capital Musical de Colombia')} • Nivel {userLevel}
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-4">
              <button 
                className="bg-white bg-opacity-80 backdrop-blur-sm p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                title={t('daily_rewards', 'Recompensas diarias')}
              >
                <span className="text-2xl">🎁</span>
              </button>
              
              <button 
                className="bg-white bg-opacity-80 backdrop-blur-sm p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                title={t('leaderboard', 'Tabla de líderes')}
              >
                <span className="text-2xl">🏆</span>
              </button>
              
              <button 
                className="bg-white bg-opacity-80 backdrop-blur-sm p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                title={t('achievements', 'Logros')}
              >
                <span className="text-2xl">🎖️</span>
              </button>
            </div>
          </div>

          {/* Mapa del juego */}
          <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
            <GameMap
              userLevel={userLevel}
              userPoints={userPoints}
              onMissionStart={handleMissionStart}
              onZoneUnlock={handleZoneUnlock}
            />
          </div>
        </div>
      </div>

      {/* Interfaz de misión activa */}
      {currentMission && (
        <MissionInterface
          mission={currentMission}
          userLocation={userLocation}
          onMissionComplete={handleMissionComplete}
          onMissionExit={handleMissionExit}
        />
      )}

      {/* Sistema de mascota virtual */}
      <VirtualPetSystem
        userCheckins={checkInsCount}
        userPoints={userPoints}
        onPetEvolution={handlePetEvolution}
        onPetInteraction={handlePetInteraction}
      />

      {/* Panel de estadísticas */}
      <PlayerStatsPanel />

      {/* Selector de idioma */}
      <LanguageSelector />

      {/* Indicador de modo offline */}
      <OfflineIndicator />

      {/* Efectos de nivel up */}
      <div id="level-up-effects" className="fixed inset-0 pointer-events-none z-50"></div>
    </div>
  );
};

export default GameDashboard;