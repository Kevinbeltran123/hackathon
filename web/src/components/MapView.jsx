import React, { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapView = ({ 
  places = [], 
  routePlaces = [], 
  coupons = [],
  center = [4.4389, -75.2322],
  onAddToRoute,
  onPlaceClick,
  className = ""
}) => {
  // Refs for stable instances
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const markersRef = useRef(new Map());
  const routeLayerRef = useRef(null);

  // 1) Inicialización una sola vez
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map instance
    const map = L.map(mapRef.current, {
      center: center,
      zoom: 14,
      zoomControl: true,
      scrollWheelZoom: true
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Create markers layer group
    const markersLayer = L.layerGroup().addTo(map);
    
    // Store references
    mapInstanceRef.current = map;
    markersLayerRef.current = markersLayer;

    // Cleanup only on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        markersRef.current.clear();
        routeLayerRef.current = null;
      }
    };
  }, []); // Only once

  // 2) Recentrar sin destruir
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, mapInstanceRef.current.getZoom(), { animate: true });
    }
  }, [center]);

  // Helper function to create marker icon
  const createMarkerIcon = useMemo(() => {
    return (place, isInRoute, routeOrder, hasCoupons) => {
      const categoryIcons = {
        'gastro': '🍽️',
        'cultura': '🏛️', 
        'shopping': '🛍️',
        'recreacion': '🎭',
        'default': '📍'
      };

      const icon = categoryIcons[place.category] || categoryIcons.default;
      
      let className = 'custom-marker marker-available';
      if (isInRoute) className = 'custom-marker marker-in-route';
      if (hasCoupons) className += ' marker-with-coupons';

      const orderDisplay = isInRoute && routeOrder > 0 ? routeOrder : '';

      return L.divIcon({
        html: `
          <div class="${className}">
            <span class="marker-icon">${icon}</span>
            ${orderDisplay ? `<span class="marker-order">${orderDisplay}</span>` : ''}
          </div>
        `,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      });
    };
  }, []);

  // Helper function to create popup content
  const createPopupContent = (place, isInRoute, hasCoupons) => {
    const popup = L.DomUtil.create('div', 'custom-popup-content');
    
    popup.innerHTML = `
      <div class="popup-header">
        <h3>${place.name}</h3>
        ${place.rating ? `<div class="rating">⭐ ${place.rating}</div>` : ''}
      </div>
      ${place.description ? `<p class="popup-description">${place.description}</p>` : ''}
      ${place.address ? `<p class="popup-address">📍 ${place.address}</p>` : ''}
      <div class="popup-actions">
        ${isInRoute ? 
          `<button class="btn-in-route" disabled>✓ En Ruta</button>` :
          `<button class="btn-add-route" data-add>+ Agregar</button>`
        }
        ${hasCoupons ? 
          `<button class="btn-coupons" data-coupons>🎫 Cupones</button>` : ''
        }
      </div>
    `;

    // Add event listeners
    const addBtn = popup.querySelector('[data-add]');
    const couponsBtn = popup.querySelector('[data-coupons]');
    
    if (addBtn) {
      L.DomEvent.on(addBtn, 'click', (e) => {
        L.DomEvent.stopPropagation(e);
        onAddToRoute && onAddToRoute(place);
      });
    }
    
    if (couponsBtn) {
      L.DomEvent.on(couponsBtn, 'click', (e) => {
        L.DomEvent.stopPropagation(e);
        onPlaceClick && onPlaceClick(place);
      });
    }

    return popup;
  };

  // 3) Marcadores con diff (sin borrar todo)
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const markersLayer = markersLayerRef.current;
    
    // Build current place IDs set
    const currentPlaceIds = new Set(places.map(p => p.id));
    const routePlaceIds = new Set(routePlaces.map(p => p.id));
    const couponsMap = new Map();
    
    // Build coupons map
    coupons.forEach(coupon => {
      const placeId = coupon.place_id;
      if (!couponsMap.has(placeId)) {
        couponsMap.set(placeId, []);
      }
      couponsMap.get(placeId).push(coupon);
    });

    // REMOVE: markers that no longer exist
    markersRef.current.forEach((marker, placeId) => {
      if (!currentPlaceIds.has(placeId)) {
        markersLayer.removeLayer(marker);
        markersRef.current.delete(placeId);
      }
    });

    // UPSERT: create or update existing markers
    places.forEach(place => {
      const isInRoute = routePlaceIds.has(place.id);
      const routePlace = routePlaces.find(p => p.id === place.id);
      const routeOrder = routePlace?.routeOrder || 0;
      const hasCoupons = couponsMap.has(place.id);
      
      const existingMarker = markersRef.current.get(place.id);
      
      if (existingMarker) {
        // Update existing marker
        const newIcon = createMarkerIcon(place, isInRoute, routeOrder, hasCoupons);
        existingMarker.setIcon(newIcon);
        existingMarker.setLatLng([place.lat, place.lng]);
        
        // Update popup
        const popupContent = createPopupContent(place, isInRoute, hasCoupons);
        existingMarker.bindPopup(popupContent, {
          maxWidth: 320,
          closeButton: true,
          autoClose: true
        });
      } else {
        // Create new marker
        const icon = createMarkerIcon(place, isInRoute, routeOrder, hasCoupons);
        const marker = L.marker([place.lat, place.lng], { icon });
        
        // Bind popup
        const popupContent = createPopupContent(place, isInRoute, hasCoupons);
        marker.bindPopup(popupContent, {
          maxWidth: 320,
          closeButton: true,
          autoClose: true
        });
        
        // Add to layer and store reference
        markersLayer.addLayer(marker);
        markersRef.current.set(place.id, marker);
      }
    });

  }, [places, routePlaces, coupons, createMarkerIcon]);

  // 4) Capa de ruta
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Remove existing route layer
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    // Draw new route if we have 2+ places
    if (routePlaces.length >= 2) {
      const coords = routePlaces.map(place => [place.lat, place.lng]);
      
      const routeLayer = L.polyline(coords, {
        color: '#FF6B35',
        weight: 5,
        opacity: 0.8,
        smoothFactor: 1,
        className: 'route-line'
      });

      routeLayer.addTo(map);
      routeLayerRef.current = routeLayer;

      // Fit bounds to show route
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { 
        padding: [30, 30],
        maxZoom: 16 
      });
    }

  }, [routePlaces]);

  return (
    <>
      {/* Custom styles */}
      <style id="map-custom-styles">
        {`
          .custom-marker {
            background: none !important;
            border: none !important;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            transition: all 0.3s ease;
            opacity: 1 !important;
          }
          
          .marker-available {
            background: #4F46E5 !important;
            color: #fff;
            border: 3px solid #fff !important;
            width: 36px;
            height: 36px;
            opacity: 1 !important;
          }
          
          .marker-in-route {
            background: linear-gradient(135deg, #FF6B35, #DC2626) !important;
            color: #fff;
            border: 3px solid #fff !important;
            width: 40px;
            height: 40px;
            transform: scale(1.15);
            box-shadow: 0 6px 16px rgba(255, 107, 53, 0.5);
          }
          
          .marker-with-coupons {
            border-color: #10B981 !important;
            border-width: 3px !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 3px rgba(16, 185, 129, 0.4);
          }
          
          .marker-icon {
            font-size: 16px;
            line-height: 1;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          }
          
          .marker-order {
            position: absolute;
            top: -10px;
            right: -10px;
            background: #DC2626 !important;
            color: white;
            border-radius: 50%;
            width: 22px;
            height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            border: 3px solid white !important;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            z-index: 10;
          }
          
          .route-line {
            stroke: #FF6B35;
            stroke-width: 4;
          }
          
          .custom-popup-content {
            min-width: 200px;
          }
          
          .popup-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }
          
          .popup-header h3 {
            margin: 0;
            font-size: 16px;
            font-weight: bold;
          }
          
          .rating {
            font-size: 12px;
            color: #F59E0B;
          }
          
          .popup-description {
            font-size: 14px;
            color: #6B7280;
            margin: 8px 0;
          }
          
          .popup-address {
            font-size: 12px;
            color: #9CA3AF;
            margin: 4px 0;
          }
          
          .popup-actions {
            display: flex;
            gap: 8px;
            margin-top: 12px;
          }
          
          .btn-add-route {
            background: #3B82F6;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            transition: background 0.2s;
          }
          
          .btn-add-route:hover {
            background: #2563EB;
          }
          
          .btn-in-route {
            background: #10B981;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            cursor: not-allowed;
            opacity: 0.8;
          }
          
          .btn-coupons {
            background: #F59E0B;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            transition: background 0.2s;
          }
          
          .btn-coupons:hover {
            background: #D97706;
          }
        `}
      </style>
      
      {/* Map container */}
      <div 
        ref={mapRef} 
        className={`map-container ${className}`} 
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
      />
    </>
  );
};

export default MapView;