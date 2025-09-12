import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Home = () => {
  const { user } = useAuth();
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const mapRef = useRef(null);

  const categories = [
    { id: 'all', name: 'Todos', icon: '🌟', color: 'bg-blue-500' },
    { id: 'gastro', name: 'Gastronomía', icon: '🍽️', color: 'bg-orange-500' },
    { id: 'cultura', name: 'Cultura', icon: '🏛️', color: 'bg-purple-500' },
    { id: 'shopping', name: 'Compras', icon: '🛍️', color: 'bg-pink-500' },
    { id: 'recreacion', name: 'Recreación', icon: '🎭', color: 'bg-green-500' },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load places
        const placesResponse = await fetch('http://localhost:4001/api/places');
        if (placesResponse.ok) {
          const placesData = await placesResponse.json();
          const placesWithCategory = placesData.map(place => ({
            ...place,
            category: place.tags && place.tags.length > 0 ? place.tags[0] : 'otros'
          }));
          setPlaces(placesWithCategory);
          setFilteredPlaces(placesWithCategory);
        }

        // Load available coupons
        const couponsResponse = await fetch('http://localhost:4001/api/coupons');
        if (couponsResponse.ok) {
          const couponsData = await couponsResponse.json();
          setCoupons(couponsData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (mapRef.current && !map) {
      const newMap = L.map(mapRef.current).setView([4.4389, -75.2043], 14);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(newMap);
      
      setMap(newMap);
    }
  }, [map]);

  useEffect(() => {
    if (map && filteredPlaces.length > 0) {
      markers.forEach(marker => map.removeLayer(marker));
      
      const newMarkers = filteredPlaces.map(place => {
        const marker = L.marker([place.lat, place.lng])
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-bold text-lg">${place.name}</h3>
              <p class="text-sm text-gray-600">${place.description || 'Sin descripción'}</p>
              <p class="text-xs text-gray-500">${place.address || 'Sin dirección'}</p>
              <div class="flex items-center justify-between mt-2">
                <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  ${place.category}
                </span>
                <span class="text-xs text-gray-500">⭐ ${place.rating}</span>
              </div>
            </div>
          `);
        
        return marker;
      });
      
      newMarkers.forEach(marker => marker.addTo(map));
      setMarkers(newMarkers);
    }
  }, [map, filteredPlaces]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    
    if (newFilter === 'all') {
      setFilteredPlaces(places);
    } else {
      const filtered = places.filter(place => 
        place.category === newFilter || (place.tags && place.tags.includes(newFilter))
      );
      setFilteredPlaces(filtered);
    }
  };

  const getPlaceCoupons = (placeId) => {
    return coupons.filter(coupon => 
      !coupon.place_id || coupon.place_id == placeId
    );
  };

  const getDiscountText = (coupon) => {
    switch (coupon.discount_type) {
      case 'percentage':
        return `${coupon.discount_value}% OFF`;
      case 'fixed_amount':
        return `$${coupon.discount_value.toLocaleString()}`;
      case '2x1':
        return '2x1';
      case 'free_item':
        return 'GRATIS';
      default:
        return 'Descuento';
    }
  };

  const handleViewCoupons = (place) => {
    setSelectedPlace(place);
    setShowCouponModal(true);
  };

  const handleCouponRedeem = async (couponId) => {
    if (!user?.id) {
      alert('Debes iniciar sesión para usar cupones');
      return;
    }

    try {
      const response = await fetch(`http://localhost:4001/api/coupons/${couponId}/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          place_id: selectedPlace?.id
        })
      });

      const result = await response.json();

      if (response.ok) {
        alert(`¡Cupón usado exitosamente! ${result.message}`);
        // Reload coupons to update usage
        const couponsResponse = await fetch('http://localhost:4001/api/coupons');
        if (couponsResponse.ok) {
          const couponsData = await couponsResponse.json();
          setCoupons(couponsData);
        }
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error redeeming coupon:', error);
      alert('Error al usar el cupón. Intenta nuevamente.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Cargando lugares...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🌟 Explorar Ibagué</h1>
            <p className="text-blue-100">{filteredPlaces.length} lugares disponibles</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
            >
              {showFilters ? '✕ Ocultar Filtros' : '🔍 Mostrar Filtros'}
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white shadow-lg border-b border-gray-200 p-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleFilterChange(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  filter === category.id
                    ? `${category.color} text-white shadow-lg`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full"></div>
        </div>

        <div className="w-80 bg-white shadow-lg overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Lugares Disponibles</h3>
          </div>
          <div className="p-4 space-y-3">
            {filteredPlaces.map((place) => {
              const placeCoupons = getPlaceCoupons(place.id);
              return (
                <div
                  key={place.id}
                  className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{place.name}</h4>
                      {placeCoupons.length > 0 && (
                        <div className="flex items-center mt-1">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full mr-1">
                            🎫 {placeCoupons.length} cupón{placeCoupons.length > 1 ? 'es' : ''} disponible{placeCoupons.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">⭐ {place.rating}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{place.description || 'Sin descripción'}</p>
                  <p className="text-xs text-gray-500 mb-2">{place.address || 'Sin dirección'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                      {place.category}
                    </span>
                    <div className="flex gap-2">
                      {placeCoupons.length > 0 && (
                        <button 
                          onClick={() => handleViewCoupons(place)}
                          className="text-xs text-green-600 hover:text-green-800 font-semibold bg-green-50 px-2 py-1 rounded"
                        >
                          🎫 Ver Cupones
                        </button>
                      )}
                      <button className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
                        📍 Ver en mapa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Coupon Modal */}
      {showCouponModal && selectedPlace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  🎫 Cupones para {selectedPlace.name}
                </h2>
                <button
                  onClick={() => setShowCouponModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {getPlaceCoupons(selectedPlace.id).map((coupon) => (
                  <div
                    key={coupon.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{coupon.title}</h3>
                        <p className="text-sm text-gray-600">{coupon.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {getDiscountText(coupon)}
                        </div>
                        <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          coupon.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {coupon.is_available ? 'Disponible' : 'Agotado'}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      {coupon.min_purchase_amount && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Compra mínima:</span>
                          <span className="font-medium">${coupon.min_purchase_amount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Válido hasta:</span>
                        <span className="font-medium">{new Date(coupon.valid_until).toLocaleDateString('es-ES')}</span>
                      </div>
                      {coupon.usage_limit && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Usos:</span>
                          <span className="font-medium">{coupon.current_usage} / {coupon.usage_limit}</span>
                        </div>
                      )}
                    </div>

                    {/* Usage Progress */}
                    {coupon.usage_limit && (
                      <div className="mb-4">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(coupon.current_usage / coupon.usage_limit) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.round((coupon.current_usage / coupon.usage_limit) * 100)}% utilizado
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => handleCouponRedeem(coupon.id)}
                      disabled={!coupon.is_available}
                      className={`w-full py-3 px-4 rounded-lg font-medium text-center transition-all ${
                        coupon.is_available
                          ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:shadow-lg transform hover:scale-105'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {coupon.is_available ? '🎫 Usar Cupón' : 'No Disponible'}
                    </button>
                  </div>
                ))}

                {getPlaceCoupons(selectedPlace.id).length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">No hay cupones disponibles para este lugar</p>
                    <p className="text-sm text-gray-400 mt-2">¡Vuelve pronto para nuevas ofertas!</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowCouponModal(false)}
                  className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;