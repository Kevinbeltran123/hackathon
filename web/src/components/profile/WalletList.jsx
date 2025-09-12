import React, { useState } from 'react';
import CouponCard from './CouponCard';

const WalletList = ({ coupons, onRedeem, onRemove }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const filters = [
    { id: 'all', name: 'Todos', icon: '🌟' },
    { id: 'active', name: 'Válidos', icon: '✅' },
    { id: 'used', name: 'Usados', icon: '🎯' },
    { id: 'expired', name: 'Expirados', icon: '⏰' },
  ];

  const sortOptions = [
    { id: 'newest', name: 'Más recientes' },
    { id: 'oldest', name: 'Más antiguos' },
    { id: 'expiry', name: 'Por expiración' },
    { id: 'discount', name: 'Por descuento' },
  ];

  const filteredAndSortedCoupons = coupons
    .filter(coupon => {
      if (filter === 'all') return true;
      if (filter === 'active') return coupon.status === 'active' && new Date(coupon.expiryDate) > new Date();
      if (filter === 'used') return coupon.status === 'used';
      if (filter === 'expired') return new Date(coupon.expiryDate) <= new Date();
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'expiry':
          return new Date(a.expiryDate) - new Date(b.expiryDate);
        case 'discount':
          return (b.discountType === 'percentage' ? b.discount : b.discount / 100) - 
                 (a.discountType === 'percentage' ? a.discount : a.discount / 100);
        default:
          return 0;
      }
    });

  return (
    <div className="bg-white rounded-xl shadow-soft border border-gray-100">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral">Mi Wallet</h3>
          <div className="text-sm text-gray-600">
            {filteredAndSortedCoupons.length} cupón{filteredAndSortedCoupons.length !== 1 ? 'es' : ''}
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 overflow-x-auto pb-2 mb-4">
          {filters.map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={`flex items-center space-x-1 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                filter === filterOption.id
                  ? 'bg-gradient-to-r from-ocobo to-gold text-white shadow-glow-ocobo'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{filterOption.icon}</span>
              <span>{filterOption.name}</span>
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ocobo/50"
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {filteredAndSortedCoupons.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🎫</div>
            <h4 className="text-lg font-semibold text-gray-600 mb-2">
              {filter === 'all' ? 'No tienes cupones' : `No hay cupones ${filters.find(f => f.id === filter)?.name.toLowerCase()}`}
            </h4>
            <p className="text-gray-500 text-sm">
              {filter === 'all' 
                ? 'Los cupones que recibas aparecerán aquí'
                : 'Intenta con otro filtro'
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAndSortedCoupons.map((coupon) => (
              <div key={coupon.id} className="relative">
                <CouponCard
                  coupon={coupon}
                  onRedeem={onRedeem}
                  onAddToWallet={() => {}} // Already in wallet
                  showQR={true}
                />
                {onRemove && (
                  <button
                    onClick={() => onRemove(coupon.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    aria-label="Eliminar cupón"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletList;
