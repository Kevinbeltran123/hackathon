import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../auth/AuthProvider';

const Settings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    businessName: 'Grupo Gastronómico Tolimense',
    contactEmail: user?.email || 'empresario@demo.com',
    contactPhone: '+57 310 987 6543',
    businessType: 'restaurant',
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      newCheckins: true,
      couponUsage: true,
      reviews: true,
      analytics: false
    },
    businessHours: {
      monday: { open: '08:00', close: '20:00', closed: false },
      tuesday: { open: '08:00', close: '20:00', closed: false },
      wednesday: { open: '08:00', close: '20:00', closed: false },
      thursday: { open: '08:00', close: '20:00', closed: false },
      friday: { open: '08:00', close: '22:00', closed: false },
      saturday: { open: '09:00', close: '22:00', closed: false },
      sunday: { open: '10:00', close: '18:00', closed: false }
    },
    socialMedia: {
      instagram: '@tolimense_group',
      facebook: 'GrupoGastronomicoTolimense',
      whatsapp: '+57 310 987 6543'
    }
  });

  const handleSaveSettings = () => {
    // Simulate API call
    console.log('Saving settings:', settings);
    alert('Configuración guardada correctamente');
  };

  const updateNotification = (key, value) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value
      }
    });
  };

  const updateBusinessHours = (day, field, value) => {
    setSettings({
      ...settings,
      businessHours: {
        ...settings.businessHours,
        [day]: {
          ...settings.businessHours[day],
          [field]: value
        }
      }
    });
  };

  const updateSocialMedia = (platform, value) => {
    setSettings({
      ...settings,
      socialMedia: {
        ...settings.socialMedia,
        [platform]: value
      }
    });
  };

  const days = [
    { key: 'monday', label: 'Lunes' },
    { key: 'tuesday', label: 'Martes' },
    { key: 'wednesday', label: 'Miércoles' },
    { key: 'thursday', label: 'Jueves' },
    { key: 'friday', label: 'Viernes' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">⚙️ Configuración</h1>
        <p className="text-gray-600">Personaliza tu perfil empresarial y preferencias</p>
      </div>

      <div className="space-y-8">
        
        {/* Business Profile */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            🏢 Perfil del Negocio
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del negocio
              </label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => setSettings({...settings, businessName: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de negocio
              </label>
              <select
                value={settings.businessType}
                onChange={(e) => setSettings({...settings, businessType: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="restaurant">Restaurante</option>
                <option value="cafe">Café</option>
                <option value="hotel">Hotel</option>
                <option value="store">Tienda</option>
                <option value="tourism">Turismo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de contacto
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono de contacto
              </label>
              <input
                type="tel"
                value={settings.contactPhone}
                onChange={(e) => setSettings({...settings, contactPhone: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            🔔 Notificaciones
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Notificaciones por email</h3>
                <p className="text-sm text-gray-600">Recibe resúmenes diarios por email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.emailNotifications}
                  onChange={(e) => updateNotification('emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Nuevos check-ins</h3>
                <p className="text-sm text-gray-600">Cuando alguien visita tus locales</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.newCheckins}
                  onChange={(e) => updateNotification('newCheckins', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Uso de cupones</h3>
                <p className="text-sm text-gray-600">Cuando alguien usa tus cupones</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.couponUsage}
                  onChange={(e) => updateNotification('couponUsage', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Nuevas reseñas</h3>
                <p className="text-sm text-gray-600">Cuando recibas nuevas reseñas</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.reviews}
                  onChange={(e) => updateNotification('reviews', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Business Hours */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            🕐 Horarios de Atención
          </h2>
          <div className="space-y-4">
            {days.map(day => (
              <div key={day.key} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-20 font-medium text-gray-700">{day.label}</div>
                <div className="flex items-center gap-4 flex-1">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.businessHours[day.key].closed}
                      onChange={(e) => updateBusinessHours(day.key, 'closed', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">Cerrado</span>
                  </label>
                  {!settings.businessHours[day.key].closed && (
                    <>
                      <input
                        type="time"
                        value={settings.businessHours[day.key].open}
                        onChange={(e) => updateBusinessHours(day.key, 'open', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <span className="text-gray-500">a</span>
                      <input
                        type="time"
                        value={settings.businessHours[day.key].close}
                        onChange={(e) => updateBusinessHours(day.key, 'close', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Social Media */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            📱 Redes Sociales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📷 Instagram
              </label>
              <input
                type="text"
                value={settings.socialMedia.instagram}
                onChange={(e) => updateSocialMedia('instagram', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="@tu_usuario"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📘 Facebook
              </label>
              <input
                type="text"
                value={settings.socialMedia.facebook}
                onChange={(e) => updateSocialMedia('facebook', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="TuPaginaFacebook"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                💬 WhatsApp
              </label>
              <input
                type="tel"
                value={settings.socialMedia.whatsapp}
                onChange={(e) => updateSocialMedia('whatsapp', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="+57 300 123 4567"
              />
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveSettings}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            💾 Guardar Configuración
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Settings;