import React from 'react';

const Tabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'profile', label: 'Perfil', icon: '👤' },
    { id: 'checkin', label: 'Check-in', icon: '📍' },
    { id: 'coupons', label: 'Cupones', icon: '🎫' },
    { id: 'history', label: 'Historial', icon: '📊' },
  ];

  return (
    <div className="bg-white rounded-xl p-1 shadow-soft border border-gray-100">
      <div className="grid grid-cols-4 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center space-y-1 p-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ocobo/50 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-ocobo to-gold text-white shadow-glow-ocobo'
                : 'text-gray-600 hover:bg-gray-50 hover:text-ocobo'
            }`}
            aria-pressed={activeTab === tab.id}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
