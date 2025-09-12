// Admin check-ins moderation page
import React, { useState, useEffect } from 'react'

const CheckIns = () => {
  const [checkIns, setCheckIns] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Simulate loading check-ins
    const mockCheckIns = [
      {
        id: 1,
        user: 'María García',
        userEmail: 'maria@email.com',
        place: 'Conservatorio del Tolima',
        category: 'cultura',
        date: '2024-01-15T14:30:00Z',
        note: 'Concierto increíble de música clásica',
        photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...',
        status: 'approved',
        points: 50,
        verified: true
      },
      {
        id: 2,
        user: 'Carlos López',
        userEmail: 'carlos@email.com',
        place: 'Jardín Botánico San Jorge',
        category: 'naturaleza',
        date: '2024-01-12T10:15:00Z',
        note: 'Paseo familiar muy relajante',
        photo: null,
        status: 'pending',
        points: 50,
        verified: false
      },
      {
        id: 3,
        user: 'Ana Rodríguez',
        userEmail: 'ana@email.com',
        place: 'Restaurante La Pola',
        category: 'gastro',
        date: '2024-01-10T19:45:00Z',
        note: 'La lechona más deliciosa de Ibagué',
        photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...',
        status: 'flagged',
        points: 50,
        verified: false
      }
    ]

    setTimeout(() => {
      setCheckIns(mockCheckIns)
      setLoading(false)
    }, 1000)
  }, [])

  const filters = [
    { id: 'all', name: 'Todos', count: 0 },
    { id: 'pending', name: 'Pendientes', count: 0 },
    { id: 'approved', name: 'Aprobados', count: 0 },
    { id: 'flagged', name: 'Marcados', count: 0 },
  ]

  const filteredCheckIns = checkIns.filter(checkIn => {
    const matchesFilter = filter === 'all' || checkIn.status === filter
    const matchesSearch = checkIn.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         checkIn.place.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         checkIn.note.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleStatusChange = (checkInId, newStatus) => {
    setCheckIns(prev => prev.map(checkIn => 
      checkIn.id === checkInId 
        ? { ...checkIn, status: newStatus, verified: newStatus === 'approved' }
        : checkIn
    ))
  }

  const handleDeleteCheckIn = (checkInId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este check-in?')) {
      setCheckIns(prev => prev.filter(checkIn => checkIn.id !== checkInId))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocobo mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando check-ins...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-forest">Moderación de Check-ins</h1>
          <p className="text-gray-600">Revisa y aprueba check-ins de usuarios</p>
        </div>
        <div className="text-sm text-gray-500">
          {filteredCheckIns.length} check-ins encontrados
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por usuario, lugar o nota..."
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

      {/* Check-ins List */}
      <div className="space-y-4">
        {filteredCheckIns.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No se encontraron check-ins
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay check-ins con este filtro'}
            </p>
          </div>
        ) : (
          filteredCheckIns.map((checkIn) => (
            <div key={checkIn.id} className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  {/* User Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-r from-ocobo to-gold rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold">
                      {checkIn.user.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-forest">{checkIn.user}</h3>
                        <p className="text-sm text-gray-600">{checkIn.userEmail}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(checkIn.date).toLocaleDateString('es-CO', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-ocobo">+{checkIn.points}</div>
                        <div className="text-xs text-gray-500">puntos</div>
                      </div>
                    </div>

                    {/* Place Info */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">
                          {checkIn.category === 'cultura' ? '🏛️' :
                           checkIn.category === 'naturaleza' ? '🌿' :
                           checkIn.category === 'gastro' ? '🍽️' : '📍'}
                        </span>
                        <h4 className="font-semibold text-forest">{checkIn.place}</h4>
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                          {checkIn.category}
                        </span>
                      </div>
                    </div>

                    {/* Note */}
                    {checkIn.note && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-700">{checkIn.note}</p>
                      </div>
                    )}

                    {/* Photo */}
                    {checkIn.photo && (
                      <div className="mb-3">
                        <img
                          src={checkIn.photo}
                          alt="Foto del check-in"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    {/* Status and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          checkIn.status === 'approved' ? 'bg-green-100 text-green-800' :
                          checkIn.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {checkIn.status === 'approved' ? 'Aprobado' :
                           checkIn.status === 'pending' ? 'Pendiente' : 'Marcado'}
                        </span>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <span>📍</span>
                          <span>Check-in</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {checkIn.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(checkIn.id, 'approved')}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                            >
                              ✅ Aprobar
                            </button>
                            <button
                              onClick={() => handleStatusChange(checkIn.id, 'flagged')}
                              className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                            >
                              🚩 Marcar
                            </button>
                          </>
                        )}
                        {checkIn.status === 'flagged' && (
                          <button
                            onClick={() => handleStatusChange(checkIn.id, 'approved')}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                          >
                            ✅ Aprobar
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCheckIn(checkIn.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CheckIns
