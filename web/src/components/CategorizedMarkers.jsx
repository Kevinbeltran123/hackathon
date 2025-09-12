import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const CATEGORY_ICONS = {
  gastro: { 
    emoji: '🍽️', 
    color: '#EF4444',
    bgColor: '#FEF2F2',
    name: 'Gastronomía'
  },
  cultura: { 
    emoji: '🏛️', 
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    name: 'Cultura'
  },
  shopping: { 
    emoji: '🛒', 
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    name: 'Compras'
  },
  naturaleza: { 
    emoji: '🌿', 
    color: '#10B981',
    bgColor: '#ECFDF5',
    name: 'Naturaleza'
  },
  recreacion: { 
    emoji: '🎭', 
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    name: 'Entretenimiento'
  },
  servicios: { 
    emoji: '🏥', 
    color: '#6B7280',
    bgColor: '#F9FAFB',
    name: 'Servicios'
  },
  historia: { 
    emoji: '🏛️', 
    color: '#92400E',
    bgColor: '#FEF3C7',
    name: 'Historia'
  },
  religion: { 
    emoji: '⛪', 
    color: '#7C2D12',
    bgColor: '#FEF2F2',
    name: 'Religión'
  },
  educacion: { 
    emoji: '📚', 
    color: '#1D4ED8',
    bgColor: '#EFF6FF',
    name: 'Educación'
  }
};

// Create custom icons for each category
const createCategoryIcon = (category, place) => {
  const categoryInfo = CATEGORY_ICONS[category] || CATEGORY_ICONS.servicios;
  const isHighlighted = place.score && place.score > 70;
  
  const iconHtml = `
    <div class="category-marker ${isHighlighted ? 'highlighted' : ''}" 
         style="background-color: ${categoryInfo.bgColor}; border-color: ${categoryInfo.color};">
      <span class="category-emoji" style="color: ${categoryInfo.color};">
        ${categoryInfo.emoji}
      </span>
      ${place.verified ? '<div class="verified-badge">✓</div>' : ''}
      ${isHighlighted ? '<div class="highlight-ring"></div>' : ''}
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'category-marker-container',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -40]
  });
};

// Determine primary category for a place
const getPrimaryCategory = (tags) => {
  const priority = ['gastro', 'cultura', 'naturaleza', 'recreacion', 'shopping', 'servicios', 'historia', 'religion', 'educacion'];
  
  for (const category of priority) {
    if (tags.includes(category)) {
      return category;
    }
  }
  
  return 'servicios'; // Default fallback
};

export default function CategorizedMarkers({ places, onPlaceClick, selectedInterests = [] }) {
  if (!places || places.length === 0) return null;

  return (
    <>
      {places.map(place => {
        const primaryCategory = getPrimaryCategory(place.tags || []);
        const categoryInfo = CATEGORY_ICONS[primaryCategory];
        
        return (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={createCategoryIcon(primaryCategory, place)}
            eventHandlers={{
              click: () => onPlaceClick && onPlaceClick(place)
            }}
          >
            <Popup className="category-popup">
              <div className="category-popup-content">
                <div className="popup-header">
                  <div className="category-badge" style={{ 
                    backgroundColor: categoryInfo.bgColor,
                    color: categoryInfo.color 
                  }}>
                    <span>{categoryInfo.emoji}</span>
                    <span>{categoryInfo.name}</span>
                  </div>
                  {place.verified && (
                    <div className="verified-popup-badge">
                      <span>✓</span>
                      <span>Verificado</span>
                    </div>
                  )}
                </div>
                
                <div className="place-info">
                  <h3 className="place-name">{place.name}</h3>
                  <div className="place-details">
                    <div className="detail-row">
                      <span className="detail-icon">📍</span>
                      <span>{place.barrio || 'Centro'}</span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-icon">⏱️</span>
                      <span>{place.base_duration || 30} min</span>
                    </div>
                    
                    {place.rating && (
                      <div className="detail-row">
                        <span className="detail-icon">⭐</span>
                        <span>{place.rating}/5</span>
                      </div>
                    )}
                    
                    {place.distance && (
                      <div className="detail-row">
                        <span className="detail-icon">🚶</span>
                        <span>{(place.distance / 1000).toFixed(1)} km del centro</span>
                      </div>
                    )}
                  </div>
                  
                  {place.description && (
                    <div className="place-description">
                      {place.description}
                    </div>
                  )}
                  
                  <div className="popup-tags">
                    {(place.tags || []).map(tag => {
                      const tagInfo = CATEGORY_ICONS[tag];
                      const isSelected = selectedInterests.includes(tag);
                      
                      if (!tagInfo) return null;
                      
                      return (
                        <div 
                          key={tag}
                          className={`popup-tag ${isSelected ? 'selected' : ''}`}
                          style={{
                            backgroundColor: isSelected ? tagInfo.color : tagInfo.bgColor,
                            color: isSelected ? 'white' : tagInfo.color,
                            borderColor: tagInfo.color
                          }}
                        >
                          <span>{tagInfo.emoji}</span>
                          <span>{tagInfo.name}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="popup-actions">
                    <button 
                      className="add-to-route-btn"
                      onClick={() => onPlaceClick && onPlaceClick(place, 'add')}
                    >
                      <span>➕</span>
                      <span>Agregar a mi ruta</span>
                    </button>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}