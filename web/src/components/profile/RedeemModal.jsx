import React, { useState } from 'react';

const RedeemModal = ({ isOpen, onClose, onRedeem, coupon }) => {
  const [code, setCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');

  const handleRedeem = () => {
    if (!code.trim()) {
      setError('Por favor ingresa un código');
      return;
    }

    // Simulate validation
    if (code.toUpperCase() === coupon?.code) {
      onRedeem && onRedeem(coupon, code);
      onClose();
    } else {
      setError('Código inválido');
    }
  };

  const handleScan = () => {
    setIsScanning(true);
    // Simulate QR scanning
    setTimeout(() => {
      setIsScanning(false);
      setCode(coupon?.code || '');
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-gold to-ocobo rounded-full flex items-center justify-center mr-4">
            <span className="text-white text-xl">🎫</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral">Redimir Cupón</h3>
            <p className="text-sm text-gray-600">Ingresa el código o escanea el QR</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Manual Code Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código del cupón
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError('');
                }}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocobo/50 focus:border-ocobo font-mono"
                placeholder="ABC123"
                maxLength={8}
              />
              <button
                onClick={handleScan}
                disabled={isScanning}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {isScanning ? '📱' : '📷'}
              </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          {/* QR Scanner Placeholder */}
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-4xl mb-2">📱</div>
            <p className="text-sm text-gray-600 mb-2">Escáner QR</p>
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="px-4 py-2 bg-gradient-to-r from-ocobo to-gold text-white rounded-lg hover:shadow-glow-ocobo transition-all duration-200 disabled:opacity-50"
            >
              {isScanning ? 'Escaneando...' : 'Escanear QR'}
            </button>
          </div>

          {/* Coupon Preview */}
          {coupon && (
            <div className="bg-gradient-to-r from-forest/10 to-forest2/10 rounded-lg p-4 border border-forest/20">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-forest">{coupon.title}</h4>
                  <p className="text-sm text-gray-600">{coupon.agency}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-forest">
                    {coupon.discountType === 'percentage' ? `${coupon.discount}%` : `$${coupon.discount}`}
                  </div>
                  <div className="text-xs text-gray-500">descuento</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500/50"
          >
            Cancelar
          </button>
          <button
            onClick={handleRedeem}
            disabled={!code.trim()}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-forest to-forest2 text-white rounded-lg hover:shadow-glow-forest transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-forest/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🎯 Redimir
          </button>
        </div>
      </div>
    </div>
  );
};

export default RedeemModal;
