import React, { useState, useEffect, useRef } from 'react';
import { gameMissionsSystem } from './GameMissionsSystem.js';

const MissionInterface = ({ mission, userLocation, onMissionComplete, onMissionExit }) => {
  const [currentObjective, setCurrentObjective] = useState(0);
  const [missionProgress, setMissionProgress] = useState({});
  const [showNarrative, setShowNarrative] = useState(true);
  const [narrativeStep, setNarrativeStep] = useState(0);
  const [collectedItems, setCollectedItems] = useState([]);
  const [activeEffects, setActiveEffects] = useState([]);
  const [missionTimer, setMissionTimer] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const audioRef = useRef(null);

  // Inicializar misión
  useEffect(() => {
    if (mission) {
      initializeMission();
    }
  }, [mission]);

  // Timer para misiones con límite de tiempo
  useEffect(() => {
    if (missionTimer && missionTimer > 0) {
      const timer = setTimeout(() => {
        setMissionTimer(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (missionTimer === 0) {
      handleMissionTimeout();
    }
  }, [missionTimer]);

  const initializeMission = () => {
    // Reproducir música ambiental
    playAmbientMusic();
    
    // Inicializar progreso de objetivos
    const initialProgress = {};
    mission.objectives.forEach(obj => {
      initialProgress[obj.id] = { completed: false, progress: 0 };
    });
    setMissionProgress(initialProgress);

    // Configurar timer si la misión tiene límite de tiempo
    if (mission.timeLimit) {
      setMissionTimer(mission.timeLimit);
    }

    // Mostrar narrativa inicial
    if (mission.narrative?.intro) {
      setShowNarrative(true);
      setNarrativeStep(0);
    }
  };

  const playAmbientMusic = () => {
    if (mission.gameElements?.soundEffects) {
      // Simular reproducción de audio ambiental
      console.log(`Playing ambient music: ${mission.gameElements.soundEffects[0]}`);
    }
  };

  // Avanzar narrativa
  const advanceNarrative = () => {
    if (mission.narrative?.progression && narrativeStep < mission.narrative.progression.length) {
      setNarrativeStep(prev => prev + 1);
    } else {
      setShowNarrative(false);
    }
  };

  // Completar objetivo
  const completeObjective = (objectiveId, additionalData = {}) => {
    setMissionProgress(prev => ({
      ...prev,
      [objectiveId]: { completed: true, progress: 100, ...additionalData }
    }));

    // Efectos visuales de completado
    triggerCompletionEffect(objectiveId);

    // Verificar si se completa la misión
    const updatedProgress = { ...missionProgress, [objectiveId]: { completed: true, progress: 100 } };
    const allCompleted = mission.objectives.every(obj => updatedProgress[obj.id]?.completed);
    
    if (allCompleted) {
      setTimeout(() => {
        completeMission();
      }, 1500);
    } else {
      // Avanzar al siguiente objetivo
      const nextIndex = mission.objectives.findIndex(obj => !updatedProgress[obj.id]?.completed);
      if (nextIndex !== -1) {
        setCurrentObjective(nextIndex);
      }
    }
  };

  const triggerCompletionEffect = (objectiveId) => {
    setActiveEffects(prev => [...prev, {
      id: Date.now(),
      type: 'objective_complete',
      objectiveId,
      animation: 'golden_sparkle',
      duration: 2000
    }]);

    // Limpiar efecto después de la duración
    setTimeout(() => {
      setActiveEffects(prev => prev.filter(effect => effect.objectiveId !== objectiveId));
    }, 2000);
  };

  const completeMission = () => {
    // Efectos de completado de misión
    setActiveEffects(prev => [...prev, {
      id: Date.now(),
      type: 'mission_complete',
      animation: 'victory_explosion',
      duration: 4000
    }]);

    // Reproducir sonido de victoria
    console.log('Playing victory sound');

    // Callback con recompensas
    setTimeout(() => {
      if (onMissionComplete) {
        onMissionComplete(mission.rewards, mission.id);
      }
    }, 2000);
  };

  const handleMissionTimeout = () => {
    // Manejar timeout de misión
    setActiveEffects(prev => [...prev, {
      id: Date.now(),
      type: 'mission_failed',
      animation: 'red_fade',
      duration: 3000
    }]);

    setTimeout(() => {
      if (onMissionExit) {
        onMissionExit(false);
      }
    }, 3000);
  };

  // Componente de objetivo individual
  const ObjectiveComponent = ({ objective, index, isActive, progress }) => {
    return (
      <div className={`objective-item p-4 rounded-xl transition-all duration-300 ${
        progress?.completed 
          ? 'bg-green-100 border-2 border-green-400' 
          : isActive 
          ? 'bg-blue-100 border-2 border-blue-400 shadow-lg' 
          : 'bg-gray-100 border-2 border-gray-300'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Ícono de estado */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
              progress?.completed 
                ? 'bg-green-500' 
                : isActive 
                ? 'bg-blue-500 animate-pulse' 
                : 'bg-gray-400'
            }`}>
              {progress?.completed ? '✓' : index + 1}
            </div>
            
            {/* Descripción */}
            <div>
              <p className={`font-medium ${progress?.completed ? 'text-green-800' : 'text-gray-800'}`}>
                {objective.description}
              </p>
              {progress?.progress > 0 && progress?.progress < 100 && (
                <div className="mt-1">
                  <div className="w-32 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Puntos de recompensa */}
          <div className="text-right">
            <span className={`text-sm font-bold ${progress?.completed ? 'text-green-600' : 'text-gray-600'}`}>
              +{objective.points}
            </span>
            <p className="text-xs text-gray-500">puntos</p>
          </div>
        </div>

        {/* Efectos visuales de completado */}
        {activeEffects.some(effect => effect.objectiveId === objective.id) && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-gold-500 opacity-30 rounded-xl animate-ping" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl animate-bounce">🏆</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Narrativa interactiva
  const NarrativeModal = () => {
    if (!showNarrative || !mission.narrative) return null;

    const getCurrentNarrative = () => {
      if (narrativeStep === 0 && mission.narrative.intro) {
        return mission.narrative.intro;
      }
      if (mission.narrative.progression && narrativeStep > 0) {
        return mission.narrative.progression[narrativeStep - 1];
      }
      return '';
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl max-w-lg w-full p-6 text-white relative overflow-hidden">
          {/* Efectos de fondo */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[url('/api/placeholder/400/300')] bg-cover bg-center rounded-2xl" />
          </div>

          {/* Contenido */}
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-4 text-center">📖 {mission.title}</h3>
            
            <div className="bg-black bg-opacity-30 rounded-xl p-4 mb-6 min-h-32">
              <p className="text-sm leading-relaxed">
                {getCurrentNarrative()}
              </p>
            </div>

            {/* Botón de continuar */}
            <div className="flex justify-center">
              <button
                onClick={advanceNarrative}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {narrativeStep < (mission.narrative.progression?.length || 0) ? 'Continuar' : 'Comenzar Misión'}
              </button>
            </div>
          </div>

          {/* Efectos de partículas */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.5}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Simulador de acciones de misión
  const ActionSimulator = () => {
    const currentObj = mission.objectives[currentObjective];
    if (!currentObj || missionProgress[currentObj.id]?.completed) return null;

    const handleAction = (actionType) => {
      switch (actionType) {
        case 'checkin':
          // Simular check-in
          completeObjective(currentObj.id, { method: 'check-in', location: userLocation });
          break;
        case 'photo':
          // Simular tomar foto
          completeObjective(currentObj.id, { method: 'photo', timestamp: Date.now() });
          break;
        case 'explore':
          // Simular exploración
          setTimeout(() => {
            completeObjective(currentObj.id, { method: 'exploration', discoveries: Math.floor(Math.random() * 3) + 1 });
          }, 2000);
          break;
        case 'interact':
          // Simular interacción
          completeObjective(currentObj.id, { method: 'interaction', points_earned: 25 });
          break;
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-lg p-4 mt-4">
        <h4 className="font-bold text-gray-800 mb-3">🎮 Acciones Disponibles</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleAction('checkin')}
            className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
          >
            📍 Hacer Check-in
          </button>
          <button
            onClick={() => handleAction('photo')}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            📸 Tomar Foto
          </button>
          <button
            onClick={() => handleAction('explore')}
            className="bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
          >
            🔍 Explorar Área
          </button>
          <button
            onClick={() => handleAction('interact')}
            className="bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
          >
            🤝 Interactuar
          </button>
        </div>
      </div>
    );
  };

  if (!mission) return null;

  return (
    <div className="mission-interface fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 z-40 overflow-y-auto">
      {/* Header con información de la misión */}
      <div className="bg-black bg-opacity-30 backdrop-blur-sm p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{mission.title}</h2>
            <p className="text-blue-200 text-sm">{mission.description}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Timer */}
            {missionTimer && (
              <div className="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg px-3 py-1">
                <span className="text-red-200 text-sm font-mono">
                  ⏱️ {Math.floor(missionTimer / 60)}:{(missionTimer % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
            
            {/* Botón de salir */}
            <button
              onClick={() => onMissionExit && onMissionExit(false)}
              className="text-white hover:text-red-300 p-2"
            >
              ❌
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-4 space-y-6">
        {/* Información de la misión */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl mb-1">⏱️</div>
              <p className="text-white text-sm">Duración</p>
              <p className="text-blue-200 font-semibold">{mission.estimatedTime}</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🎯</div>
              <p className="text-white text-sm">Dificultad</p>
              <p className={`font-semibold capitalize ${
                mission.difficulty === 'easy' ? 'text-green-400' :
                mission.difficulty === 'medium' ? 'text-yellow-400' :
                mission.difficulty === 'hard' ? 'text-orange-400' :
                'text-red-400'
              }`}>
                {mission.difficulty}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🏆</div>
              <p className="text-white text-sm">Recompensa</p>
              <p className="text-gold-400 font-semibold">+{mission.rewards?.points} pts</p>
            </div>
          </div>

          {/* Barra de progreso general */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white text-sm font-medium">Progreso General</span>
              <span className="text-blue-200 text-sm">
                {Object.values(missionProgress).filter(p => p.completed).length} / {mission.objectives.length}
              </span>
            </div>
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ 
                  width: `${(Object.values(missionProgress).filter(p => p.completed).length / mission.objectives.length) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>

        {/* Lista de objetivos */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white mb-4">📋 Objetivos</h3>
          {mission.objectives.map((objective, index) => (
            <ObjectiveComponent
              key={objective.id}
              objective={objective}
              index={index}
              isActive={index === currentObjective}
              progress={missionProgress[objective.id]}
            />
          ))}
        </div>

        {/* Simulador de acciones */}
        <ActionSimulator />

        {/* Botón de pista */}
        {!showNarrative && (
          <div className="flex justify-center">
            <button
              onClick={() => setShowHint(!showHint)}
              className="bg-yellow-600 bg-opacity-20 border border-yellow-400 text-yellow-200 px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              💡 {showHint ? 'Ocultar Pista' : 'Mostrar Pista'}
            </button>
          </div>
        )}

        {/* Pista */}
        {showHint && (
          <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-xl p-4">
            <p className="text-yellow-200 text-sm">
              💡 <strong>Pista:</strong> {mission.objectives[currentObjective]?.hint || 'Explora el área y busca elementos interactivos.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de narrativa */}
      <NarrativeModal />

      {/* Efectos visuales globales */}
      {activeEffects.some(effect => effect.type === 'mission_complete') && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-gold-500 opacity-20 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-8xl animate-bounce">🎉</div>
          </div>
          {/* Confetti */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-red-400 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MissionInterface;