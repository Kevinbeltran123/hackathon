// Admin dashboard with tourism KPIs and ocobo theme
import React from 'react'

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-forest">Dashboard Turístico 🌸</h1>
          <p className="text-gray-600">Métricas clave del sector turismo en Ibagué</p>
        </div>
        <div className="text-sm text-gray-500">
          Última actualización: {new Date().toLocaleTimeString('es-CO')}
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Check-ins Hoy</p>
              <p className="text-2xl font-bold text-forest">47</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-ocobo to-gold rounded-full flex items-center justify-center">
              <span className="text-white text-xl">📍</span>
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <span>↗️ +12%</span>
            <span className="ml-1">vs ayer</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Visitantes Esta Semana</p>
              <p className="text-2xl font-bold text-forest">234</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-forest to-forest2 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">👥</span>
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <span>↗️ +8%</span>
            <span className="ml-1">vs semana anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
              <p className="text-2xl font-bold text-forest">2.5h</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-gold to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">⏱️</span>
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <span>↗️ +0.3h</span>
            <span className="ml-1">vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos</p>
              <p className="text-2xl font-bold text-forest">
                $1,250,000
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">💰</span>
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <span>↗️ +15%</span>
            <span className="ml-1">vs mes anterior</span>
          </div>
        </div>
      </div>

      {/* Métricas de Categorías Turísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-forest">Cultura</h3>
            <div className="w-10 h-10 bg-gradient-to-r from-forest to-forest2 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">🏛️</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-forest mb-2">89</div>
          <p className="text-sm text-gray-600">Visitas culturales</p>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-forest to-forest2 h-2 rounded-full" style={{width: '35%'}}></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-forest">Gastronomía</h3>
            <div className="w-10 h-10 bg-gradient-to-r from-gold to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">🍽️</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-forest mb-2">156</div>
          <p className="text-sm text-gray-600">Visitas gastronómicas</p>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-gold to-orange-500 h-2 rounded-full" style={{width: '45%'}}></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-forest">Naturaleza</h3>
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">🌿</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-forest mb-2">78</div>
          <p className="text-sm text-gray-600">Visitas naturales</p>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{width: '20%'}}></div>
          </div>
        </div>
      </div>

      {/* Top 5 Lugares */}
      <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
        <h3 className="text-lg font-semibold text-forest mb-4">Top 5 Lugares Más Visitados</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-r from-ocobo to-gold rounded-full flex items-center justify-center text-white font-bold text-sm">
              1
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-forest">Conservatorio del Tolima</h4>
              <p className="text-sm text-gray-600 capitalize">cultura</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-forest">89</div>
              <div className="text-xs text-gray-500">visitas</div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1">
                <span className="text-yellow-500">⭐</span>
                <span className="text-sm font-medium">4.8</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-r from-ocobo to-gold rounded-full flex items-center justify-center text-white font-bold text-sm">
              2
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-forest">Jardín Botánico San Jorge</h4>
              <p className="text-sm text-gray-600 capitalize">naturaleza</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-forest">76</div>
              <div className="text-xs text-gray-500">visitas</div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1">
                <span className="text-yellow-500">⭐</span>
                <span className="text-sm font-medium">4.6</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-r from-ocobo to-gold rounded-full flex items-center justify-center text-white font-bold text-sm">
              3
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-forest">Restaurante La Pola</h4>
              <p className="text-sm text-gray-600 capitalize">gastro</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-forest">65</div>
              <div className="text-xs text-gray-500">visitas</div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1">
                <span className="text-yellow-500">⭐</span>
                <span className="text-sm font-medium">4.5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información del Sistema */}
      <div className="bg-gradient-to-r from-forest/5 to-forest2/5 rounded-xl p-6 border border-forest/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-ocobo to-gold rounded-full flex items-center justify-center">
              <span className="text-white text-lg">🌸</span>
            </div>
            <div>
              <h4 className="font-semibold text-forest">Sistema de Turismo Ibagué</h4>
              <p className="text-sm text-gray-600">Monitoreo en tiempo real del sector turístico</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Estado del Sistema</div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-600">Operativo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard