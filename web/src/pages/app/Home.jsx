import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import MapView from '../../components/MapView';
import useRouteBuilder from '../../hooks/useRouteBuilder';

const Home = () => {
  const { user } = useAuth();
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSaveRouteModal, setShowSaveRouteModal] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [suggestedPlaces, setSuggestedPlaces] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Initialize route builder hook
  const {
    routePlaces,
    isBuilding,
    routeStats,
    addPlaceToRoute,
    removePlaceFromRoute,
    clearRoute,
    saveRoute,
    getSuggestedNextPlaces,
    isPlaceInRoute,
    getPlaceRoutePosition
  } = useRouteBuilder();

  const categories = [
    { id: 'all', name: 'Todos', icon: '🌟', color: 'bg-blue-500' },
    { id: 'gastro', name: 'Gastronomía', icon: '🍽️', color: 'bg-orange-500' },
    { id: 'cultura', name: 'Cultura', icon: '🏛️', color: 'bg-purple-500' },
    { id: 'shopping', name: 'Compras', icon: '🛍️', color: 'bg-pink-500' },
    { id: 'recreacion', name: 'Recreación', icon: '🎭', color: 'bg-green-500' },
  ];

  // Load initial data
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
        showToastMessage('Error al cargar los datos', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Update suggested places when route changes
  useEffect(() => {
    if (places.length > 0) {
      const suggestions = getSuggestedNextPlaces(filteredPlaces, 5);
      setSuggestedPlaces(suggestions);
    }
  }, [routePlaces, filteredPlaces, getSuggestedNextPlaces, places]);

  // Helper functions
  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

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
    // Close any open popups on the map first
    if (typeof window !== 'undefined' && window.mapInstance) {
      window.mapInstance.closePopup();
    }
    setSelectedPlace(place);
    setShowCouponModal(true);
  };

  const handleAddToRoute = (place) => {
    if (isPlaceInRoute(place.id)) {
      removePlaceFromRoute(place.id);
      showToastMessage(`${place.name} eliminado de la ruta`, 'success');
    } else {
      addPlaceToRoute(place);
      showToastMessage(`${place.name} agregado a la ruta`, 'success');
    }
  };

  const handleSaveRoute = async () => {
    if (!routeName.trim()) {
      showToastMessage('Ingresa un nombre para la ruta', 'error');
      return;
    }
    
    if (routePlaces.length < 2) {
      showToastMessage('Agrega al menos 2 lugares a la ruta', 'error');
      return;
    }

    try {
      await saveRoute(routeName, user.id);
      showToastMessage('¡Ruta guardada exitosamente!', 'success');
      setShowSaveRouteModal(false);
      setRouteName('');
    } catch (error) {
      showToastMessage('Error al guardar la ruta', 'error');
    }
  };

  const handleClearRoute = () => {
    clearRoute();
    showToastMessage('Ruta limpiada', 'success');
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
    <>
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-gradient-to-br from-emerald-50 to-blue-50">
      {/* Top Header with Controls */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 p-3 shadow-sm z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              🗺️ Explorar Ibagué - Rutas Vivas
              {isBuilding && (
                <div className="flex items-center gap-1 text-orange-600 text-sm">
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-orange-500 border-t-transparent"></div>
                  Actualizando...
                </div>
              )}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{filteredPlaces.length} lugares disponibles</span>
              {routePlaces.length > 0 && (
                <span className="flex items-center gap-1 text-orange-600">
                  <span>🎯</span>
                  <span className="font-semibold">{routePlaces.length} en ruta</span>
                  {routePlaces.length > 1 && (
                    <span>• {routeStats.formattedDistance} • {routeStats.formattedTime}</span>
                  )}
                </span>
              )}
            </div>
          </div>
          
          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              {showFilters ? '✕ Filtros' : '🔍 Filtros'}
            </button>
            {routePlaces.length >= 2 && (
              <button
                onClick={() => setShowSaveRouteModal(true)}
                className="bg-green-50 hover:bg-green-100 text-green-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                💾 Guardar Ruta
              </button>
            )}
            {routePlaces.length > 0 && (
              <button
                onClick={handleClearRoute}
                className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                🗑️ Limpiar
              </button>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg text-sm transition-colors duration-200"
            >
              🔍
            </button>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="bg-gray-50 hover:bg-gray-100 text-gray-600 p-2 rounded-lg text-sm transition-colors duration-200 relative"
            >
              📍
              {routePlaces.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {routePlaces.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
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

      {/* Main Content Area */}
      <div className="flex-1 flex relative">
        {/* Map Section */}
        <div className="flex-1 lg:w-[70%] relative">
          <MapView
            places={filteredPlaces}
            routePlaces={routePlaces}
            coupons={coupons}
            onPlaceClick={handleViewCoupons}
            onAddToRoute={handleAddToRoute}
            className="w-full h-full"
          />
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-[30%] bg-white shadow-lg h-full flex-col border-l border-gray-200">
          {/* Route Summary */}
          {routePlaces.length > 0 && (
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-yellow-50">
              <h3 className="text-sm font-bold text-orange-800 mb-2">
                🗺️ Mi Ruta ({routePlaces.length} lugares)
              </h3>
              <div className="space-y-1 max-h-28 overflow-y-auto">
                {routePlaces.map((place, index) => (
                  <div key={place.id} className="flex items-center text-xs bg-white/60 rounded-lg p-2">
                    <span className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 text-[10px] font-bold">
                      {index + 1}
                    </span>
                    <span className="flex-1 truncate font-medium text-gray-800">{place.name}</span>
                    <button 
                      onClick={() => removePlaceFromRoute(place.id)}
                      className="text-red-500 hover:text-red-700 w-4 h-4 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 space-y-1 text-xs text-orange-700">
                {routePlaces.length > 1 && (
                  <div className="flex justify-between">
                    <span>Distancia total:</span>
                    <span className="font-semibold">{routeStats.formattedDistance}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tiempo estimado:</span>
                  <span className="font-semibold">{routeStats.formattedTime}</span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={handleClearRoute}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs py-2 px-3 rounded-lg"
                >
                  🗑️ Limpiar
                </button>
                <button 
                  onClick={() => setShowSaveRouteModal(true)}
                  disabled={routePlaces.length < 2}
                  className={`flex-1 text-xs py-2 px-3 rounded-lg ${
                    routePlaces.length >= 2 
                      ? 'bg-green-100 hover:bg-green-200 text-green-600' 
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  💾 Guardar
                </button>
              </div>
            </div>
          )}

          {/* Places List */}
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900">Lugares Disponibles</h3>
            <p className="text-sm text-gray-500">Toca + Agregar para crear tu ruta</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[calc(100vh-20rem)]">
            {filteredPlaces.map((place) => {
              const placeCoupons = getPlaceCoupons(place.id);
              const inRoute = isPlaceInRoute(place.id);
              
              return (
                <div
                  key={place.id}
                  className={`rounded-lg p-4 transition-all duration-200 border-2 cursor-pointer ${
                    inRoute 
                      ? 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 shadow-md' 
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
                  onClick={() => handleViewCoupons(place)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className={`font-semibold ${inRoute ? 'text-orange-800' : 'text-gray-900'}`}>
                        {place.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                          {place.category}
                        </span>
                        <span className="text-xs text-gray-500">⭐ {place.rating}</span>
                      </div>
                      {placeCoupons.length > 0 && (
                        <div className="flex items-center mt-2">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            🎫 {placeCoupons.length} cupón{placeCoupons.length > 1 ? 'es' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{place.description || 'Sin descripción'}</p>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToRoute(place);
                      }}
                      className={`text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
                        inRoute
                          ? 'bg-orange-100 text-orange-700 border border-orange-300'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {inRoute ? '✓ En Ruta' : '+ Agregar'}
                    </button>
                    
                    {placeCoupons.length > 0 && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewCoupons(place);
                        }}
                        className="text-xs text-white bg-green-500 hover:bg-green-600 font-semibold px-3 py-2 rounded-lg"
                      >
                        🎫 Cupones
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      {showSidebar && (
        <div className="fixed inset-0 bg-black/50 z-[60] lg:hidden" onClick={() => setShowSidebar(false)}>
          <div 
            className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Mobile Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <h2 className="text-lg font-bold text-gray-900">🗺️ Rutas Vivas</h2>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl p-1"
                >
                  ×
                </button>
              </div>

              {/* Route Summary */}
              {routePlaces.length > 0 && (
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-yellow-50">
                  <h3 className="text-sm font-bold text-orange-800 mb-2">
                    🗺️ Mi Ruta ({routePlaces.length} lugares)
                  </h3>
                  <div className="space-y-1 max-h-28 overflow-y-auto">
                    {routePlaces.map((place, index) => (
                      <div key={place.id} className="flex items-center text-xs bg-white/60 rounded-lg p-2">
                        <span className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 text-[10px] font-bold">
                          {index + 1}
                        </span>
                        <span className="flex-1 truncate font-medium text-gray-800">{place.name}</span>
                        <button 
                          onClick={() => removePlaceFromRoute(place.id)}
                          className="text-red-500 hover:text-red-700 w-4 h-4 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3 space-y-1 text-xs text-orange-700">
                    {routePlaces.length > 1 && (
                      <div className="flex justify-between">
                        <span>Distancia total:</span>
                        <span className="font-semibold">{routeStats.formattedDistance}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Tiempo estimado:</span>
                      <span className="font-semibold">{routeStats.formattedTime}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={handleClearRoute}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs py-2 px-3 rounded-lg"
                    >
                      🗑️ Limpiar
                    </button>
                    <button 
                      onClick={() => setShowSaveRouteModal(true)}
                      disabled={routePlaces.length < 2}
                      className={`flex-1 text-xs py-2 px-3 rounded-lg ${
                        routePlaces.length >= 2 
                          ? 'bg-green-100 hover:bg-green-200 text-green-600' 
                          : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      💾 Guardar
                    </button>
                  </div>
                </div>
              )}

              {/* Places List */}
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900">Lugares Disponibles</h3>
                <p className="text-sm text-gray-500">Toca + Agregar para crear tu ruta</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[calc(100vh-20rem)]">
                {filteredPlaces.map((place) => {
                  const placeCoupons = getPlaceCoupons(place.id);
                  const inRoute = isPlaceInRoute(place.id);
                  
                  return (
                    <div
                      key={place.id}
                      className={`rounded-lg p-4 transition-all duration-200 border-2 cursor-pointer ${
                        inRoute 
                          ? 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 shadow-md' 
                          : 'bg-white hover:bg-gray-50 border-gray-200'
                      }`}
                      onClick={() => handleViewCoupons(place)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className={`font-semibold ${inRoute ? 'text-orange-800' : 'text-gray-900'}`}>
                            {place.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                              {place.category}
                            </span>
                            <span className="text-xs text-gray-500">⭐ {place.rating}</span>
                          </div>
                          {placeCoupons.length > 0 && (
                            <div className="flex items-center mt-2">
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                🎫 {placeCoupons.length} cupón{placeCoupons.length > 1 ? 'es' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{place.description || 'Sin descripción'}</p>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToRoute(place);
                          }}
                          className={`text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
                            inRoute
                              ? 'bg-orange-100 text-orange-700 border border-orange-300'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          {inRoute ? '✓ En Ruta' : '+ Agregar'}
                        </button>
                        
                        {placeCoupons.length > 0 && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewCoupons(place);
                            }}
                            className="text-xs text-white bg-green-500 hover:bg-green-600 font-semibold px-3 py-2 rounded-lg"
                          >
                            🎫 Cupones
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Route Modal */}
      {showSaveRouteModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 text-white">
              <h3 className="text-lg font-bold">💾 Guardar Ruta</h3>
            </div>
            
            <div className="p-6">
              <input
                type="text"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                placeholder="Nombre de la ruta"
                className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                autoFocus
              />
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSaveRouteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveRoute}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-4 z-[110]">
          <div className={`px-4 py-3 rounded-lg shadow-lg ${
            toastType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && selectedPlace && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
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
                    className="border border-gray-200 rounded-lg p-4"
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
                      </div>
                    </div>

                    <button
                      onClick={() => handleCouponRedeem(coupon.id)}
                      disabled={!coupon.is_available}
                      className={`w-full py-3 px-4 rounded-lg font-medium ${
                        coupon.is_available
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {coupon.is_available ? '🎫 Usar Cupón' : 'No Disponible'}
                    </button>
                  </div>
                ))}

                {getPlaceCoupons(selectedPlace.id).length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">No hay cupones disponibles</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowCouponModal(false)}
                  className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default Home;