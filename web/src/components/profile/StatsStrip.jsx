import React from 'react';

const StatsStrip = ({ achievements, level }) => {
  const achievementsData = [
    { id: 'first_checkin', name: 'Primer Check-in', icon: '🎯', unlocked: achievements.includes('first_checkin') },
    { id: 'explorer', name: 'Explorador', icon: '🗺️', unlocked: achievements.includes('explorer') },
    { id: 'local_hero', name: 'Héroe Local', icon: '🏆', unlocked: achievements.includes('local_hero') },
    { id: 'coupon_master', name: 'Maestro de Cupones', icon: '🎫', unlocked: achievements.includes('coupon_master') },
  ];

  return (
    <div className="bg-white rounded-xl p-4 shadow-soft border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral">Logros</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Nivel</span>
          <div className="bg-gradient-to-r from-ocobo to-gold text-white px-3 py-1 rounded-full text-sm font-bold">
            {level || 1}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {achievementsData.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-3 rounded-lg text-center transition-all duration-200 ${
              achievement.unlocked
                ? 'bg-gradient-to-br from-forest/10 to-forest2/10 border-2 border-forest/30 shadow-glow-forest'
                : 'bg-gray-50 border border-gray-200 opacity-60'
            }`}
          >
            <div className="text-2xl mb-1">{achievement.icon}</div>
            <div className={`text-xs font-medium ${
              achievement.unlocked ? 'text-forest' : 'text-gray-500'
            }`}>
              {achievement.name}
            </div>
            {achievement.unlocked && (
              <div className="w-2 h-2 bg-gold rounded-full mx-auto mt-1"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsStrip;
