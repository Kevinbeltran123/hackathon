import React, { useState } from 'react';

const PlacePicker = ({ places, onPlaceSelect, selectedPlace, onFilterChange }) => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = [
    { id: 'all', name: 'Todos', icon: '🌟' },
    { id: 'gastro', name: 'Gastronomía', icon: '🍽️' },
    { id: 'cultura', name: 'Cultura', icon: '🏛️' },
    { id: 'naturaleza', name: 'Naturaleza', icon: '🌿' },
    { id: 'musica', name: 'Música', icon: '🎵' },
  ];

  const filteredPlaces = places.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         place.barrio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || place.tags.includes(categoryFilter);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white rounded-xl shadow-soft border border-gray-100">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral">Elige un lugar</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-ocobo text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-label="Vista de lista"
            >
              📋
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'map' 
                  ? 'bg-ocobo text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-label="Vista de mapa"
            >
              🗺️
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Buscar lugares..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocobo/50 focus:border-ocobo"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
        </div>

        {/* Category Filters */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setCategoryFilter(category.id)}
              className={`flex items-center space-x-1 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                categoryFilter === category.id
                  ? 'bg-gradient-to-r from-ocobo to-gold text-white shadow-glow-ocobo'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {viewMode === 'list' ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredPlaces.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🔍</div>
                <p>No se encontraron lugares</p>
              </div>
            ) : (
              filteredPlaces.map((place) => (
                <button
                  key={place.id}
                  onClick={() => onPlaceSelect(place)}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-ocobo/50 ${
                    selectedPlace?.id === place.id
                      ? 'border-ocobo bg-gradient-to-r from-ocobo/10 to-gold/10 shadow-glow-ocobo'
                      : 'border-gray-200 hover:border-ocobo/50 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-neutral mb-1">{place.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{place.barrio}</p>
                      <div className="flex flex-wrap gap-1">
                        {place.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-forest/10 text-forest text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-sm text-gray-500">
                        {place.distance ? `${place.distance}m` : '📍'}
                      </div>
                      {place.verified && (
                        <div className="text-xs text-forest font-medium mt-1">✓ Verificado</div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">🗺️</div>
              <p>Vista de mapa</p>
              <p className="text-sm">Integrar con Leaflet aquí</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacePicker;
