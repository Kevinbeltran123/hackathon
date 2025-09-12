import React from 'react';

// Category colors matching RouteManager - Temática de ocobos
const CATEGORY_COLORS = {
  'gastro': '#FFB020',      // Dorado del logo para gastronomía
  'cultura': '#E74C7C',     // Rosa ocobo para cultura
  'naturaleza': '#2D6C4F',  // Verde bosque para naturaleza
  'shopping': '#FFB020',    // Dorado del logo para compras
  'recreacion': '#2196F3',  // Azul cielo para entretenimiento
  'servicios': '#8D6E63',   // Marrón tronco para servicios
  'historia': '#8D6E63',    // Marrón tronco para historia
  'religion': '#E74C7C',    // Rosa ocobo para religión
  'educacion': '#2196F3',   // Azul cielo para educación
  'default': '#757575'      // Gris para categorías desconocidas
};

const CATEGORY_LABELS = {
  'gastro': 'Gastronomía',
  'cultura': 'Cultura',
  'naturaleza': 'Naturaleza',
  'shopping': 'Compras',
  'recreacion': 'Entretenimiento',
  'servicios': 'Servicios',
  'default': 'Otros'
};

export default function RouteLegend({ isVisible = false, onClose }) {
  if (!isVisible) return null;

  const categoryIcons = {
    'gastro': '🍽️',
    'cultura': '🏛️',
    'naturaleza': '🌿',
    'shopping': '🛒',
    'recreacion': '🎭',
    'servicios': '🏥',
    'default': '📍'
  };

  return (
    <div className="fixed bottom-4 left-4 bg-white rounded-2xl shadow-2xl p-6 z-50 max-w-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-brand-green to-brand-blue rounded-xl flex items-center justify-center">
            <span className="text-xl">🗺️</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Leyenda de Rutas</h3>
            <p className="text-sm text-gray-600">Colores por categoría</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-200"
          title="Cerrar leyenda"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-3">
        {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
          <div key={category} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors duration-200">
            <div className="flex items-center space-x-2">
              <div 
                className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-2xl">{categoryIcons[category]}</span>
            </div>
            <span className="text-sm font-medium text-gray-700">{CATEGORY_LABELS[category]}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-gradient-to-r from-brand-green/5 to-brand-blue/5 rounded-xl">
        <p className="text-xs text-gray-600 leading-relaxed">
          💡 Los colores indican la categoría del destino de cada tramo de ruta para una navegación más intuitiva.
        </p>
      </div>
    </div>
  );
}
