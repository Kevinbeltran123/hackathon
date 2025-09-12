import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
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
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState('all');
  const mapRef = useRef(null);

  const categories = [
    { id: 'all', name: 'Todos', icon: '🌟', color: 'bg-blue-500' },
    { id: 'gastro', name: 'Gastronomía', icon: '🍽️', color: 'bg-orange-500' },
    { id: 'cultura', name: 'Cultura', icon: '🏛️', color: 'bg-purple-500' },
    { id: 'shopping', name: 'Compras', icon: '🛍️', color: 'bg-pink-500' },
    { id: 'recreacion', name: 'Recreación', icon: '🎭', color: 'bg-green-500' },
  ];

  // Load places from API
  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const response = await fetch('http://localhost:4001/api/places');
        if (response.ok) {
          const data = await response.json();
          // Map tags to category for consistency
          const placesWithCategory = data.map(place => ({
            ...place,
            category: place.tags && place.tags.length > 0 ? place.tags[0] : 'otros'
          }));
          setPlaces(placesWithCategory);
          setFilteredPlaces(placesWithCategory); // Show all places initially
        }
      } catch (error) {
        console.error('Error loading places:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlaces();
  }, []);

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !map) {
      const newMap = L.map(mapRef.current).setView([4.4389, -75.2043], 14);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(newMap);
      
      setMap(newMap);
    }
  }, [map]);

  // Update markers when filtered places change
  useEffect(() => {
    if (map && filteredPlaces.length > 0) {
      // Clear existing markers
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
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
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

      {/* Filters Panel */}
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

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full"></div>
        </div>

        {/* Places List Sidebar */}
        <div className="w-80 bg-white shadow-lg overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Lugares Disponibles</h3>
          </div>
          <div className="p-4 space-y-3">
            {filteredPlaces.map((place) => (
              <div
                key={place.id}
                className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{place.name}</h4>
                  <span className="text-xs text-gray-500">⭐ {place.rating}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{place.description || 'Sin descripción'}</p>
                <p className="text-xs text-gray-500 mb-2">{place.address || 'Sin dirección'}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                    {place.category}
                  </span>
                  <button className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
                    + Ver en mapa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;