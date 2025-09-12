// Admin places management page
import React, { useState, useEffect } from 'react'

const Places = () => {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  const filters = [
    { id: 'all', name: 'Todos', count: 0 },
    { id: 'verified', name: 'Verificados', count: 0 },
    { id: 'pending', name: 'Pendientes', count: 0 },
    { id: 'rejected', name: 'Rechazados', count: 0 },
  ]

  useEffect(() => {
    // Simulate loading places
    const mockPlaces = [
      {
        id: 1,
        name: 'Conservatorio del Tolima',
        category: 'cultura',
        status: 'verified',
        verified: true,
        submittedBy: 'María García',
        submittedAt: '2024-01-15T10:00:00Z',
        rating: 4.8,
        checkins: 45,
        lat: 4.4399,
        lng: -75.2050,
        address: 'Calle 10 #3-15, Centro',
        description: 'Instituto de educación musical reconocido'
      },
      {
        id: 2,
        name: 'Jardín Botánico San Jorge',
        category: 'naturaleza',
        status: 'verified',
        verified: true,
        submittedBy: 'Carlos López',
        submittedAt: '2024-01-12T14:30:00Z',
        rating: 4.6,
        checkins: 32,
        lat: 4.4350,
        lng: -75.2100,
        address: 'Carrera 5 #12-34, Belén',
        description: 'Jardín botánico con especies nativas'
      },
      {
        id: 3,
        name: 'Nuevo Restaurante',
        category: 'gastro',
        status: 'pending',
        verified: false,
        submittedBy: 'Ana Rodríguez',
        submittedAt: '2024-01-20T09:15:00Z',
        rating: 0,
        checkins: 0,
        lat: 4.4420,
        lng: -75.2000,
        address: 'Calle 15 #8-20, La Pola',
        description: 'Propuesta de nuevo restaurante'
      }
    ]

    // Update filter counts
    const updatedFilters = filters.map(filter => ({
      ...filter,
      count: mockPlaces.filter(place => {
        if (filter.id === 'all') return true
        if (filter.id === 'verified') return place.status === 'verified'
        if (filter.id === 'pending') return place.status === 'pending'
        if (filter.id === 'rejected') return place.status === 'rejected'
        return false
      }).length
    }))

    setTimeout(() => {
      setPlaces(mockPlaces)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredPlaces = places.filter(place => {
    const matchesFilter = filter === 'all' || place.status === filter
    const matchesSearch = place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         place.address.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleStatusChange = (placeId, newStatus) => {
    setPlaces(prev => prev.map(place => 
      place.id === placeId 
        ? { ...place, status: newStatus, verified: newStatus === 'verified' }
        : place
    ))
  }

  const handleDeletePlace = (placeId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este lugar?')) {
      setPlaces(prev => prev.filter(place => place.id !== placeId))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocobo mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando lugares...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-forest">Gestión de Lugares</h1>
          <p className="text-gray-600">Administra POIs y propuestas de usuarios</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 border border-forest text-forest rounded-lg hover:bg-forest/10 transition-colors">
            📥 Importar GeoJSON
          </button>
          <button className="px-4 py-2 border border-forest text-forest rounded-lg hover:bg-forest/10 transition-colors">
            📤 Exportar
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-ocobo to-gold text-white rounded-lg hover:shadow-glow-ocobo transition-all duration-200"
          >
            ➕ Agregar Lugar
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar lugares..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocobo/50 focus:border-ocobo"
            />
          </div>

          {/* Filters */}
          <div className="flex space-x-2">
            {filters.map((filterOption) => (
              <button
                key={filterOption.id}
                onClick={() => setFilter(filterOption.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === filterOption.id
                    ? 'bg-gradient-to-r from-ocobo to-gold text-white shadow-glow-ocobo'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filterOption.name} ({filterOption.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Places Table */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lugar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estadísticas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enviado por
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPlaces.map((place) => (
                <tr key={place.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-ocobo/20 to-gold/20 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-lg">
                          {place.category === 'cultura' ? '🏛️' :
                           place.category === 'naturaleza' ? '🌿' :
                           place.category === 'gastro' ? '🍽️' : '📍'}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-forest">{place.name}</div>
                        <div className="text-sm text-gray-500">{place.address}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      {place.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      place.status === 'verified' ? 'bg-green-100 text-green-800' :
                      place.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {place.status === 'verified' ? 'Verificado' :
                       place.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <span>⭐</span>
                        <span>{place.rating || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>📍</span>
                        <span>{place.checkins}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div className="font-medium">{place.submittedBy}</div>
                      <div className="text-xs">
                        {new Date(place.submittedAt).toLocaleDateString('es-CO')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {place.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(place.id, 'verified')}
                            className="text-green-600 hover:text-green-900"
                          >
                            ✅ Aprobar
                          </button>
                          <button
                            onClick={() => handleStatusChange(place.id, 'rejected')}
                            className="text-red-600 hover:text-red-900"
                          >
                            ❌ Rechazar
                          </button>
                        </>
                      )}
                      <button className="text-blue-600 hover:text-blue-900">
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDeletePlace(place.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredPlaces.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No se encontraron lugares
          </h3>
          <p className="text-gray-500">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay lugares con este filtro'}
          </p>
        </div>
      )}
    </div>
  )
}

export default Places
