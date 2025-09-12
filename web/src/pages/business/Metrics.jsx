import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Metrics = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [metrics, setMetrics] = useState({
    visitsOverTime: [],
    topHours: [],
    customerFlow: [],
    conversionRate: 76
  });

  useEffect(() => {
    fetchMetrics();
  }, [timeRange]);

  const fetchMetrics = async () => {
    // Mock analytics data
    setMetrics({
      visitsOverTime: [
        { day: 'Lun', visits: 32, checkins: 24 },
        { day: 'Mar', visits: 45, checkins: 34 },
        { day: 'Mié', visits: 38, checkins: 28 },
        { day: 'Jue', visits: 52, checkins: 41 },
        { day: 'Vie', visits: 67, checkins: 52 },
        { day: 'Sáb', visits: 89, checkins: 71 },
        { day: 'Dom', visits: 43, checkins: 31 }
      ],
      topHours: [
        { hour: '12:00', visits: 23 },
        { hour: '18:00', visits: 19 },
        { hour: '14:00', visits: 16 },
        { hour: '16:00', visits: 14 },
        { hour: '20:00', visits: 12 }
      ],
      customerFlow: [
        { source: 'Mapa directo', count: 145, percentage: 42 },
        { source: 'Rutas sugeridas', count: 98, percentage: 28 },
        { source: 'Cupones', count: 67, percentage: 19 },
        { source: 'Recomendaciones', count: 38, percentage: 11 }
      ],
      conversionRate: 76
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Análisis y Métricas</h1>
          <p className="text-gray-600">Insights detallados sobre el comportamiento de tus clientes</p>
        </div>
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-white border border-gray-300 rounded-lg px-4 py-2 font-medium"
        >
          <option value="week">Esta semana</option>
          <option value="month">Este mes</option>
          <option value="quarter">Este trimestre</option>
        </select>
      </div>

      {/* Conversion Rate */}
      <div className="mb-8">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-green-500 to-teal-600 p-6 rounded-xl text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">🎯 Tasa de Conversión</h3>
              <p className="text-green-100 text-sm">Visitantes que hacen check-in</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{metrics.conversionRate}%</div>
              <div className="text-green-200 text-sm">↗️ +5% vs semana pasada</div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Visits Over Time */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">📈 Visitas por Día</h3>
          <div className="space-y-4">
            {metrics.visitsOverTime.map((day, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-12 text-sm font-medium text-gray-600">{day.day}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="bg-blue-200 rounded-full h-4 flex-1 relative">
                      <div 
                        className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${(day.visits / 90) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-blue-600">{day.visits}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-green-200 rounded-full h-3 flex-1 relative">
                      <div 
                        className="bg-green-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(day.checkins / 90) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-green-600">{day.checkins}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="text-gray-600">Visitas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span className="text-gray-600">Check-ins</span>
            </div>
          </div>
        </div>

        {/* Top Hours */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">🕒 Horarios de Mayor Actividad</h3>
          <div className="space-y-4">
            {metrics.topHours.map((hour, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{hour.hour}</span>
                    <span className="text-sm font-medium text-orange-600">{hour.visits} visitas</span>
                  </div>
                  <div className="bg-orange-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(hour.visits / 25) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Flow Sources */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">🌊 Fuentes de Tráfico</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.customerFlow.map((source, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -4 }}
              className="text-center p-4 border border-gray-200 rounded-lg"
            >
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {source.percentage}%
              </div>
              <h4 className="font-medium text-gray-900 mb-1">{source.source}</h4>
              <p className="text-2xl font-bold text-purple-600">{source.count}</p>
              <p className="text-sm text-gray-500">visitas</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Metrics;