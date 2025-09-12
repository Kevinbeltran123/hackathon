import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Places = () => {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    // Mock data
    setPlaces([
      {
        id: 101,
        name: 'La Lechona de la Abuela',
        address: 'Carrera 3 #13-45, Centro',
        phone: '+57 310 123 4567',
        rating: 4.7,
        total_visits: 89,
        is_active: true,
        opening_hours: 'L-D: 8:00-20:00'
      },
      {
        id: 105,
        name: 'Café Cultural Gourmet',
        address: 'Carrera 3 #17-89, Centro',
        phone: '+57 310 987 6543',
        rating: 4.8,
        total_visits: 72,
        is_active: true,
        opening_hours: 'L-S: 7:00-22:00'
      },
      {
        id: 102,
        name: 'El Fogón Tolimense',
        address: 'Calle 14 #4-32, Centro',
        phone: '+57 310 555 7890',
        rating: 4.5,
        total_visits: 56,
        is_active: true,
        opening_hours: 'L-D: 10:00-21:00'
      },
      {
        id: 129,
        name: 'Café de la Plaza',
        address: 'Plaza de Bolívar, Esquina',
        phone: '+57 310 111 2233',
        rating: 4.3,
        total_visits: 30,
        is_active: false,
        opening_hours: 'L-V: 6:00-18:00'
      }
    ]);
  };

  const togglePlaceStatus = (placeId) => {
    setPlaces(places.map(place => 
      place.id === placeId 
        ? { ...place, is_active: !place.is_active }
        : place
    ));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🏪 Gestión de Locales</h1>
        <p className="text-gray-600">Administra la información y estado de tus establecimientos</p>
      </div>

      <div className="grid gap-6">
        {places.map((place) => (
          <motion.div
            key={place.id}
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl">
                    🍽️
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{place.name}</h3>
                    <p className="text-gray-600">{place.address}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-blue-600 text-lg font-bold">{place.rating}⭐</div>
                    <div className="text-blue-800 text-sm">Rating promedio</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-green-600 text-lg font-bold">{place.total_visits}</div>
                    <div className="text-green-800 text-sm">Visitas totales</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-purple-600 text-lg font-bold">{place.phone}</div>
                    <div className="text-purple-800 text-sm">Teléfono</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="text-orange-600 text-lg font-bold">{place.opening_hours}</div>
                    <div className="text-orange-800 text-sm">Horarios</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  place.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {place.is_active ? '✅ Activo' : '❌ Inactivo'}
                </div>
                <button
                  onClick={() => togglePlaceStatus(place.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    place.is_active
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {place.is_active ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Places;