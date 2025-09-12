import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../auth/AuthProvider';

const Coupons = () => {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [places, setPlaces] = useState([]);
  const [filter, setFilter] = useState('all');

  const [newCoupon, setNewCoupon] = useState({
    title: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_purchase_amount: '',
    place_id: '',
    usage_limit: '',
    valid_until: '',
    terms_conditions: ''
  });

  useEffect(() => {
    fetchCoupons();
    fetchPlaces();
  }, []);

  const fetchCoupons = async () => {
    // Mock data for demo
    setCoupons([
      {
        id: 'coupon-001',
        title: '20% OFF en Lechona Familiar',
        description: 'Descuento especial en porciones familiares de lechona auténtica',
        discount_type: 'percentage',
        discount_value: 20.0,
        min_purchase_amount: 50000,
        place_id: 101,
        place_name: 'La Lechona de la Abuela',
        usage_limit: 50,
        current_usage: 12,
        valid_until: '2024-12-31',
        is_active: 1,
        created_at: '2024-09-12'
      },
      {
        id: 'coupon-002',
        title: 'Café + Postre por $12.000',
        description: 'Combo especial: café de especialidad + postre tradicional',
        discount_type: 'fixed_amount',
        discount_value: 12000,
        min_purchase_amount: null,
        place_id: null,
        place_name: 'Todos los locales',
        usage_limit: 100,
        current_usage: 34,
        valid_until: '2024-12-31',
        is_active: 1,
        created_at: '2024-09-12'
      },
      {
        id: 'coupon-003',
        title: '2x1 en Jugos Naturales',
        description: 'Lleva 2 jugos naturales por el precio de 1',
        discount_type: '2x1',
        discount_value: null,
        min_purchase_amount: 15000,
        place_id: 102,
        place_name: 'El Fogón Tolimense',
        usage_limit: 30,
        current_usage: 8,
        valid_until: '2024-10-31',
        is_active: 1,
        created_at: '2024-09-12'
      },
      {
        id: 'coupon-004',
        title: 'Degustación Gratis',
        description: 'Degustación gratuita de nuestros cafés de origen',
        discount_type: 'free_item',
        discount_value: null,
        min_purchase_amount: null,
        place_id: 105,
        place_name: 'Café Cultural Gourmet',
        usage_limit: 20,
        current_usage: 15,
        valid_until: '2024-11-30',
        is_active: 1,
        created_at: '2024-09-12'
      }
    ]);
  };

  const fetchPlaces = async () => {
    // Mock places data
    setPlaces([
      { id: 101, name: 'La Lechona de la Abuela' },
      { id: 102, name: 'El Fogón Tolimense' },
      { id: 105, name: 'Café Cultural Gourmet' },
      { id: 129, name: 'Café de la Plaza' }
    ]);
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    
    // Simulate API call
    const coupon = {
      id: 'coupon-' + Date.now(),
      ...newCoupon,
      place_name: newCoupon.place_id ? places.find(p => p.id == newCoupon.place_id)?.name : 'Todos los locales',
      current_usage: 0,
      is_active: 1,
      created_at: new Date().toISOString().split('T')[0]
    };

    setCoupons([coupon, ...coupons]);
    setShowCreateModal(false);
    setNewCoupon({
      title: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_purchase_amount: '',
      place_id: '',
      usage_limit: '',
      valid_until: '',
      terms_conditions: ''
    });
  };

  const toggleCouponStatus = (couponId) => {
    setCoupons(coupons.map(coupon => 
      coupon.id === couponId 
        ? { ...coupon, is_active: coupon.is_active ? 0 : 1 }
        : coupon
    ));
  };

  const deleteCoupon = (couponId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cupón?')) {
      setCoupons(coupons.filter(coupon => coupon.id !== couponId));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getDiscountText = (coupon) => {
    switch (coupon.discount_type) {
      case 'percentage':
        return `${coupon.discount_value}% OFF`;
      case 'fixed_amount':
        return formatCurrency(coupon.discount_value);
      case '2x1':
        return '2x1';
      case 'free_item':
        return 'GRATIS';
      default:
        return 'Descuento';
    }
  };

  const getStatusColor = (coupon) => {
    if (!coupon.is_active) return 'bg-gray-500';
    if (coupon.usage_limit && coupon.current_usage >= coupon.usage_limit) return 'bg-red-500';
    if (new Date(coupon.valid_until) < new Date()) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusText = (coupon) => {
    if (!coupon.is_active) return 'Inactivo';
    if (coupon.usage_limit && coupon.current_usage >= coupon.usage_limit) return 'Agotado';
    if (new Date(coupon.valid_until) < new Date()) return 'Expirado';
    return 'Activo';
  };

  const filteredCoupons = coupons.filter(coupon => {
    switch (filter) {
      case 'active': return coupon.is_active && new Date(coupon.valid_until) >= new Date();
      case 'expired': return new Date(coupon.valid_until) < new Date();
      case 'inactive': return !coupon.is_active;
      default: return true;
    }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🎫 Gestión de Cupones</h1>
          <p className="text-gray-600 mt-1">Crea y administra ofertas para atraer más clientes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
        >
          ➕ Crear Cupón
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-xl">
          <div className="text-blue-600 text-2xl font-bold">{coupons.filter(c => c.is_active).length}</div>
          <div className="text-blue-800 text-sm font-medium">Cupones Activos</div>
        </div>
        <div className="bg-green-50 p-4 rounded-xl">
          <div className="text-green-600 text-2xl font-bold">{coupons.reduce((sum, c) => sum + c.current_usage, 0)}</div>
          <div className="text-green-800 text-sm font-medium">Usos Totales</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-xl">
          <div className="text-orange-600 text-2xl font-bold">{coupons.filter(c => new Date(c.valid_until) < new Date()).length}</div>
          <div className="text-orange-800 text-sm font-medium">Expirados</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl">
          <div className="text-purple-600 text-2xl font-bold">{Math.round((coupons.reduce((sum, c) => sum + c.current_usage, 0) / coupons.reduce((sum, c) => sum + (c.usage_limit || 100), 0)) * 100)}%</div>
          <div className="text-purple-800 text-sm font-medium">Tasa de Uso</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: 'Todos', count: coupons.length },
          { key: 'active', label: 'Activos', count: coupons.filter(c => c.is_active && new Date(c.valid_until) >= new Date()).length },
          { key: 'expired', label: 'Expirados', count: coupons.filter(c => new Date(c.valid_until) < new Date()).length },
          { key: 'inactive', label: 'Inactivos', count: coupons.filter(c => !c.is_active).length }
        ].map(filterOption => (
          <button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === filterOption.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filterOption.label} ({filterOption.count})
          </button>
        ))}
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCoupons.map((coupon) => (
          <motion.div
            key={coupon.id}
            whileHover={{ y: -4 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
          >
            {/* Coupon Header */}
            <div className={`${coupon.is_active ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-400'} p-4 text-white relative`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{coupon.title}</h3>
                  <p className="text-sm opacity-90">{coupon.place_name}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{getDiscountText(coupon)}</div>
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(coupon)} text-white`}>
                    {getStatusText(coupon)}
                  </div>
                </div>
              </div>
            </div>

            {/* Coupon Body */}
            <div className="p-4">
              <p className="text-gray-600 text-sm mb-4">{coupon.description}</p>
              
              <div className="space-y-2 text-sm mb-4">
                {coupon.min_purchase_amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Compra mínima:</span>
                    <span className="font-medium">{formatCurrency(coupon.min_purchase_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Válido hasta:</span>
                  <span className="font-medium">{new Date(coupon.valid_until).toLocaleDateString('es-ES')}</span>
                </div>
                {coupon.usage_limit && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Usos:</span>
                    <span className="font-medium">{coupon.current_usage} / {coupon.usage_limit}</span>
                  </div>
                )}
              </div>

              {/* Usage Progress */}
              {coupon.usage_limit && (
                <div className="mb-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(coupon.current_usage / coupon.usage_limit) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round((coupon.current_usage / coupon.usage_limit) * 100)}% utilizado
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => toggleCouponStatus(coupon.id)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    coupon.is_active
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {coupon.is_active ? '⏸️ Pausar' : '▶️ Activar'}
                </button>
                <button
                  onClick={() => setEditingCoupon(coupon)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteCoupon(coupon.id)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Coupon Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">🎫 Crear Nuevo Cupón</h2>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  <form onSubmit={handleCreateCoupon} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título del cupón *
                      </label>
                      <input
                        type="text"
                        required
                        value={newCoupon.title}
                        onChange={(e) => setNewCoupon({...newCoupon, title: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="ej: 20% OFF en Lechona"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        value={newCoupon.description}
                        onChange={(e) => setNewCoupon({...newCoupon, description: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Describe los detalles de la oferta..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de descuento
                        </label>
                        <select
                          value={newCoupon.discount_type}
                          onChange={(e) => setNewCoupon({...newCoupon, discount_type: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="percentage">Porcentaje (%)</option>
                          <option value="fixed_amount">Monto fijo ($)</option>
                          <option value="2x1">2x1</option>
                          <option value="free_item">Producto gratis</option>
                        </select>
                      </div>

                      {(newCoupon.discount_type === 'percentage' || newCoupon.discount_type === 'fixed_amount') && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Valor {newCoupon.discount_type === 'percentage' ? '(%)' : '($)'}
                          </label>
                          <input
                            type="number"
                            value={newCoupon.discount_value}
                            onChange={(e) => setNewCoupon({...newCoupon, discount_value: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder={newCoupon.discount_type === 'percentage' ? '20' : '10000'}
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Local aplicable
                        </label>
                        <select
                          value={newCoupon.place_id}
                          onChange={(e) => setNewCoupon({...newCoupon, place_id: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Todos los locales</option>
                          {places.map(place => (
                            <option key={place.id} value={place.id}>{place.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Límite de usos
                        </label>
                        <input
                          type="number"
                          value={newCoupon.usage_limit}
                          onChange={(e) => setNewCoupon({...newCoupon, usage_limit: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="50 (opcional)"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Compra mínima ($)
                        </label>
                        <input
                          type="number"
                          value={newCoupon.min_purchase_amount}
                          onChange={(e) => setNewCoupon({...newCoupon, min_purchase_amount: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="25000 (opcional)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Válido hasta *
                        </label>
                        <input
                          type="date"
                          required
                          value={newCoupon.valid_until}
                          onChange={(e) => setNewCoupon({...newCoupon, valid_until: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Términos y condiciones
                      </label>
                      <textarea
                        value={newCoupon.terms_conditions}
                        onChange={(e) => setNewCoupon({...newCoupon, terms_conditions: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        placeholder="Condiciones especiales, restricciones, etc..."
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg"
                      >
                        🎫 Crear Cupón
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Coupons;