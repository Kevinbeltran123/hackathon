import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const ROUTE_COLORS = [
  '#FF6B6B', // Rojo coral
  '#4ECDC4', // Turquesa
  '#45B7D1', // Azul cielo
  '#96CEB4', // Verde menta
  '#FFEAA7', // Amarillo suave
  '#DDA0DD', // Lila
  '#98D8C8', // Verde agua
  '#F7DC6F'  // Amarillo dorado
];

export default function RouteManager({ items, onItemReorder }) {
  const map = useMap();
  const routeLayersRef = useRef([]);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!map || !items || items.length === 0) {
      clearRoutes();
      return;
    }

    // Limpiar rutas anteriores
    clearRoutes();

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

      // Crear polyline con estilo dinámico
      const polyline = L.polyline(routeCoords, {
        color: ROUTE_COLORS[i % ROUTE_COLORS.length],
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
                Distancia estimada: ${calculateDistance(startPoint, endPoint)} km
              </div>
            </div>
          `)
          .openOn(map);
      });

      polyline.addTo(map);
      routeLayersRef.current.push(polyline);
    }

    // Crear marcadores numerados para cada punto
    validItems.forEach((item, index) => {
      // Crear icono numerado personalizado
      const numberedIcon = L.divIcon({
        className: 'numbered-marker',
        html: `
          <div class="numbered-marker-inner" style="background-color: ${ROUTE_COLORS[index % ROUTE_COLORS.length]}">
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
    // Limpiar polylines
    routeLayersRef.current.forEach(layer => {
      map.removeLayer(layer);
    });
    routeLayersRef.current = [];

    // Limpiar marcadores numerados
    markersRef.current.forEach(marker => {
      map.removeLayer(marker);
    });
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