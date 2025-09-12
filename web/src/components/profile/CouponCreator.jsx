import React, { useState } from 'react';

const CouponCreator = ({ onCreateCoupon }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount: '',
    discountType: 'percentage', // 'percentage' or 'fixed'
    expiryDate: '',
    terms: '',
    agency: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'El título es requerido';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    if (!formData.discount.trim()) newErrors.discount = 'El descuento es requerido';
    if (!formData.expiryDate) newErrors.expiryDate = 'La fecha de expiración es requerida';
    if (!formData.agency.trim()) newErrors.agency = 'La agencia es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const coupon = {
        id: `COUPON-${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'active',
        code: generateCouponCode(),
      };
      onCreateCoupon(coupon);
    }
  };

  const generateCouponCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-gold to-ocobo rounded-full flex items-center justify-center mr-4">
          <span className="text-white text-xl">🎫</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral">Crear Cupón</h3>
          <p className="text-sm text-gray-600">Genera un cupón para tus clientes</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título del cupón *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ocobo/50 ${
              errors.title ? 'border-red-500' : 'border-gray-200 focus:border-ocobo'
            }`}
            placeholder="Ej: 20% de descuento en restaurantes"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ocobo/50 resize-none ${
              errors.description ? 'border-red-500' : 'border-gray-200 focus:border-ocobo'
            }`}
            rows={3}
            placeholder="Describe los beneficios del cupón..."
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>

        {/* Discount */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descuento *
            </label>
            <input
              type="number"
              value={formData.discount}
              onChange={(e) => handleChange('discount', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ocobo/50 ${
                errors.discount ? 'border-red-500' : 'border-gray-200 focus:border-ocobo'
              }`}
              placeholder="20"
              min="1"
            />
            {errors.discount && <p className="text-red-500 text-xs mt-1">{errors.discount}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={formData.discountType}
              onChange={(e) => handleChange('discountType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocobo/50 focus:border-ocobo"
            >
              <option value="percentage">Porcentaje (%)</option>
              <option value="fixed">Valor fijo ($)</option>
            </select>
          </div>
        </div>

        {/* Agency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Agencia *
          </label>
          <input
            type="text"
            value={formData.agency}
            onChange={(e) => handleChange('agency', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ocobo/50 ${
              errors.agency ? 'border-red-500' : 'border-gray-200 focus:border-ocobo'
            }`}
            placeholder="Nombre de tu agencia"
          />
          {errors.agency && <p className="text-red-500 text-xs mt-1">{errors.agency}</p>}
        </div>

        {/* Expiry Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de expiración *
          </label>
          <input
            type="date"
            value={formData.expiryDate}
            onChange={(e) => handleChange('expiryDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ocobo/50 ${
              errors.expiryDate ? 'border-red-500' : 'border-gray-200 focus:border-ocobo'
            }`}
          />
          {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
        </div>

        {/* Terms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Términos y condiciones
          </label>
          <textarea
            value={formData.terms}
            onChange={(e) => handleChange('terms', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocobo/50 focus:border-ocobo resize-none"
            rows={2}
            placeholder="Términos específicos del cupón..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-ocobo to-gold text-white py-3 px-4 rounded-lg font-semibold hover:shadow-glow-ocobo transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ocobo/50"
        >
          🎫 Crear Cupón
        </button>
      </form>
    </div>
  );
};

export default CouponCreator;
