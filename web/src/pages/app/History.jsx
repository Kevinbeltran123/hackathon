// User history page with timeline
import React, { useState, useEffect } from 'react'
import Page from '../../ui/Page'

const History = () => {
  const [checkIns, setCheckIns] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    // Simulate loading check-ins
    const mockCheckIns = [
      {
        id: 1,
        place: 'Conservatorio del Tolima',
        category: 'cultura',
        date: '2024-01-15T14:30:00Z',
        points: 50,
        note: 'Concierto increíble de música clásica',
        photo: null,
        verified: true
      },
      {
        id: 2,
        place: 'Jardín Botánico San Jorge',
        category: 'naturaleza',
        date: '2024-01-12T10:15:00Z',
        points: 50,
        note: 'Paseo familiar muy relajante',
        photo: null,
        verified: true
      },
      {
        id: 3,
        place: 'Restaurante La Pola',
        category: 'gastro',
        date: '2024-01-10T19:45:00Z',
        points: 50,
        note: 'La lechona más deliciosa de Ibagué',
        photo: null,
        verified: true
      }
    ]

    setTimeout(() => {
      setCheckIns(mockCheckIns)
      setLoading(false)
    }, 1000)
  }, [])

  const categories = [
    { id: 'all', name: 'Todos', icon: '🌟', color: 'from-ocobo to-gold' },
    { id: 'cultura', name: 'Cultura', icon: '🏛️', color: 'from-forest to-forest2' },
    { id: 'gastro', name: 'Gastronomía', icon: '🍽️', color: 'from-gold to-orange-500' },
    { id: 'naturaleza', name: 'Naturaleza', icon: '🌿', color: 'from-green-500 to-green-600' },
  ]

  const filteredCheckIns = filter === 'all' 
    ? checkIns 
    : checkIns.filter(checkIn => checkIn.category === filter)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-forest/5 to-forest2/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocobo mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando historial...</p>
        </div>
      </div>
    )
  }

  return (
    <Page title="Mi Historial 🌸">
      <div className="max-w-4xl mx-auto">
        <p className="text-gray-600 mb-8">Revisa todos tus check-ins y actividades</p>

        {/* Filter Buttons */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setFilter(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  filter === category.id
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                    : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Check-ins List */}
        <div className="space-y-6">
          {filteredCheckIns.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay check-ins</h3>
              <p className="text-gray-500">Comienza explorando lugares en Ibagué</p>
            </div>
          ) : (
            filteredCheckIns.map((checkIn, index) => (
              <div key={checkIn.id} className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
                <div className="flex items-start space-x-4">
                  {/* Timeline Line */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-ocobo to-gold rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    {index < filteredCheckIns.length - 1 && (
                      <div className="w-0.5 h-16 bg-gray-200 mt-2"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-forest">{checkIn.place}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {new Date(checkIn.date).toLocaleDateString('es-CO')}
                        </span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          ✓ Verificado
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 mb-3">
                      <span className="text-sm bg-ocobo text-white px-3 py-1 rounded-full">
                        {checkIn.category}
                      </span>
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm font-medium">{checkIn.points} puntos</span>
                      </div>
                    </div>

                    {checkIn.note && (
                      <p className="text-gray-600 mb-3">{checkIn.note}</p>
                    )}

                    {checkIn.photo && (
                      <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400">📸</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats Summary */}
        <div className="mt-8 bg-white rounded-xl shadow-soft border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-forest mb-4">Resumen de Actividad</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-ocobo">{checkIns.length}</div>
              <div className="text-sm text-gray-600">Check-ins totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gold">{checkIns.reduce((sum, c) => sum + c.points, 0)}</div>
              <div className="text-sm text-gray-600">Puntos ganados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-forest">{new Set(checkIns.map(c => c.category)).size}</div>
              <div className="text-sm text-gray-600">Categorías exploradas</div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  )
}

export default History