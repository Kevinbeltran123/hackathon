import React, { useState, useEffect, useRef } from 'react';
import { gameMissionsSystem } from './GameMissionsSystem.js';

const GameMap = ({ userLevel = 1, userPoints = 0, onMissionStart, onZoneUnlock }) => {
  const [mapData, setMapData] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [animatingElements, setAnimatingElements] = useState([]);
  const [playerStats, setPlayerStats] = useState({
    level: userLevel,
    experience: 0,
    streak: 0
  });
  const canvasRef = useRef(null);

  // Inicializar mapa al cargar
  useEffect(() => {
    const initialMapData = gameMissionsSystem.generateGameMap();
    setMapData(initialMapData);
  }, []);

  // Actualizar datos cuando cambia el nivel del usuario
  useEffect(() => {
    if (mapData) {
      const updatedMapData = gameMissionsSystem.generateGameMap();
      setMapData(updatedMapData);
    }
  }, [userLevel, userPoints]);

  // Manejar clic en zona
  const handleZoneClick = (zone) => {
    if (!zone.isUnlocked && !gameMissionsSystem.canUnlockZone(zone.id, userLevel)) {
      // Mostrar mensaje de nivel requerido
      showLevelRequiredMessage(zone);
      return;
    }

    if (!zone.isUnlocked && gameMissionsSystem.canUnlockZone(zone.id, userLevel)) {
      // Desbloquear zona con animación
      unlockZoneWithAnimation(zone);
      return;
    }

    // Abrir modal de zona
    setSelectedZone(zone);
    setShowZoneModal(true);
  };

  // Desbloquear zona con efectos visuales
  const unlockZoneWithAnimation = (zone) => {
    const unlockResult = gameMissionsSystem.unlockZone(zone.id, userLevel);
    
    if (unlockResult.success) {
      // Trigger unlock animation
      setAnimatingElements(prev => [...prev, {
        type: 'zone_unlock',
        zoneId: zone.id,
        animation: unlockResult.unlockAnimation,
        duration: 3000
      }]);
      
      // Update map data
      setTimeout(() => {
        const updatedMapData = gameMissionsSystem.generateGameMap();
        setMapData(updatedMapData);
        
        // Callback para actualizar puntos del usuario
        if (onZoneUnlock) {
          onZoneUnlock(unlockResult.rewards);
        }
      }, 1000);

      // Limpiar animaciones
      setTimeout(() => {
        setAnimatingElements(prev => prev.filter(el => el.type !== 'zone_unlock' || el.zoneId !== zone.id));
      }, 3000);
    }
  };

  // Mostrar mensaje de nivel requerido
  const showLevelRequiredMessage = (zone) => {
    setAnimatingElements(prev => [...prev, {
      type: 'level_required',
      zoneId: zone.id,
      message: `Necesitas nivel ${zone.unlockLevel}`,
      duration: 2000
    }]);

    setTimeout(() => {
      setAnimatingElements(prev => prev.filter(el => el.type !== 'level_required' || el.zoneId !== zone.id));
    }, 2000);
  };

  // Iniciar misión
  const startMission = (mission) => {
    setShowZoneModal(false);
    if (onMissionStart) {
      onMissionStart(mission);
    }
  };

  // Componente de zona individual
  const ZoneComponent = ({ zone, index }) => {
    const isAnimating = animatingElements.some(el => el.zoneId === zone.id);
    const animationData = animatingElements.find(el => el.zoneId === zone.id);
    
    return (
      <div
        key={zone.id}
        className={`
          zone-container absolute cursor-pointer transform transition-all duration-500
          ${zone.isUnlocked ? 'hover:scale-110 hover:z-20' : 'hover:scale-105'}
          ${isAnimating ? 'z-30' : 'z-10'}
        `}
        style={{
          left: `${zone.coordinates.x * 120 + 50}px`,
          top: `${zone.coordinates.y * 120 + 50}px`
        }}
        onClick={() => handleZoneClick(zone)}
      >
        {/* Zona Base */}
        <div
          className={`
            zone-base w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold
            border-4 shadow-lg relative
            ${zone.isUnlocked 
              ? `bg-gradient-to-br from-white to-gray-100 border-${zone.color} shadow-${zone.color}/30` 
              : 'bg-gradient-to-br from-gray-300 to-gray-500 border-gray-400 shadow-gray-400/30'
            }
            ${isAnimating ? 'animate-pulse' : ''}
          `}
          style={{
            backgroundColor: zone.isUnlocked ? zone.color : '#9CA3AF',
            boxShadow: zone.isUnlocked 
              ? `0 8px 25px ${zone.color}40, 0 0 20px ${zone.color}20` 
              : '0 4px 15px rgba(156, 163, 175, 0.3)'
          }}
        >
          {/* Icono de la zona */}
          <span className="text-white drop-shadow-lg">
            {zone.id === 'centro_historico' && '🏛️'}
            {zone.id === 'barrio_belen' && '🏠'}
            {zone.id === 'zona_rosa' && '🍽️'}
            {zone.id === 'conservatorio' && '🎼'}
            {zone.id === 'jardin_botanico' && '🌺'}
            {zone.id === 'mirador' && '⛰️'}
          </span>

          {/* Indicador de nivel requerido */}
          {!zone.isUnlocked && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
              {zone.unlockLevel}
            </div>
          )}

          {/* Indicador de misiones disponibles */}
          {zone.isUnlocked && (
            <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
              {gameMissionsSystem.getAvailableMissions(zone.id, userLevel).length}
            </div>
          )}
        </div>

        {/* Nombre de la zona */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <p className={`text-xs font-semibold whitespace-nowrap ${zone.isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
            {zone.name}
          </p>
        </div>

        {/* Efectos de animación */}
        {isAnimating && animationData?.type === 'zone_unlock' && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Efecto de desbloqueo */}
            <div className="absolute inset-0 rounded-full border-4 border-yellow-400 animate-ping"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-yellow-400 text-4xl animate-bounce">✨</div>
            </div>
            {/* Confetti */}
            <div className="absolute -inset-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-2 h-2 rounded-full animate-bounce bg-yellow-400`}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '1s'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Mensaje de nivel requerido */}
        {isAnimating && animationData?.type === 'level_required' && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap animate-bounce">
            {animationData.message}
          </div>
        )}

        {/* Efectos de aura para zonas desbloqueadas */}
        {zone.isUnlocked && !isAnimating && (
          <div className="absolute inset-0 pointer-events-none">
            <div 
              className="absolute inset-0 rounded-full opacity-20 animate-pulse"
              style={{
                backgroundColor: zone.color,
                filter: 'blur(8px)'
              }}
            />
          </div>
        )}
      </div>
    );
  };

  // Componente de caminos conectores
  const PathComponent = ({ fromZone, toZone }) => {
    const from = mapData?.zones.find(z => z.id === fromZone);
    const to = mapData?.zones.find(z => z.id === toZone);
    
    if (!from || !to) return null;

    const fromX = from.coordinates.x * 120 + 90;
    const fromY = from.coordinates.y * 120 + 90;
    const toX = to.coordinates.x * 120 + 90;
    const toY = to.coordinates.y * 120 + 90;

    const length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
    const angle = Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI;

    return (
      <div
        className="absolute origin-left"
        style={{
          left: `${fromX}px`,
          top: `${fromY}px`,
          width: `${length}px`,
          height: '4px',
          transform: `rotate(${angle}deg)`,
          transformOrigin: '0 50%'
        }}
      >
        <div className={`h-full ${to.isUnlocked ? 'bg-gradient-to-r from-yellow-400 to-green-400' : 'bg-gray-300'} rounded-full`}>
          {to.isUnlocked && (
            <div className="h-full bg-gradient-to-r from-yellow-400 to-green-400 rounded-full animate-pulse shadow-lg" />
          )}
        </div>
      </div>
    );
  };

  // Componente del jugador avatar
  const PlayerAvatar = () => {
    if (!mapData?.playerAvatar) return null;

    const { position, level, activePowerUps, visualEffects } = mapData.playerAvatar;

    return (
      <div
        className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${position.x * 120 + 90}px`,
          top: `${position.y * 120 + 90}px`
        }}
      >
        {/* Avatar base */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg animate-bounce">
            {level}
          </div>

          {/* Efectos visuales activos */}
          {visualEffects?.includes('fire_aura') && (
            <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-pulse">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500 opacity-30 animate-ping" />
            </div>
          )}

          {visualEffects?.includes('golden_glow') && (
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-yellow-400 to-gold-500 opacity-40 animate-pulse blur-sm" />
          )}

          {/* Indicadores de power-ups activos */}
          {activePowerUps?.length > 0 && (
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <div className="flex gap-1">
                {activePowerUps.map((powerUp, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-spin"
                    title={powerUp.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Modal de zona
  const ZoneModal = () => {
    if (!showZoneModal || !selectedZone) return null;

    const availableMissions = gameMissionsSystem.getAvailableMissions(selectedZone.id, userLevel);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div 
            className="p-6 rounded-t-2xl text-white relative"
            style={{
              background: `linear-gradient(135deg, ${selectedZone.color} 0%, ${selectedZone.color}CC 100%)`
            }}
          >
            <button
              onClick={() => setShowZoneModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-200"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-2">{selectedZone.name}</h2>
            <p className="text-sm opacity-90">{selectedZone.description}</p>
          </div>

          {/* Contenido */}
          <div className="p-6">
            {/* Misiones disponibles */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">🎯 Misiones Disponibles</h3>
              {availableMissions.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay misiones disponibles en este momento.</p>
              ) : (
                <div className="space-y-3">
                  {availableMissions.map(mission => (
                    <div
                      key={mission.id}
                      className="border rounded-xl p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => startMission(mission)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-800">{mission.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          mission.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                          mission.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          mission.difficulty === 'hard' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {mission.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{mission.description}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>⏱️ {mission.estimatedTime}</span>
                        <span>🏆 {mission.rewards?.points} puntos</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Boss Battle */}
            {selectedZone.boss && userLevel >= (gameMissionsSystem.bossBattles.get(selectedZone.boss)?.requiredLevel || 999) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">⚔️ Boss Battle</h3>
                <div className="border-2 border-red-300 rounded-xl p-4 bg-red-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-red-800">🔥 {gameMissionsSystem.bossBattles.get(selectedZone.boss)?.name}</h4>
                      <p className="text-sm text-red-600">{gameMissionsSystem.bossBattles.get(selectedZone.boss)?.title}</p>
                    </div>
                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                      onClick={() => {
                        // Iniciar boss battle
                        console.log('Starting boss battle:', selectedZone.boss);
                        setShowZoneModal(false);
                      }}
                    >
                      ¡DESAFIAR!
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!mapData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="game-map-container relative bg-gradient-to-br from-blue-100 via-green-50 to-purple-50 rounded-2xl overflow-hidden">
      {/* Fondo del mapa */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/api/placeholder/800/600')] bg-cover bg-center" />
      </div>

      {/* Contenedor del mapa scrolleable */}
      <div className="relative w-full h-96 overflow-auto">
        <div className="relative" style={{ width: '800px', height: '600px' }}>
          {/* Caminos conectores */}
          {mapData.zones.map(zone => 
            zone.pathConnections?.map(connectionId => (
              <PathComponent
                key={`${zone.id}-${connectionId}`}
                fromZone={zone.id}
                toZone={connectionId}
              />
            ))
          )}

          {/* Zonas */}
          {mapData.zones.map((zone, index) => (
            <ZoneComponent key={zone.id} zone={zone} index={index} />
          ))}

          {/* Avatar del jugador */}
          <PlayerAvatar />

          {/* Efectos de partículas globales */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Partículas flotantes */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Stats del jugador en la esquina */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-xl p-3 shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">👤</span>
          <span className="font-bold text-blue-600">Nivel {playerStats.level}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span>💎</span>
          <span>{userPoints} puntos</span>
        </div>
        {playerStats.streak > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span>🔥</span>
            <span>{playerStats.streak} días</span>
          </div>
        )}
      </div>

      {/* Modal de zona */}
      <ZoneModal />
    </div>
  );
};

export default GameMap;