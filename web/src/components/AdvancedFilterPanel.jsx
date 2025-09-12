import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/filters.css';

const IBAGUE_CENTER = { lat: 4.4399, lng: -75.2050 };

const INTEREST_CATEGORIES = [
  {
    id: 'gastro',
    name: 'Gastronomía',
    icon: '🍽️',
    color: '#EF4444',
    subcategories: ['restaurante', 'café', 'panadería', 'bar']
  },
  {
    id: 'cultura',
    name: 'Cultura e Historia',
    icon: '🏛️',
    color: '#8B5CF6',
    subcategories: ['museo', 'iglesia', 'teatro', 'monumento']
  },
  {
    id: 'shopping',
    name: 'Compras',
    icon: '🛒',
    color: '#F59E0B',
    subcategories: ['centro comercial', 'artesanías', 'mercado']
  },
  {
    id: 'naturaleza',
    name: 'Naturaleza',
    icon: '🌿',
    color: '#10B981',
    subcategories: ['parque', 'mirador', 'sendero']
  },
  {
    id: 'recreacion',
    name: 'Entretenimiento',
    icon: '🎭',
    color: '#3B82F6',
    subcategories: ['cine', 'karaoke', 'juegos']
  },
  {
    id: 'servicios',
    name: 'Servicios',
    icon: '🏥',
    color: '#6B7280',
    subcategories: ['banco', 'farmacia', 'hospital']
  }
];

const TIME_OPTIONS = [
  { value: 1, label: '1 hora', places: '2-3 lugares', duration: 60 },
  { value: 2, label: '2 horas', places: '4-5 lugares', duration: 120 },
  { value: 3, label: '3 horas', places: '6-8 lugares', duration: 180 },
  { value: 4, label: '4 horas', places: 'Medio día', duration: 240 },
  { value: 8, label: 'Día completo', places: '10+ lugares', duration: 480 }
];

const RADIUS_OPTIONS = [
  { value: 500, label: '500m', walkTime: '5-7 min caminando', color: '#EF4444' },
  { value: 1000, label: '1km', walkTime: '12-15 min', color: '#F59E0B' },
  { value: 1500, label: '1.5km', walkTime: '18-20 min', color: '#10B981' },
  { value: 2000, label: '2km', walkTime: '25-30 min', color: '#3B82F6' },
  { value: 3000, label: '3km', walkTime: 'hasta 40 min', color: '#8B5CF6' }
];

export default function AdvancedFilterPanel({ 
  isOpen, 
  onClose, 
  onFiltersApply,
  initialFilters = {},
  userId = null
}) {
  const [selectedInterests, setSelectedInterests] = useState(
    initialFilters.interests || ['gastro', 'cultura']
  );
  const [selectedTime, setSelectedTime] = useState(initialFilters.time || 3);
  const [selectedRadius, setSelectedRadius] = useState(initialFilters.radius || 2000);
  const [isApplying, setIsApplying] = useState(false);
  const [previewResults, setPreviewResults] = useState(null);
  const [showFallbackMessage, setShowFallbackMessage] = useState(false);

  // Ensure at least one interest is always selected
  useEffect(() => {
    if (selectedInterests.length === 0) {
      setSelectedInterests(['gastro']); // Auto-select first interest if none selected
    }
  }, [selectedInterests.length]);

  // Generar preview de resultados en tiempo real
  useEffect(() => {
    if (isOpen) {
      const timeoutId = setTimeout(() => {
        generatePreview();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [selectedInterests, selectedTime, selectedRadius, isOpen]);

  const generatePreview = async () => {
    try {
      const filters = {
        interests: selectedInterests,
        time: selectedTime,
        radius: selectedRadius,
        lat: IBAGUE_CENTER.lat,
        lng: IBAGUE_CENTER.lng,
        user_id: userId // Include user_id for preferences
      };
      
      const response = await fetch('/api/places/filtered', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });
      
      if (response.ok) {
        const data = await response.json();
        setPreviewResults(data);
        setShowFallbackMessage(data.fallback || false);
      }
    } catch (error) {
      console.error('Error generating preview:', error);
    }
  };

  const handleInterestToggle = (interestId) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        // Don't allow removing the last interest
        if (prev.length <= 1) {
          return prev; // Keep at least one interest selected
        }
        return prev.filter(id => id !== interestId);
      } else {
        return [...prev, interestId];
      }
    });
  };

  const handleApplyFilters = async () => {
    setIsApplying(true);
    
    const filters = {
      interests: selectedInterests,
      time: selectedTime,
      radius: selectedRadius,
      center: IBAGUE_CENTER
    };

    // Save preferences to SQLite via API if userId provided
    if (userId) {
      try {
        const response = await fetch(`/api/preferences/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            interests: selectedInterests,
            budget_min: null, // Not implemented in UI yet
            budget_max: null, // Not implemented in UI yet
            time_start: null, // Not implemented in UI yet
            time_end: null    // Not implemented in UI yet
          })
        });
        
        if (!response.ok) {
          console.error('Failed to save preferences to database');
        }
      } catch (error) {
        console.error('Error saving preferences:', error);
      }
    }

    // Guardar preferencias para futuras sesiones (localStorage fallback)
    localStorage.setItem('rutasVivas_filters', JSON.stringify(filters));
    
    await onFiltersApply(filters);
    
    setTimeout(() => {
      setIsApplying(false);
      onClose();
    }, 1000);
  };

  const resetFilters = () => {
    setSelectedInterests(['gastro', 'cultura']);
    setSelectedTime(3);
    setSelectedRadius(2000);
    localStorage.removeItem('rutasVivas_filters');
  };

  const selectedTimeOption = TIME_OPTIONS.find(opt => opt.value === selectedTime);
  const selectedRadiusOption = RADIUS_OPTIONS.find(opt => opt.value === selectedRadius);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="gradient-primary text-white p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Personalizar Experiencia</h2>
                  <p className="text-blue-100 text-sm">Descubre Ibagué a tu medida</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white text-xl transition-all duration-200 hover:scale-110"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {/* Selector de Intereses */}
              <div className="filter-section">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="text-xl">❤️</span>
                  Mis Intereses
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {INTEREST_CATEGORIES.map(category => (
                    <motion.button
                      key={category.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleInterestToggle(category.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        selectedInterests.includes(category.id)
                          ? 'border-brand-green bg-gradient-to-r from-brand-green/10 to-brand-blue/10 shadow-lg scale-105'
                          : 'border-gray-200 hover:border-brand-green hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{category.icon}</span>
                        <span className="font-semibold text-sm">{category.name}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {category.subcategories.join(', ')}
                      </div>
                    </motion.button>
                  ))}
                </div>
                {selectedInterests.length === 0 && (
                  <p className="text-sm text-red-500 mt-2">
                    ⚠️ Selecciona al menos un interés
                  </p>
                )}
                {showFallbackMessage && (
                  <p className="text-sm text-orange-600 mt-2 bg-orange-50 p-2 rounded">
                    ℹ️ Mostrando opciones cercanas por tus intereses
                  </p>
                )}
              </div>

              {/* Tiempo Disponible */}
              <div className="filter-section">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="text-xl">⏰</span>
                  Tiempo Disponible
                </h3>
                <div className="space-y-3">
                  {TIME_OPTIONS.map(option => (
                    <motion.button
                      key={option.value}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedTime(option.value)}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        selectedTime === option.value
                          ? 'border-brand-green bg-gradient-to-r from-brand-green/10 to-brand-blue/10 shadow-lg scale-105'
                          : 'border-gray-200 hover:border-brand-green hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.places}</div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedTime === option.value 
                            ? 'bg-brand-green border-brand-green' 
                            : 'border-gray-300'
                        }`}>
                          {selectedTime === option.value && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Radio de Caminata */}
              <div className="filter-section">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="text-xl">🚶</span>
                  Radio de Caminata
                </h3>
                <div className="space-y-3">
                  {RADIUS_OPTIONS.map(option => (
                    <motion.button
                      key={option.value}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedRadius(option.value)}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        selectedRadius === option.value
                          ? 'border-brand-amber bg-gradient-to-r from-brand-amber/10 to-orange-500/10 shadow-lg scale-105'
                          : 'border-gray-200 hover:border-brand-amber hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.walkTime}</div>
                        </div>
                        <div 
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedRadius === option.value ? 'border-brand-amber' : 'border-gray-300'
                          }`}
                          style={{ 
                            backgroundColor: selectedRadius === option.value ? option.color + '20' : 'transparent' 
                          }}
                        >
                          {selectedRadius === option.value && (
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: option.color }}
                            ></div>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Preview de Resultados */}
              {previewResults && (
                <div className="filter-section bg-blue-50 p-4 rounded-xl">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-xl">👀</span>
                    Vista Previa
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="bg-white p-2 rounded">
                      <div className="font-bold text-blue-600">{previewResults.totalPlaces || 0}</div>
                      <div className="text-gray-600">Lugares</div>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <div className="font-bold text-green-600">{previewResults.estimatedTime || 0}min</div>
                      <div className="text-gray-600">Duración</div>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <div className="font-bold text-orange-600">{(previewResults.avgDistance || 0).toFixed(1)}km</div>
                      <div className="text-gray-600">Caminata</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 space-y-4">
              <div className="flex gap-3">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                >
                  🔄 Resetear
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleApplyFilters}
                  disabled={selectedInterests.length === 0 || isApplying}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                    selectedInterests.length === 0 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : isApplying
                      ? 'bg-brand-blue text-white'
                      : 'btn-primary'
                  }`}
                >
                  {isApplying ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Aplicando...
                    </div>
                  ) : (
                    '✨ Aplicar Filtros'
                  )}
                </motion.button>
              </div>
              
              <div className="text-center text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                📍 Desde el centro de Ibagué • {selectedRadiusOption?.label} radio
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}