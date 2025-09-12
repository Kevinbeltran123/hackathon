import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../auth/AuthProvider';

const Dashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalVisits: 0,
    totalCheckins: 0, 
    totalCouponsUsed: 0,
    avgRating: 0,
    revenueEstimated: 0,
    activeCoupons: 0,
    topPlace: null
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [placesPerformance, setPlacesPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls - replace with real endpoints
      const metricsResponse = await fetch('/api/business/metrics', {
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      });
      
      const activityResponse = await fetch('/api/business/recent-activity', {
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      });
      
      const placesResponse = await fetch('/api/business/places-performance', {
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      });

      // Mock data for demo
      setMetrics({
        totalVisits: 247,
        totalCheckins: 189,
        totalCouponsUsed: 23,
        avgRating: 4.6,
        revenueEstimated: 1250000,
        activeCoupons: 4,
        topPlace: 'La Lechona de la Abuela'
      });

      setRecentActivity([
        { id: 1, type: 'checkin', place: 'La Lechona de la Abuela', user: 'Ana M.', time: '2 min ago', rating: 4.5 },
        { id: 2, type: 'coupon_used', place: 'Café Cultural Gourmet', user: 'Carlos R.', time: '15 min ago', coupon: 'Degustación Gratis' },
        { id: 3, type: 'review', place: 'El Fogón Tolimense', user: 'María L.', time: '1 hora ago', rating: 4.8 },
        { id: 4, type: 'checkin', place: 'Café de la Plaza', user: 'José P.', time: '2 horas ago', rating: 4.2 }
      ]);

      setPlacesPerformance([
        { id: 101, name: 'La Lechona de la Abuela', visits: 89, checkins: 67, rating: 4.7, revenue: 580000, trend: 'up' },
        { id: 105, name: 'Café Cultural Gourmet', visits: 72, checkins: 58, rating: 4.8, revenue: 320000, trend: 'up' },
        { id: 102, name: 'El Fogón Tolimense', visits: 56, checkins: 42, rating: 4.5, revenue: 250000, trend: 'stable' },
        { id: 129, name: 'Café de la Plaza', visits: 30, checkins: 22, rating: 4.3, revenue: 100000, trend: 'down' }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'checkin': return '📍';
      case 'coupon_used': return '🎫';
      case 'review': return '⭐';
      default: return '📊';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
            {user.avatar || '👨‍💼'}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">¡Bienvenido, {user.full_name}! 👋</h1>
            <p className="text-gray-600">Panel de Control Empresarial - Grupo Gastronómico Tolimense</p>
          </div>
        </div>
        <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
          📊 Datos actualizados en tiempo real • Última actualización: hace 2 minutos
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Visitas Totales</p>
              <p className="text-3xl font-bold">{metrics.totalVisits}</p>
              <p className="text-blue-200 text-xs mt-1">↗️ +12% vs semana pasada</p>
            </div>
            <div className="text-4xl opacity-80">👥</div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Check-ins</p>
              <p className="text-3xl font-bold">{metrics.totalCheckins}</p>
              <p className="text-green-200 text-xs mt-1">📍 {Math.round((metrics.totalCheckins / metrics.totalVisits) * 100)}% conversión</p>
            </div>
            <div className="text-4xl opacity-80">📍</div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-xl text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Cupones Usados</p>
              <p className="text-3xl font-bold">{metrics.totalCouponsUsed}</p>
              <p className="text-orange-200 text-xs mt-1">🎫 {metrics.activeCoupons} activos</p>
            </div>
            <div className="text-4xl opacity-80">🎫</div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Rating Promedio</p>
              <p className="text-3xl font-bold">{metrics.avgRating}⭐</p>
              <p className="text-purple-200 text-xs mt-1">🏆 Top: {metrics.topPlace}</p>
            </div>
            <div className="text-4xl opacity-80">⭐</div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue Card */}
        <div className="lg:col-span-1">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-xl text-white shadow-lg h-fit"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">💰</div>
              <div>
                <h3 className="text-xl font-bold">Ingresos Estimados</h3>
                <p className="text-yellow-100 text-sm">Esta semana</p>
              </div>
            </div>
            <div className="text-4xl font-bold mb-2">{formatCurrency(metrics.revenueEstimated)}</div>
            <div className="text-yellow-100 text-sm">
              📊 Basado en check-ins y cupones utilizados
            </div>
            <div className="mt-4 text-yellow-100 text-xs bg-white bg-opacity-20 p-2 rounded">
              💡 Los ingresos se calculan usando promedios de gasto por categoría y cupones canjeados
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">🔔 Actividad Reciente</h3>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                Ver todas
              </button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <motion.div
                  key={activity.id}
                  whileHover={{ backgroundColor: '#f8fafc' }}
                  className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 transition-colors"
                >
                  <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{activity.user}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-600 text-sm">{activity.place}</span>
                    </div>
                    <div className="text-gray-500 text-sm">
                      {activity.type === 'checkin' && `Check-in • ${activity.rating}⭐`}
                      {activity.type === 'coupon_used' && `Usó cupón: ${activity.coupon}`}
                      {activity.type === 'review' && `Nueva reseña • ${activity.rating}⭐`}
                    </div>
                  </div>
                  <div className="text-gray-400 text-xs">{activity.time}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Places Performance */}
      <div className="mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">📊 Performance por Local</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-full font-medium">
                Esta semana
              </button>
              <button className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-full">
                Este mes
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {placesPerformance.map((place) => (
              <motion.div
                key={place.id}
                whileHover={{ scale: 1.02 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{place.name}</h4>
                  <div className="text-xl">{getTrendIcon(place.trend)}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Visitas:</span>
                    <span className="ml-2 font-medium">{place.visits}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Check-ins:</span>
                    <span className="ml-2 font-medium">{place.checkins}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Rating:</span>
                    <span className="ml-2 font-medium">{place.rating}⭐</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Ingresos:</span>
                    <span className="ml-2 font-medium text-green-600">{formatCurrency(place.revenue)}</span>
                  </div>
                </div>
                <div className="mt-3 bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(place.visits / 100) * 100}%` }}
                  ></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;