import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

// Category-based colors for route segments - Temática de ocobos
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

// Fallback colors for when we have more segments than categories - Temática de ocobos
const FALLBACK_COLORS = [
  '#E74C7C', // Rosa ocobo
  '#2D6C4F', // Verde bosque
  '#FFB020', // Dorado del logo
  '#5C9C6F', // Verde colinas
  '#F8BBD9', // Rosa claro de ocobos
  '#2196F3', // Azul cielo
  '#8D6E63', // Marrón tronco
  '#FF9800'  // Naranja atardecer
];

export default function RouteManager({ items, onItemReorder }) {
  const map = useMap();
  const routeLayersRef = useRef([]);
  const markersRef = useRef([]);
  const routeLayerGroupRef = useRef(null); // Layer group for route management

  useEffect(() => {
    if (!map || !items || items.length === 0) {
      clearRoutes();
      return;
    }

    // Limpiar rutas anteriores
    clearRoutes();

    // Create or get route layer group
    if (!routeLayerGroupRef.current) {
      routeLayerGroupRef.current = L.layerGroup().addTo(map);
    }

    // Filtrar elementos con coordenadas válidas
    const validItems = items.filter(item => 
      item.lat && item.lng && 
      typeof item.lat === 'number' && 
      typeof item.lng === 'number'
    );

    if (validItems.length < 2) return;

    // Crear rutas conectando cada punto con el siguiente
    for (let i = 0; i < validItems.length - 1; i++) {
      const startPoint = validItems[i];
      const endPoint = validItems[i + 1];
      
      const routeCoords = [
        [startPoint.lat, startPoint.lng],
        [endPoint.lat, endPoint.lng]
      ];

      // Determine color based on destination category
      const destinationCategory = getCategoryFromTags(endPoint.tags);
      const routeColor = CATEGORY_COLORS[destinationCategory] || CATEGORY_COLORS.default;

      // Crear polyline con color basado en categoría
      const polyline = L.polyline(routeCoords, {
        color: routeColor,
        weight: 4,
        opacity: 0.8,
        smoothFactor: 1,
        className: 'route-line'
      });

      // Agregar efectos de hover
      polyline.on('mouseover', function(e) {
        this.setStyle({
          weight: 6,
          opacity: 1
        });
      });

      polyline.on('mouseout', function(e) {
        this.setStyle({
          weight: 4,
          opacity: 0.8
        });
      });

      // Agregar click para mostrar información del segmento
      polyline.on('click', function(e) {
        const popup = L.popup()
          .setLatLng(e.latlng)
          .setContent(`
            <div class="text-sm">
              <div class="font-semibold">Ruta ${i + 1} → ${i + 2}</div>
              <div class="text-gray-600">
                ${startPoint.title || startPoint.name} → ${endPoint.title || endPoint.name}
              </div>
              <div class="text-xs text-gray-500 mt-1">
                Categoría: ${destinationCategory} • Distancia: ${calculateDistance(startPoint, endPoint)} km
              </div>
            </div>
          `)
          .openOn(map);
      });

      // Add to layer group instead of directly to map
      polyline.addTo(routeLayerGroupRef.current);
      routeLayersRef.current.push(polyline);
    }

    // Crear marcadores numerados para cada punto
    validItems.forEach((item, index) => {
      // Determine color based on item category
      const itemCategory = getCategoryFromTags(item.tags);
      const markerColor = CATEGORY_COLORS[itemCategory] || CATEGORY_COLORS.default;
      
      // Crear icono numerado personalizado
      const numberedIcon = L.divIcon({
        className: 'numbered-marker',
        html: `
          <div class="numbered-marker-inner" style="background-color: ${markerColor}">
            <span class="marker-number">${index + 1}</span>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker([item.lat, item.lng], { 
        icon: numberedIcon,
        draggable: true
      });

      // Popup con información del lugar
      const popupContent = `
        <div class="text-sm max-w-xs">
          <div class="flex items-center gap-2 mb-2">
            <span class="font-semibold">${index + 1}. ${item.title || item.name}</span>
          </div>
          <div class="text-gray-600 text-xs mb-2">${item.place_name || ''}</div>
          <div class="text-xs text-gray-500">
            Duración: ${item.duration || item.base_duration || 0} min
          </div>
          <button 
            class="mt-2 w-full bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded transition-colors"
            onclick="window.removeTimelineItem && window.removeTimelineItem(${index})"
          >
            Eliminar del timeline
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Evento drag para reordenar (funcionalidad futura)
      marker.on('dragend', function(e) {
        const newPos = e.target.getLatLng();
        // Aquí se implementaría la lógica de reordenamiento
        console.log(`Elemento ${index + 1} movido a:`, newPos);
      });

      marker.addTo(map);
      markersRef.current.push(marker);
    });

    // Ajustar vista del mapa para mostrar toda la ruta
    if (validItems.length > 0) {
      const bounds = L.latLngBounds(
        validItems.map(item => [item.lat, item.lng])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }

  }, [map, items]);

  const clearRoutes = () => {
    // Clear layer group (this removes all polylines and markers)
    if (routeLayerGroupRef.current) {
      routeLayerGroupRef.current.clearLayers();
    }
    
    // Reset arrays
    routeLayersRef.current = [];
    markersRef.current = [];
  };

  // Limpiar al desmontar componente
  useEffect(() => {
    return () => {
      clearRoutes();
    };
  }, []);

  return null; // Este componente no renderiza JSX, solo maneja el mapa
}

// Helper function to determine category from tags
function getCategoryFromTags(tags) {
  if (!tags || !Array.isArray(tags)) return 'default';
  
  // Map tag values to category IDs
  const tagToCategory = {
    'restaurante': 'gastro',
    'café': 'gastro',
    'panadería': 'gastro',
    'bar': 'gastro',
    'museo': 'cultura',
    'iglesia': 'cultura',
    'teatro': 'cultura',
    'monumento': 'cultura',
    'parque': 'naturaleza',
    'mirador': 'naturaleza',
    'sendero': 'naturaleza',
    'centro comercial': 'shopping',
    'artesanías': 'shopping',
    'mercado': 'shopping',
    'cine': 'recreacion',
    'karaoke': 'recreacion',
    'juegos': 'recreacion',
    'banco': 'servicios',
    'farmacia': 'servicios',
    'hospital': 'servicios'
  };
  
  // Find first matching category
  for (const tag of tags) {
    if (tagToCategory[tag]) {
      return tagToCategory[tag];
    }
  }
  
  return 'default';
}

// Función para calcular distancia aproximada entre dos puntos
function calculateDistance(point1, point2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance.toFixed(1);
}