import React, { useState } from 'react';

const CouponCard = ({ coupon, onRedeem, onAddToWallet, showQR = false }) => {
  const [showCode, setShowCode] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'from-forest to-forest2';
      case 'used': return 'from-gray-400 to-gray-500';
      case 'expired': return 'from-red-500 to-red-600';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Válido';
      case 'used': return 'Usado';
      case 'expired': return 'Expirado';
      default: return 'Desconocido';
    }
  };

  const formatDiscount = () => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discount}%`;
    } else {
      return `$${coupon.discount}`;
    }
  };

  const isExpired = new Date(coupon.expiryDate) < new Date();
  const canRedeem = coupon.status === 'active' && !isExpired;

  return (
    <div className={`bg-white rounded-xl shadow-soft border-2 transition-all duration-200 hover:shadow-lg ${
      canRedeem ? 'border-forest/20 hover:border-forest/40' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${getStatusColor(coupon.status)} p-4 rounded-t-xl text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🎫</span>
            <div>
              <h3 className="font-bold text-lg">{coupon.title}</h3>
              <p className="text-sm opacity-90">{coupon.agency}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatDiscount()}</div>
            <div className="text-xs opacity-90">descuento</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-gray-700 text-sm mb-4">{coupon.description}</p>
        
        {/* Code Section */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-1">Código del cupón</div>
              <div className="font-mono text-lg font-bold text-neutral">
                {showCode ? coupon.code : '••••••'}
              </div>
            </div>
            <button
              onClick={() => setShowCode(!showCode)}
              className="text-ocobo hover:text-ocobo/80 transition-colors"
              aria-label={showCode ? 'Ocultar código' : 'Mostrar código'}
            >
              {showCode ? '👁️‍🗨️' : '👁️'}
            </button>
          </div>
        </div>

        {/* QR Code */}
        {showQR && (
          <div className="text-center mb-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 inline-block">
              <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">QR Code</p>
            </div>
          </div>
        )}

        {/* Expiry */}
        <div className="text-xs text-gray-500 mb-4">
          Válido hasta: {new Date(coupon.expiryDate).toLocaleDateString('es-CO')}
        </div>

        {/* Terms */}
        {coupon.terms && (
          <div className="text-xs text-gray-600 mb-4 bg-gray-50 rounded p-2">
            <strong>Términos:</strong> {coupon.terms}
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          {canRedeem ? (
            <>
              <button
                onClick={() => onRedeem && onRedeem(coupon)}
                className="flex-1 bg-gradient-to-r from-forest to-forest2 text-white py-2 px-4 rounded-lg font-semibold hover:shadow-glow-forest transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-forest/50"
              >
                🎯 Redimir
              </button>
              <button
                onClick={() => onAddToWallet && onAddToWallet(coupon)}
                className="px-4 py-2 border border-forest text-forest rounded-lg hover:bg-forest/10 transition-colors focus:outline-none focus:ring-2 focus:ring-forest/50"
                aria-label="Añadir a wallet"
              >
                💳
              </button>
            </>
          ) : (
            <div className="flex-1 text-center py-2 text-gray-500">
              {isExpired ? 'Cupón expirado' : 'Cupón usado'}
            </div>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="px-4 pb-4">
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          canRedeem 
            ? 'bg-forest/10 text-forest' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            canRedeem ? 'bg-forest' : 'bg-gray-400'
          }`}></div>
          {getStatusText(coupon.status)}
        </div>
      </div>
    </div>
  );
};

export default CouponCard;
