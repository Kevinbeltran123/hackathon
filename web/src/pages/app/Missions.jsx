// User missions page
import React, { useState, useEffect } from 'react'

const Missions = () => {
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    // Simulate loading missions
    const mockMissions = [
      {
        id: 1,
        title: 'Explorador Cultural',
        description: 'Visita 5 lugares culturales en Ibagué',
        category: 'cultura',
        progress: 3,
        target: 5,
        reward: 250,
        status: 'active',
        difficulty: 'medium',
        icon: '🏛️',
        color: 'from-forest to-forest2'
      },
      {
        id: 2,
        title: 'Gourmet Local',
        description: 'Prueba 3 restaurantes diferentes',
        category: 'gastro',
        progress: 1,
        target: 3,
        reward: 150,
        status: 'active',
        difficulty: 'easy',
        icon: '🍽️',
        color: 'from-gold to-orange-500'
      },
      {
        id: 3,
        title: 'Amante de la Naturaleza',
        description: 'Explora 4 lugares naturales',
        category: 'naturaleza',
        progress: 4,
        target: 4,
        reward: 200,
        status: 'completed',
        difficulty: 'medium',
        icon: '🌿',
        color: 'from-green-500 to-green-600'
      },
      {
        id: 4,
        title: 'Fotógrafo Urbano',
        description: 'Toma 10 fotos en diferentes lugares',
        category: 'foto',
        progress: 7,
        target: 10,
        reward: 300,
        status: 'active',
        difficulty: 'hard',
        icon: '📸',
        color: 'from-purple-500 to-purple-600'
      }
    ]

    setTimeout(() => {
      setMissions(mockMissions)
      setLoading(false)
    }, 1000)
  }, [])

  const filters = [
    { id: 'all', name: 'Todas', count: 0 },
    { id: 'active', name: 'Activas', count: 0 },
    { id: 'completed', name: 'Completadas', count: 0 },
    { id: 'locked', name: 'Bloqueadas', count: 0 },
  ]

  const filteredMissions = missions.filter(mission => 
    filter === 'all' || mission.status === filter
  )

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Fácil'
      case 'medium': return 'Medio'
      case 'hard': return 'Difícil'
      default: return 'Desconocido'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocobo mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando misiones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-forest mb-2">Misiones y Retos</h1>
        <p className="text-gray-600">
          Completa misiones para ganar puntos y desbloquear logros
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-ocobo to-gold rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-xl">🎯</span>
          </div>
          <h3 className="text-2xl font-bold text-forest mb-1">
            {missions.filter(m => m.status === 'active').length}
          </h3>
          <p className="text-sm text-gray-600">Misiones activas</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-forest to-forest2 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-xl">✅</span>
          </div>
          <h3 className="text-2xl font-bold text-forest mb-1">
            {missions.filter(m => m.status === 'completed').length}
          </h3>
          <p className="text-sm text-gray-600">Completadas</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-gold to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-xl">⭐</span>
          </div>
          <h3 className="text-2xl font-bold text-forest mb-1">
            {missions.reduce((sum, mission) => sum + (mission.status === 'completed' ? mission.reward : 0), 0)}
          </h3>
          <p className="text-sm text-gray-600">Puntos ganados</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-soft border border-gray-100">
        <div className="flex flex-wrap gap-2">
          {filters.map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === filterOption.id
                  ? 'bg-gradient-to-r from-ocobo to-gold text-white shadow-glow-ocobo'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{filterOption.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Missions List */}
      <div className="space-y-4">
        {filteredMissions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No hay misiones
            </h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'No hay misiones disponibles en este momento'
                : `No hay misiones ${filters.find(f => f.id === filter)?.name.toLowerCase()}`
              }
            </p>
          </div>
        ) : (
          filteredMissions.map((mission) => (
            <div key={mission.id} className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Mission Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-r ${mission.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-2xl">{mission.icon}</span>
                  </div>

                  {/* Mission Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-forest">{mission.title}</h3>
                        <p className="text-sm text-gray-600">{mission.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-ocobo">{mission.reward} pts</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(mission.difficulty)}`}>
                          {getDifficultyText(mission.difficulty)}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progreso</span>
                        <span>{mission.progress}/{mission.target}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 bg-gradient-to-r ${mission.color} rounded-full transition-all duration-300`}
                          style={{ width: `${(mission.progress / mission.target) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm">
                        <div className={`flex items-center space-x-1 ${
                          mission.status === 'completed' ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          <span>{mission.status === 'completed' ? '✅' : '⏳'}</span>
                          <span className="capitalize">
                            {mission.status === 'completed' ? 'Completada' : 
                             mission.status === 'active' ? 'En progreso' : 'Bloqueada'}
                          </span>
                        </div>
                      </div>

                      {mission.status === 'active' && (
                        <button className="px-4 py-2 bg-gradient-to-r from-ocobo to-gold text-white rounded-lg text-sm font-medium hover:shadow-glow-ocobo transition-all duration-200">
                          Ver Detalles
                        </button>
                      )}

                      {mission.status === 'completed' && (
                        <div className="flex items-center space-x-2 text-green-600">
                          <span>🎉</span>
                          <span className="text-sm font-medium">¡Completada!</span>
                        </div>
                      )}
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

export default Missions
