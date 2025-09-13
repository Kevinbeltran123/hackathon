import React, { useState, useEffect, useRef } from 'react';
import { gameMissionsSystem } from './GameMissionsSystem.js';

const VirtualPetSystem = ({ userCheckins = 0, userPoints = 0, onPetEvolution, onPetInteraction }) => {
  const [activePet, setActivePet] = useState(null);
  const [petStats, setPetStats] = useState({
    happiness: 80,
    energy: 70,
    growth: 15,
    bond: 25
  });
  const [petAnimationState, setPetAnimationState] = useState('idle');
  const [showPetModal, setShowPetModal] = useState(false);
  const [availablePets, setAvailablePets] = useState([]);
  const [activePowerUps, setActivePowerUps] = useState([]);
  const [showPowerUpShop, setShowPowerUpShop] = useState(false);
  const [petInteractions, setPetInteractions] = useState([]);
  const [lastInteraction, setLastInteraction] = useState(null);
  const petCanvasRef = useRef(null);

  // Inicializar sistema de mascotas
  useEffect(() => {
    initializePetSystem();
  }, []);

  // Actualizar mascota basado en check-ins
  useEffect(() => {
    if (activePet && userCheckins > 0) {
      checkPetEvolution();
      updatePetStats();
    }
  }, [userCheckins, activePet]);

  // Animación continua de la mascota
  useEffect(() => {
    if (activePet) {
      const animationInterval = setInterval(() => {
        updatePetAnimation();
      }, 3000);

      return () => clearInterval(animationInterval);
    }
  }, [activePet, petStats]);

  const initializePetSystem = () => {
    // Cargar mascota inicial (Ocobo Bebé)
    const ocoboPet = gameMissionsSystem.pets.get('ocobo_baby');
    if (ocoboPet) {
      setActivePet({
        ...ocoboPet,
        currentStage: 0,
        experiencePoints: userCheckins,
        isActive: true,
        adoptedAt: Date.now()
      });
    }

    // Cargar power-ups disponibles
    const powerUps = Array.from(gameMissionsSystem.powerUps.values());
    setAvailablePets([ocoboPet]);
  };

  const checkPetEvolution = () => {
    if (!activePet) return;

    const currentStageData = activePet.evolutionStages[activePet.currentStage];
    const nextStage = activePet.currentStage + 1;

    if (nextStage < activePet.evolutionStages.length) {
      const nextStageData = activePet.evolutionStages[nextStage];
      
      if (userCheckins >= nextStageData.checkinsRequired) {
        evolvePet(nextStage);
      }
    }
  };

  const evolvePet = (newStage) => {
    const evolutionData = activePet.evolutionStages[newStage];
    
    setActivePet(prev => ({
      ...prev,
      currentStage: newStage
    }));

    setPetAnimationState('evolution');
    
    // Callback para actualizar el sistema principal
    if (onPetEvolution) {
      onPetEvolution({
        petId: activePet.id,
        newStage: newStage,
        newAbilities: evolutionData.abilities,
        evolutionBonus: 200
      });
    }

    setTimeout(() => {
      setPetAnimationState('happy');
    }, 3000);
  };

  const updatePetStats = () => {
    setPetStats(prev => {
      const newStats = { ...prev };
      
      // La felicidad aumenta con check-ins frecuentes
      if (userCheckins > 0) {
        newStats.happiness = Math.min(100, prev.happiness + 5);
      } else {
        newStats.happiness = Math.max(0, prev.happiness - 1);
      }

      // La energía se regenera con el tiempo pero se gasta con actividades
      newStats.energy = Math.min(100, prev.energy + 2);

      // El crecimiento aumenta con el tiempo y las interacciones
      newStats.growth = Math.min(100, prev.growth + 1);

      // El vínculo mejora con interacciones regulares
      if (petInteractions.length > 0) {
        newStats.bond = Math.min(100, prev.bond + 3);
      }

      return newStats;
    });
  };

  const updatePetAnimation = () => {
    if (petStats.happiness > 80) {
      setPetAnimationState('happy');
    } else if (petStats.happiness < 30) {
      setPetAnimationState('sad');
    } else if (petStats.energy < 20) {
      setPetAnimationState('tired');
    } else {
      setPetAnimationState('idle');
    }
  };

  // Interacciones con la mascota
  const interactWithPet = (interactionType) => {
    const interaction = {
      id: Date.now(),
      type: interactionType,
      timestamp: Date.now(),
      effect: getInteractionEffect(interactionType)
    };

    setPetInteractions(prev => [...prev.slice(-9), interaction]);
    setLastInteraction(interaction);

    // Aplicar efectos de la interacción
    applyInteractionEffects(interaction.effect);

    // Callback
    if (onPetInteraction) {
      onPetInteraction(interaction);
    }

    // Animación especial
    setPetAnimationState(interactionType);
    setTimeout(() => {
      setPetAnimationState('happy');
    }, 2000);
  };

  const getInteractionEffect = (type) => {
    switch (type) {
      case 'pet':
        return { happiness: 10, bond: 5, message: '¡Le encantan las caricias!' };
      case 'feed':
        return { happiness: 15, energy: 20, message: '¡Ñam ñam! Está delicioso' };
      case 'play':
        return { happiness: 20, energy: -10, bond: 10, message: '¡Qué divertido!' };
      case 'explore':
        return { energy: -15, growth: 15, bond: 8, message: '¡Vamos de aventura!' };
      default:
        return { happiness: 5, message: '¡Gracias por interactuar!' };
    }
  };

  const applyInteractionEffects = (effect) => {
    setPetStats(prev => ({
      happiness: Math.max(0, Math.min(100, prev.happiness + (effect.happiness || 0))),
      energy: Math.max(0, Math.min(100, prev.energy + (effect.energy || 0))),
      growth: Math.max(0, Math.min(100, prev.growth + (effect.growth || 0))),
      bond: Math.max(0, Math.min(100, prev.bond + (effect.bond || 0)))
    }));
  };

  // Activar power-up
  const activatePowerUp = (powerUpId) => {
    const powerUp = gameMissionsSystem.powerUps.get(powerUpId);
    if (!powerUp) return;

    if (userPoints < powerUp.cost) {
      alert('No tienes suficientes puntos para este power-up');
      return;
    }

    const activePowerUp = {
      ...powerUp,
      activatedAt: Date.now(),
      expiresAt: Date.now() + powerUp.duration,
      isActive: true
    };

    setActivePowerUps(prev => [...prev, activePowerUp]);

    // Efecto visual
    setPetAnimationState('powered');
    setTimeout(() => {
      setPetAnimationState('happy');
    }, 1000);
  };

  // Componente de la mascota animada
  const AnimatedPet = () => {
    if (!activePet) return null;

    const currentStageData = activePet.evolutionStages[activePet.currentStage];
    
    return (
      <div className="relative">
        {/* Contenedor de la mascota */}
        <div className={`pet-container w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
          petAnimationState === 'happy' ? 'animate-bounce' :
          petAnimationState === 'evolution' ? 'animate-spin' :
          petAnimationState === 'sad' ? 'animate-pulse opacity-70' :
          petAnimationState === 'tired' ? 'animate-pulse opacity-50' :
          petAnimationState === 'powered' ? 'animate-ping' :
          ''
        }`}>
          {/* Representación visual de la mascota */}
          <div className="relative">
            {/* Mascota base */}
            <div className={`text-6xl transition-all duration-300 ${
              petAnimationState === 'evolution' ? 'scale-150' : 'scale-100'
            }`}>
              {activePet.id === 'ocobo_baby' ? '🌸' : '🦅'}
            </div>

            {/* Efectos especiales */}
            {petAnimationState === 'evolution' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 border-4 border-yellow-400 rounded-full animate-spin"></div>
              </div>
            )}

            {/* Power-up activo */}
            {activePowerUps.length > 0 && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-spin">
                <span className="text-white text-xs">✨</span>
              </div>
            )}

            {/* Indicador de felicidad */}
            {petStats.happiness > 80 && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <span key={i} className="text-red-500 text-sm animate-ping" style={{animationDelay: `${i * 0.2}s`}}>
                      ❤️
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mensaje de interacción */}
        {lastInteraction && Date.now() - lastInteraction.timestamp < 3000 && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-2 shadow-lg animate-fade-in">
            <p className="text-xs text-gray-800 whitespace-nowrap">
              {lastInteraction.effect.message}
            </p>
          </div>
        )}

        {/* Nombre y etapa */}
        <div className="text-center mt-2">
          <p className="text-sm font-semibold text-gray-800">
            {currentStageData.name}
          </p>
          <p className="text-xs text-gray-600">
            Nivel {activePet.currentStage + 1}
          </p>
        </div>
      </div>
    );
  };

  // Barras de estado de la mascota
  const PetStatusBars = () => {
    const statusBars = [
      { label: '😊 Felicidad', value: petStats.happiness, color: 'yellow' },
      { label: '⚡ Energía', value: petStats.energy, color: 'blue' },
      { label: '🌱 Crecimiento', value: petStats.growth, color: 'green' },
      { label: '💕 Vínculo', value: petStats.bond, color: 'pink' }
    ];

    return (
      <div className="grid grid-cols-2 gap-2 mt-4">
        {statusBars.map(stat => (
          <div key={stat.label} className="text-center">
            <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div 
                className={`h-2 rounded-full transition-all duration-500 bg-${stat.color}-500`}
                style={{ width: `${stat.value}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{stat.value}%</p>
          </div>
        ))}
      </div>
    );
  };

  // Botones de interacción
  const InteractionButtons = () => {
    const interactions = [
      { type: 'pet', icon: '👋', label: 'Acariciar', cost: 0 },
      { type: 'feed', icon: '🍯', label: 'Alimentar', cost: 10 },
      { type: 'play', icon: '🎾', label: 'Jugar', cost: 5 },
      { type: 'explore', icon: '🗺️', label: 'Explorar', cost: 15 }
    ];

    return (
      <div className="grid grid-cols-2 gap-2 mt-4">
        {interactions.map(interaction => (
          <button
            key={interaction.type}
            onClick={() => interactWithPet(interaction.type)}
            disabled={userPoints < interaction.cost}
            className={`p-3 rounded-lg transition-all duration-200 ${
              userPoints >= interaction.cost
                ? 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="text-lg mb-1">{interaction.icon}</div>
            <div className="text-xs font-medium">{interaction.label}</div>
            {interaction.cost > 0 && (
              <div className="text-xs text-gray-500">-{interaction.cost} pts</div>
            )}
          </button>
        ))}
      </div>
    );
  };

  // Modal de la mascota
  const PetModal = () => {
    if (!showPetModal || !activePet) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-t-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">🐾 Mi Mascota</h2>
                <p className="text-pink-100 text-sm">{activePet.description}</p>
              </div>
              <button
                onClick={() => setShowPetModal(false)}
                className="text-white hover:text-pink-200"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-6">
            {/* Mascota animada */}
            <div className="flex justify-center mb-6">
              <AnimatedPet />
            </div>

            {/* Información de evolución */}
            <div className="bg-purple-50 rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-purple-800 mb-2">📈 Progreso de Evolución</h3>
              <div className="mb-2">
                <div className="flex justify-between text-sm">
                  <span>Check-ins: {userCheckins}</span>
                  <span>
                    Siguiente: {
                      activePet.currentStage < activePet.evolutionStages.length - 1 
                        ? activePet.evolutionStages[activePet.currentStage + 1].checkinsRequired
                        : 'MAX'
                    }
                  </span>
                </div>
                <div className="w-full h-2 bg-purple-200 rounded-full mt-1">
                  <div 
                    className="h-2 bg-purple-600 rounded-full transition-all duration-300"
                    style={{ 
                      width: activePet.currentStage < activePet.evolutionStages.length - 1
                        ? `${Math.min(100, (userCheckins / activePet.evolutionStages[activePet.currentStage + 1].checkinsRequired) * 100)}%`
                        : '100%'
                    }}
                  />
                </div>
              </div>

              {/* Habilidades actuales */}
              <div>
                <p className="text-sm font-medium text-purple-700 mb-1">✨ Habilidades Activas:</p>
                <div className="flex flex-wrap gap-1">
                  {activePet.evolutionStages[activePet.currentStage].abilities.map(ability => (
                    <span key={ability} className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                      {ability.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Barras de estado */}
            <PetStatusBars />

            {/* Botones de interacción */}
            <InteractionButtons />

            {/* Power-ups activos */}
            {activePowerUps.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-xl">
                <h4 className="font-semibold text-yellow-800 mb-2">⚡ Power-ups Activos</h4>
                {activePowerUps.map(powerUp => (
                  <div key={powerUp.id} className="flex justify-between items-center text-sm">
                    <span>{powerUp.name}</span>
                    <span className="text-yellow-600">
                      {Math.max(0, Math.ceil((powerUp.expiresAt - Date.now()) / 60000))}m
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Widget compacto de mascota para mostrar siempre
  const CompactPetWidget = () => {
    if (!activePet) return null;

    return (
      <div className="fixed bottom-20 left-4 z-30">
        <div 
          className="bg-white rounded-full shadow-lg p-3 cursor-pointer hover:scale-110 transition-transform duration-200"
          onClick={() => setShowPetModal(true)}
        >
          <AnimatedPet />
          
          {/* Indicador de necesidades */}
          {(petStats.happiness < 50 || petStats.energy < 30) && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-white text-xs">!</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Widget compacto siempre visible */}
      <CompactPetWidget />

      {/* Modal completo de mascota */}
      <PetModal />
    </>
  );
};

export default VirtualPetSystem;