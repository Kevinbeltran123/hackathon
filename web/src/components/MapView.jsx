import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapView = ({ 
  places = [], 
  routePlaces = [], 
  onPlaceClick, 
  onAddToRoute,
  coupons = [],
  center = [4.4389, -75.2322],
  className = ""
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef(new Map());
  const polylineRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Stable callback functions for popup interactions
  const stableAddToRoute = useCallback((placeId) => {
    const place = places.find(p => p.id === placeId);
    if (place && onAddToRoute) {
      onAddToRoute(place);
    }
  }, [places, onAddToRoute]);

  const stableViewCoupons = useCallback((placeId) => {
    const place = places.find(p => p.id === placeId);
    if (place && onPlaceClick) {
      onPlaceClick(place);
    }
  }, [places, onPlaceClick]);

  // Custom CSS for advanced markers and animations
  const customMapStyles = `
    @keyframes markerPulse {
      0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.7); }
      70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 107, 53, 0); }
      100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 53, 0); }
    }

    @keyframes markerBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    @keyframes routeLineDraw {
      0% { stroke-dashoffset: 1000; }
      100% { stroke-dashoffset: 0; }
    }

    .custom-marker {
      background: none !important;
      border: none !important;
    }

    .marker-available {
      background: #6B7280;
      color: white;
      border: 2px solid #374151;
      box-shadow: 0 3px 10px rgba(0,0,0,0.3);
    }

    .marker-in-route {
      background: linear-gradient(135deg, #FF6B35 0%, #F59E0B 100%);
      color: white;
      border: 2px solid #FFFFFF;
      box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
      animation: markerPulse 2s ease-in-out infinite;
    }

    .marker-with-coupons {
      animation: markerBounce 1.5s ease-in-out infinite;
      border-color: #10B981 !important;
    }

    .marker-number {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #007AFF;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: bold;
      border: 2px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    }

    .route-line {
      stroke: #FF6B35;
      stroke-width: 4;
      stroke-dasharray: 10;
      animation: routeLineDraw 2s ease-out;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    }

    .leaflet-popup-content-wrapper {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      border: none;
      z-index: 701 !important;
    }

    .leaflet-popup-tip {
      background: white;
      border: none;
      box-shadow: none;
    }
  `;

  // Inject custom styles
  useEffect(() => {
    if (!document.getElementById('map-custom-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'map-custom-styles';
      styleSheet.textContent = customMapStyles;
      document.head.appendChild(styleSheet);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: false,
        fadeAnimation: true,
        zoomAnimation: true,
        markerZoomAnimation: true
      }).setView(center, 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 10
      }).addTo(map);

      // Custom zoom control position
      map.zoomControl.setPosition('topright');
      
      // Add attribution
      L.control.attribution({
        position: 'bottomright',
        prefix: '🗺️ Rutas VIVAS'
      }).addTo(map);

      mapInstanceRef.current = map;
      window.mapInstance = map; // Expose map instance globally
      setIsMapReady(true);

      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
          delete window.mapInstance;
        }
      };
    }
  }, [center]);

  // Set up stable global functions once
  useEffect(() => {
    window.addToRouteFromMap = stableAddToRoute;
    window.viewCoupons = stableViewCoupons;
  }, [stableAddToRoute, stableViewCoupons]);

  // Create marker icon
  const createMarkerIcon = (place, isInRoute = false, routeOrder = 0) => {
    const placeCoupons = coupons.filter(coupon => 
      !coupon.place_id || coupon.place_id == place.id
    );
    
    const categoryIcons = {
      'gastro': '🍽️',
      'cultura': '🏛️', 
      'shopping': '🛍️',
      'recreacion': '🎭',
      'default': '📍'
    };

    const icon = categoryIcons[place.category] || categoryIcons.default;
    const hasCoupons = placeCoupons.length > 0;
    
    const markerHtml = `
      <div class="${isInRoute ? 'marker-in-route' : 'marker-available'} ${hasCoupons ? 'marker-with-coupons' : ''}" 
           style="
             width: 40px; 
             height: 40px; 
             border-radius: 50%; 
             display: flex; 
             align-items: center; 
             justify-content: center; 
             font-size: 18px;
             position: relative;
             cursor: pointer;
             transition: all 0.3s ease;
           ">
        ${icon}
        ${isInRoute && routeOrder > 0 ? `<div class="marker-number">${routeOrder}</div>` : ''}
      </div>
    `;

    return L.divIcon({
      html: markerHtml,
      className: 'custom-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });
  };

  // Create popup content
  const createPopupContent = (place, isInRoute = false) => {
    const placeCoupons = coupons.filter(coupon => 
      !coupon.place_id || coupon.place_id == place.id
    );

    return `
      <div class="p-4 min-w-[280px] max-w-[320px]">
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <h3 class="font-bold text-lg text-gray-900 mb-1">${place.name}</h3>
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                ${place.category}
              </span>
              <span class="text-xs text-gray-500 flex items-center">
                ⭐ ${place.rating}
              </span>
            </div>
          </div>
        </div>
        
        <p class="text-sm text-gray-600 mb-3 line-clamp-2">${place.description || 'Sin descripción disponible'}</p>
        
        ${place.address ? `
          <p class="text-xs text-gray-500 mb-3 flex items-center">
            <span class="mr-1">📍</span> ${place.address}
          </p>
        ` : ''}
        
        ${placeCoupons.length > 0 ? `
          <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg mb-3 border border-green-200">
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-green-800">
                🎫 ${placeCoupons.length} cupón${placeCoupons.length > 1 ? 'es' : ''} disponible${placeCoupons.length > 1 ? 's' : ''}
              </span>
              <button onclick="window.viewCoupons && window.viewCoupons(${place.id})" 
                      class="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-md transition-colors">
                Ver Cupones
              </button>
            </div>
            <div class="mt-2 flex flex-wrap gap-1">
              ${placeCoupons.slice(0, 2).map(coupon => `
                <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  ${coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : 
                    coupon.discount_type === 'fixed_amount' ? `$${coupon.discount_value.toLocaleString()}` : 
                    coupon.discount_type === '2x1' ? '2x1' : 'Descuento'}
                </span>
              `).join('')}
              ${placeCoupons.length > 2 ? '<span class="text-xs text-green-600">+más</span>' : ''}
            </div>
          </div>
        ` : ''}
        
        <div class="flex gap-2">
          <button onclick="window.addToRouteFromMap && window.addToRouteFromMap(${place.id})" 
                  class="${isInRoute ? 
                    'bg-emerald-500 hover:bg-emerald-600 text-white' : 
                    'bg-blue-500 hover:bg-blue-600 text-white'
                  } flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2">
            ${isInRoute ? '✓ En Ruta' : '+ Agregar a Ruta'}
          </button>
          ${place.website ? `
            <button onclick="window.open('${place.website}', '_blank')" 
                    class="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm transition-colors">
              🌐
            </button>
          ` : ''}
        </div>
      </div>
    `;
  };

  // Update markers when places or route changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    const map = mapInstanceRef.current;
    
    // Clear existing markers
    markersRef.current.forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current.clear();

    // Create route place IDs set for quick lookup
    const routePlaceIds = new Set(routePlaces.map(p => p.id));

    // Add all places as markers
    places.forEach(place => {
      const isInRoute = routePlaceIds.has(place.id);
      const routePlace = routePlaces.find(p => p.id === place.id);
      const routeOrder = routePlace?.routeOrder || 0;

      const marker = L.marker([place.lat, place.lng], {
        icon: createMarkerIcon(place, isInRoute, routeOrder)
      });

      const popup = L.popup({
        maxWidth: 320,
        className: 'custom-popup',
        closeButton: true,
        autoClose: true
      }).setContent(createPopupContent(place, isInRoute));

      marker.bindPopup(popup);
      marker.addTo(map);
      markersRef.current.set(place.id, marker);
    });

  }, [places, routePlaces, coupons, isMapReady]);

  // Draw route polyline
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    const map = mapInstanceRef.current;

    // Remove existing polyline
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    // Draw new polyline if we have route places
    if (routePlaces.length > 1) {
      const routeCoordinates = routePlaces.map(place => [place.lat, place.lng]);
      
      const polyline = L.polyline(routeCoordinates, {
        color: '#FF6B35',
        weight: 5,
        opacity: 0.8,
        smoothFactor: 1,
        className: 'route-line'
      });

      polyline.addTo(map);
      polylineRef.current = polyline;

      // Auto-zoom to show entire route with padding
      setTimeout(() => {
        const bounds = L.latLngBounds(routeCoordinates);
        map.fitBounds(bounds, { 
          padding: [30, 30],
          maxZoom: 16 
        });
      }, 100);
    }
  }, [routePlaces, isMapReady]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up global functions and references
      if (typeof window !== 'undefined') {
        delete window.addToRouteFromMap;
        delete window.viewCoupons;
        delete window.mapInstance;
      }
    };
  }, []);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Map container */}
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden shadow-lg" />
      
      {/* Map controls overlay */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        {/* Route info panel */}
        {routePlaces.length > 0 && (
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-white/20 min-w-[200px]">
            <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-2">
              🗺️ Ruta Actual
            </h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Lugares:</span>
                <span className="font-semibold text-blue-600">{routePlaces.length}</span>
              </div>
              {routePlaces.length > 1 && (
                <>
                  <div className="flex justify-between">
                    <span>Distancia:</span>
                    <span className="font-semibold text-orange-600">~{(
                      routePlaces.reduce((total, place, index) => {
                        if (index === 0) return 0;
                        const prev = routePlaces[index - 1];
                        const distance = Math.sqrt(
                          Math.pow((place.lat - prev.lat) * 111000, 2) + 
                          Math.pow((place.lng - prev.lng) * 111000 * Math.cos(prev.lat * Math.PI / 180), 2)
                        );
                        return total + distance;
                      }, 0) / 1000
                    ).toFixed(1)}km</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tiempo est.:</span>
                    <span className="font-semibold text-purple-600">
                      ~{Math.round(routePlaces.length * 30 + (routePlaces.length - 1) * 15)}m
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {!isMapReady && (
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-white/20">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
              <span>Cargando mapa...</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-white/20">
        <h5 className="font-semibold text-xs text-gray-900 mb-2">Leyenda</h5>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full border border-gray-600"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full border border-white"></div>
            <span>En ruta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full border border-green-600"></div>
            <span>Con cupones</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-orange-500 rounded"></div>
            <span>Ruta</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;