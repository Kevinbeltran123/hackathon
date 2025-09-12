import React from 'react';

const ProfileHeader = ({ user, stats }) => {
  return (
    <div className="bg-gradient-to-br from-forest to-forest2 rounded-2xl p-6 text-white relative overflow-hidden">
      {/* Decorative ocobo flowers */}
      <div className="absolute top-4 right-4 opacity-20">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <path d="M30 5C35 5 40 8 42 13C44 18 42 25 38 30C35 35 30 40 30 40C30 40 25 35 22 30C18 25 16 18 18 13C20 8 25 5 30 5Z" fill="currentColor"/>
          <circle cx="30" cy="30" r="8" fill="white" opacity="0.3"/>
        </svg>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-2xl">🌸</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name || 'Explorador de Ibagué'}</h1>
            <p className="text-white/80 text-sm">Miembro desde {user.joinDate || 'Enero 2024'}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <div className="text-2xl font-bold text-gold">{stats.checkins || 0}</div>
            <div className="text-xs text-white/80">Check-ins</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <div className="text-2xl font-bold text-gold">{stats.points || 0}</div>
            <div className="text-xs text-white/80">Puntos</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <div className="text-2xl font-bold text-gold">{stats.coupons || 0}</div>
            <div className="text-xs text-white/80">Cupones</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
