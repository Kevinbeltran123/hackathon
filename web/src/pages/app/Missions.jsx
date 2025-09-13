// Misiones Gamificadas - Sistema estilo videojuego
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthProvider';

const Missions = () => {
  const { user } = useAuth();
  
  // Estados del juego
  const [userLevel, setUserLevel] = useState(5);
  const [userPoints, setUserPoints] = useState(2450);
  const [userExperience, setUserExperience] = useState(1200);
  const [checkInsCount, setCheckInsCount] = useState(28);
  const [userLocation, setUserLocation] = useState(null);
  const [currentMission, setCurrentMission] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [showMissionDetails, setShowMissionDetails] = useState(false);
  const [availableMissions, setAvailableMissions] = useState([]);
  const [completedMissions, setCompletedMissions] = useState(['tutorial_plaza']);
  const [activePowerUps, setActivePowerUps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Datos de progreso del usuario
  const [userProgress, setUserProgress] = useState({
    currentStreak: 7,
    totalPointsEarned: 2450,
    missionsBeat: 4,
    zonesBeat: 3,
    achievements: [
      'Primer Explorador',
      'Historiador de Ibagué', 
      'Amante de la Música',
      'Fotógrafo Profesional'
    ],
    unlockedZones: ['centro_historico', 'conservatorio', 'zona_rosa'],
    activePet: {
      name: 'Ocobo Adulto',
      stage: 3,
      happiness: 85
    }
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
          setUserLocation({ lat: 4.4389, lng: -75.2322 });
        }
      );
    } else {
      setUserLocation({ lat: 4.4389, lng: -75.2322 });
    }
  }, []);

  // Cargar misiones disponibles
  useEffect(() => {
    if (userLocation) {
      loadAvailableMissions();
    }
  }, [userLocation, userLevel]);

  const loadAvailableMissions = () => {
    // Mock missions data para evitar errores
    const mockMissions = [
      {
        id: 'tutorial_plaza',
        title: '🎵 Primeros Pasos en la Capital Musical',
        description: 'Descubre el corazón de Ibagué visitando la histórica Plaza de Bolívar',
        zone: 'Centro Histórico',
        difficulty: 'easy',
        distance: 250,
        estimatedTime: '10 min',
        objectives: [
          { id: 'visit_plaza', description: 'Visita la Plaza de Bolívar', points: 50 },
          { id: 'checkin_plaza', description: 'Haz check-in en la plaza', points: 100 },
          { id: 'take_photo', description: 'Toma una foto memorable', points: 75 }
        ],
        rewards: {
          points: 225,
          experience: 200,
          badge: 'Primer Explorador'
        }
      },
      {
        id: 'musical_legends',
        title: '🎼 Leyendas del Conservatorio',
        description: 'Explora la cuna de la música colombiana y conoce a los grandes compositores',
        zone: 'Conservatorio',
        difficulty: 'medium',
        distance: 180,
        estimatedTime: '15 min',
        objectives: [
          { id: 'visit_conservatorio', description: 'Visita el Conservatorio del Tolima', points: 100 },
          { id: 'learn_composers', description: 'Aprende sobre los compositores famosos', points: 150 },
          { id: 'musical_challenge', description: 'Completa el desafío musical', points: 200 }
        ],
        rewards: {
          points: 450,
          experience: 300,
          badge: 'Amante de la Música'
        }
      },
      {
        id: 'gourmet_adventure',
        title: '🍽️ Aventura Gastronómica',
        description: 'Descubre los sabores únicos de la cocina tolimense',
        zone: 'Zona Rosa',
        difficulty: 'medium',
        distance: 320,
        estimatedTime: '30 min',
        objectives: [
          { id: 'try_lechona', description: 'Prueba la lechona tolimense', points: 120 },
          { id: 'coffee_tasting', description: 'Degustación de café local', points: 100 },
          { id: 'restaurant_review', description: 'Deja una reseña del restaurante', points: 80 }
        ],
        rewards: {
          points: 300,
          experience: 250,
          badge: 'Gourmet Local'
        }
      },
      {
        id: 'treasure_hunt',
        title: '💰 El Tesoro Tolimense Perdido',
        description: 'Una aventura épica a través de la historia de Ibagué',
        zone: 'Múltiples Zonas',
        difficulty: 'legendary',
        distance: 150,
        estimatedTime: '3-4 horas',
        objectives: [
          { id: 'find_map', description: 'Encuentra el mapa en la biblioteca', points: 300 },
          { id: 'solve_riddles', description: 'Resuelve 5 acertijos musicales', points: 500 },
          { id: 'collect_keys', description: 'Recolecta 3 llaves de los compositores', points: 800 },
          { id: 'defeat_guardian', description: 'Derrota al Guardián del Tesoro', points: 1000 }
        ],
        rewards: {
          points: 2600,
          experience: 2000,
          badge: 'Cazador de Tesoros Legendario'
        }
      }
    ];

    setAvailableMissions(mockMissions);
    setLoading(false);
  };

  const calculateDistance = (pos1, pos2) => {
    const R = 6371e3;
    const φ1 = pos1.lat * Math.PI / 180;
    const φ2 = pos2.lat * Math.PI / 180;
    const Δφ = (pos2.lat - pos1.lat) * Math.PI / 180;
    const Δλ = (pos2.lng - pos1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Manejar inicio de misión
  const handleMissionStart = (mission) => {
    alert(`🎮 Iniciando misión: ${mission.title}\n\n${mission.description}\n\nRecompensa: +${mission.rewards.points} puntos`);
  };

  // Simulación de completado de misión
  const handleMissionComplete = (rewards, missionId) => {
    setUserPoints(prev => prev + rewards.points);
    setUserExperience(prev => prev + rewards.experience);
    setCompletedMissions(prev => [...prev, missionId]);
    
    // Recargar misiones
    loadAvailableMissions();
  };

  // Componente de estadísticas del jugador
  const PlayerStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
        <div className="flex items-center justify-between mb-2">
          <div className="text-3xl">⭐</div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">{userLevel}</div>
            <div className="text-xs text-gray-500">Nivel</div>
          </div>
        </div>
        <div className="w-full bg-purple-100 rounded-full h-2 mt-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full"
            style={{ width: `${((userExperience % 300) / 300) * 100}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {userExperience % 300}/300 XP
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-yellow-100">
        <div className="flex items-center justify-between">
          <div className="text-3xl">💰</div>
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-600">{userPoints.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Puntos</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
        <div className="flex items-center justify-between">
          <div className="text-3xl">🔥</div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{userProgress.currentStreak}</div>
            <div className="text-xs text-gray-500">Racha</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-pink-100">
        <div className="flex items-center justify-between">
          <div className="text-3xl">🏆</div>
          <div className="text-right">
            <div className="text-2xl font-bold text-pink-600">{userProgress.missionsBeat}</div>
            <div className="text-xs text-gray-500">Misiones</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Componente de misión individual
  const MissionCard = ({ mission, index }) => {
    const difficultyColors = {
      easy: 'from-green-400 to-green-600',
      medium: 'from-yellow-400 to-orange-500',
      hard: 'from-orange-500 to-red-600',
      legendary: 'from-purple-600 to-pink-600'
    };

    const difficultyText = {
      easy: 'Fácil',
      medium: 'Medio', 
      hard: 'Difícil',
      legendary: 'Legendaria'
    };

    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
        {/* Header con gradiente */}
        <div 
          className={`h-32 bg-gradient-to-br ${difficultyColors[mission.difficulty]} relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          <div className="absolute top-4 left-4">
            <span className="bg-white bg-opacity-20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
              {mission.zone}
            </span>
          </div>
          <div className="absolute top-4 right-4">
            <span className="bg-white bg-opacity-20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
              {difficultyText[mission.difficulty]}
            </span>
          </div>
          <div className="absolute bottom-4 left-4">
            <h3 className="text-white font-bold text-xl mb-1">{mission.title}</h3>
            <p className="text-white text-sm opacity-90">{Math.round(mission.distance)}m de distancia</p>
          </div>
          
          {/* Efectos visuales */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white opacity-60 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {mission.description}
          </p>

          {/* Objetivos preview */}
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2">OBJETIVOS ({mission.objectives?.length || 0})</p>
            <div className="space-y-1">
              {mission.objectives?.slice(0, 2).map((objective, idx) => (
                <div key={idx} className="flex items-center text-xs text-gray-600">
                  <span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center mr-2 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="line-clamp-1">{objective.description}</span>
                </div>
              ))}
              {mission.objectives?.length > 2 && (
                <div className="text-xs text-gray-400 pl-6">
                  +{mission.objectives.length - 2} objetivos más...
                </div>
              )}
            </div>
          </div>

          {/* Recompensas */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center text-sm">
                <span className="text-yellow-500 mr-1">💰</span>
                <span className="font-semibold text-yellow-700">+{mission.rewards?.points}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-blue-500 mr-1">⚡</span>
                <span className="font-semibold text-blue-700">+{mission.rewards?.experience} XP</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              ⏱️ {mission.estimatedTime}
            </div>
          </div>

          {/* Badges especiales */}
          {mission.rewards?.badge && (
            <div className="mb-4">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                🏆 {mission.rewards.badge}
              </span>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2">
            <button
              onClick={() => handleMissionStart(mission)}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-lg hover:scale-105 bg-gradient-to-r ${difficultyColors[mission.difficulty]}`}
            >
              {mission.distance < 100 ? '🎯 Comenzar Ahora' : '🚶‍♀️ Ir y Comenzar'}
            </button>
            <button
              onClick={() => setShowMissionDetails(mission)}
              className="px-4 py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              👁️
            </button>
          </div>
        </div>

        {/* Indicador de distancia */}
        {mission.distance < 50 && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
            ¡MUY CERCA!
          </div>
        )}
      </div>
    );
  };

  // Sección de logros recientes
  const AchievementsSection = () => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">🏆 Logros Recientes</h2>
        <span className="text-sm text-gray-500">{userProgress.achievements.length} total</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {userProgress.achievements.map((achievement, index) => (
          <div key={index} className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-3 text-white text-center">
            <div className="text-2xl mb-1">🎖️</div>
            <div className="text-xs font-medium">{achievement}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // Power-ups activos
  const ActivePowerUps = () => {
    if (activePowerUps.length === 0) return null;

    return (
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white mb-8">
        <h2 className="text-xl font-bold mb-4">⚡ Power-ups Activos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {activePowerUps.map((powerUp, index) => (
            <div key={index} className="bg-white bg-opacity-20 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{powerUp.name}</div>
                <div className="text-xs opacity-75">
                  {Math.max(0, Math.ceil((powerUp.expiresAt - Date.now()) / 60000))}m
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Cargando misiones épicas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold mb-2">🎮 Misiones Épicas</h1>
            <p className="text-purple-100 text-lg">
              Aventuras que te llevarán a descubrir los secretos de Ibagué
            </p>
          </div>
          
          {/* Estadísticas del jugador */}
          <div className="max-w-4xl mx-auto">
            <PlayerStats />
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Power-ups activos */}
        <ActivePowerUps />

        {/* Logros */}
        <AchievementsSection />

        {/* Mapa de misiones */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <h2 className="text-2xl font-bold">🗺️ Mapa de Aventuras</h2>
            <p className="text-indigo-100 mt-1">Explora zonas y desbloquea nuevas misiones</p>
          </div>
          <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="text-8xl mb-4">🗺️</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">Mapa Interactivo</h3>
              <p className="text-gray-500 mb-4">Explora las zonas de Ibagué de forma interactiva</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-md">
                <div className="bg-white p-3 rounded-xl shadow-sm text-center border-2 border-green-200">
                  <div className="text-2xl mb-1">🏛️</div>
                  <div className="text-xs font-medium text-green-700">Centro Histórico</div>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm text-center border-2 border-blue-200">
                  <div className="text-2xl mb-1">🎼</div>
                  <div className="text-xs font-medium text-blue-700">Conservatorio</div>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm text-center border-2 border-yellow-200">
                  <div className="text-2xl mb-1">🍽️</div>
                  <div className="text-xs font-medium text-yellow-700">Zona Rosa</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de misiones disponibles */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">🎯 Misiones Disponibles</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {availableMissions.length} misiones cerca de ti
              </span>
              {userLocation && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </div>
          </div>
          
          {availableMissions.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">¡Todas las misiones completadas!</h3>
              <p className="text-gray-500 mb-6">
                Has terminado todas las aventuras disponibles en tu nivel. 
                ¡Sigue explorando para desbloquear nuevas zonas!
              </p>
              <button
                onClick={loadAvailableMissions}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
              >
                🔄 Buscar Nuevas Misiones
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableMissions
                .sort((a, b) => a.distance - b.distance)
                .map((mission, index) => (
                  <MissionCard key={mission.id} mission={mission} index={index} />
                ))}
            </div>
          )}
        </div>

        {/* Sección de Boss Battles */}
        <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 rounded-2xl p-8 text-white mb-8">
          <div className="text-center">
            <div className="text-6xl mb-4">⚔️</div>
            <h2 className="text-3xl font-bold mb-2">Boss Battles Épicas</h2>
            <p className="text-yellow-100 mb-6">
              Desafía a los guardianes legendarios de Ibagué
            </p>
            {userLevel >= 10 ? (
              <button className="bg-white text-red-600 px-8 py-4 rounded-xl font-bold hover:shadow-2xl transition-all duration-200 hover:scale-105">
                🔥 ¡ENFRENTAR JEFES!
              </button>
            ) : (
              <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-sm">Alcanza el nivel 10 para desbloquear Boss Battles</p>
                <div className="mt-2 bg-white bg-opacity-20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(userLevel / 10) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Widget de mascota flotante */}
      <div className="fixed bottom-20 left-4 z-30">
        <div className="bg-white rounded-full shadow-lg p-3 cursor-pointer hover:scale-110 transition-transform duration-200">
          <div className="w-12 h-12 text-4xl flex items-center justify-center animate-bounce">
            🌸
          </div>
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            Lv.3
          </div>
        </div>
      </div>
    </div>
  );
};

export default Missions;