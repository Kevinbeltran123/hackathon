// Admin settings page
import React, { useState, useEffect } from 'react'

const Settings = () => {
  const [settings, setSettings] = useState({
    branding: {
      logo: '',
      emblema: '',
      primaryColor: '#E91E63',
      secondaryColor: '#F9A825',
      accentColor: '#0E3D2E'
    },
    i18n: {
      defaultLanguage: 'es',
      supportedLanguages: ['es', 'en'],
      texts: {
        appName: 'Rutas VIVAS',
        tagline: 'Explora la belleza de Ibagué',
        welcomeMessage: '¡Bienvenido a Rutas VIVAS!'
      }
    },
    features: {
      checkInRadius: 100,
      maxPhotoSize: 5,
      enableNotifications: true,
      enableGeolocation: true
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('branding')

  useEffect(() => {
    // Simulate loading settings
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const handleNestedSettingChange = (section, parentKey, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parentKey]: {
          ...prev[section][parentKey],
          [key]: value
        }
      }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    // Simulate saving
    setTimeout(() => {
      setSaving(false)
      // Show success message
    }, 2000)
  }

  const tabs = [
    { id: 'branding', name: 'Marca', icon: '🎨' },
    { id: 'i18n', name: 'Idiomas', icon: '🌍' },
    { id: 'features', name: 'Funciones', icon: '⚙️' },
    { id: 'security', name: 'Seguridad', icon: '🔒' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocobo mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-forest">Configuración del Sistema</h1>
          <p className="text-gray-600">Personaliza la apariencia y funcionalidades</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-gradient-to-r from-ocobo to-gold text-white rounded-lg font-semibold hover:shadow-glow-ocobo transition-all duration-200 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : '💾 Guardar Cambios'}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-ocobo text-ocobo'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-forest">Personalización de Marca</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo Principal
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-ocobo to-gold rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white text-2xl">🌸</span>
                    </div>
                    <p className="text-sm text-gray-600">Subir logo</p>
                    <input type="file" className="hidden" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emblema
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-forest to-forest2 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white text-2xl">🏛️</span>
                    </div>
                    <p className="text-sm text-gray-600">Subir emblema</p>
                    <input type="file" className="hidden" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Primario
                  </label>
                  <input
                    type="color"
                    value={settings.branding.primaryColor}
                    onChange={(e) => handleSettingChange('branding', 'primaryColor', e.target.value)}
                    className="w-full h-10 border border-gray-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Secundario
                  </label>
                  <input
                    type="color"
                    value={settings.branding.secondaryColor}
                    onChange={(e) => handleSettingChange('branding', 'secondaryColor', e.target.value)}
                    className="w-full h-10 border border-gray-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color de Acento
                  </label>
                  <input
                    type="color"
                    value={settings.branding.accentColor}
                    onChange={(e) => handleSettingChange('branding', 'accentColor', e.target.value)}
                    className="w-full h-10 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* i18n Tab */}
          {activeTab === 'i18n' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-forest">Configuración de Idiomas</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idioma Predeterminado
                </label>
                <select
                  value={settings.i18n.defaultLanguage}
                  onChange={(e) => handleSettingChange('i18n', 'defaultLanguage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocobo/50"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Textos de la Aplicación
                </label>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Nombre de la App</label>
                    <input
                      type="text"
                      value={settings.i18n.texts.appName}
                      onChange={(e) => handleNestedSettingChange('i18n', 'texts', 'appName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocobo/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Eslogan</label>
                    <input
                      type="text"
                      value={settings.i18n.texts.tagline}
                      onChange={(e) => handleNestedSettingChange('i18n', 'texts', 'tagline', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocobo/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Mensaje de Bienvenida</label>
                    <textarea
                      value={settings.i18n.texts.welcomeMessage}
                      onChange={(e) => handleNestedSettingChange('i18n', 'texts', 'welcomeMessage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocobo/50"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-forest">Configuración de Funciones</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Radio de Check-in (metros)
                  </label>
                  <input
                    type="number"
                    value={settings.features.checkInRadius}
                    onChange={(e) => handleSettingChange('features', 'checkInRadius', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocobo/50"
                    min="10"
                    max="500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tamaño Máximo de Foto (MB)
                  </label>
                  <input
                    type="number"
                    value={settings.features.maxPhotoSize}
                    onChange={(e) => handleSettingChange('features', 'maxPhotoSize', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocobo/50"
                    min="1"
                    max="20"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Notificaciones</label>
                      <p className="text-xs text-gray-500">Permitir notificaciones push</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.features.enableNotifications}
                      onChange={(e) => handleSettingChange('features', 'enableNotifications', e.target.checked)}
                      className="w-4 h-4 text-ocobo border-gray-300 rounded focus:ring-ocobo"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Geolocalización</label>
                      <p className="text-xs text-gray-500">Usar ubicación para check-ins</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.features.enableGeolocation}
                      onChange={(e) => handleSettingChange('features', 'enableGeolocation', e.target.checked)}
                      className="w-4 h-4 text-ocobo border-gray-300 rounded focus:ring-ocobo"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-forest">Configuración de Seguridad</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key para Backend
                  </label>
                  <input
                    type="password"
                    value="••••••••••••••••"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocobo/50"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Regenerar clave API</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Configuración de CORS
                  </label>
                  <input
                    type="text"
                    value="https://rutasvivas.com, https://app.rutasvivas.com"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocobo/50"
                    readOnly
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-yellow-600 text-lg mr-2">⚠️</span>
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Configuración Avanzada</h4>
                      <p className="text-xs text-yellow-700 mt-1">
                        Los cambios de seguridad requieren reiniciar el servidor
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
