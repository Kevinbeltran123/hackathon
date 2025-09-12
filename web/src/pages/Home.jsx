import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePrefs } from '../store/store.js'

export default function Home(){
  const nav = useNavigate()
  const { prefs, setPrefs } = usePrefs()
  const [local, setLocal] = useState(prefs)

  function createRoute(){
    setPrefs(local)
    nav('/explore')
  }

  const interestOptions = [
    { id: 'cultura', name: 'Cultura', icon: '🏛️', color: 'from-purple-500 to-purple-600' },
    { id: 'gastro', name: 'Gastronomía', icon: '🍽️', color: 'from-red-500 to-red-600' },
    { id: 'artesania', name: 'Artesanía', icon: '🎨', color: 'from-orange-500 to-orange-600' },
    { id: 'naturaleza', name: 'Naturaleza', icon: '🌿', color: 'from-green-500 to-green-600' },
    { id: 'musica', name: 'Música', icon: '🎵', color: 'from-pink-500 to-pink-600' }
  ]

  const timeOptions = [
    { value: 120, label: '2 horas', icon: '⏰' },
    { value: 180, label: '3 horas', icon: '🕐' },
    { value: 240, label: '4 horas', icon: '🕑' },
    { value: 480, label: 'Día completo', icon: '🌅' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-green/10 to-brand-blue/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-brand-green to-brand-blue rounded-full mb-6 float">
              <span className="text-4xl">🌸</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Crea tu día perfecto en <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-brand-blue">Ibagué</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre rutas dinámicas con micro‑actividades cercanas para apoyar el comercio local y vivir experiencias únicas en la ciudad.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="card-hover">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-brand-green to-brand-blue rounded-xl flex items-center justify-center mr-4">
                <span className="text-2xl">⚙️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Personaliza tu experiencia</h2>
            </div>

            {/* Time Selection */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-700 mb-4">⏱️ Tiempo disponible</label>
              <div className="grid grid-cols-2 gap-3">
                {timeOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setLocal({...local, time: option.value})}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      local.time === option.value
                        ? 'border-brand-green bg-brand-green/10 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-brand-green hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="font-semibold text-gray-900">{option.label}</div>
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <input 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all duration-200" 
                  type="number" 
                  min="60" 
                  max="480" 
                  value={local.time} 
                  onChange={e => setLocal({...local, time: Number(e.target.value)})}
                  placeholder="Tiempo personalizado (minutos)"
                />
              </div>
            </div>

            {/* Interests Selection */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-700 mb-4">❤️ Tus intereses</label>
              <div className="grid grid-cols-2 gap-3">
                {interestOptions.map(option => {
                  const isSelected = local.tags.includes(option.id)
                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        const has = local.tags.includes(option.id)
                        setLocal({
                          ...local, 
                          tags: has ? local.tags.filter(x => x !== option.id) : [...local.tags, option.id]
                        })
                      }}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-brand-green bg-brand-green/10 shadow-lg scale-105'
                          : 'border-gray-200 hover:border-brand-green hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-2xl mb-2">{option.icon}</div>
                      <div className="font-semibold text-gray-900">{option.name}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Walking Radius */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-700 mb-4">🚶 Radio de caminata máximo</label>
              <div className="relative">
                <input 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all duration-200" 
                  type="number" 
                  min="400" 
                  max="2500" 
                  step="100" 
                  value={local.radius} 
                  onChange={e => setLocal({...local, radius: Number(e.target.value)})}
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">metros</span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Distancia máxima: {(local.radius / 1000).toFixed(1)} km
              </div>
            </div>

            {/* Create Route Button */}
            <button 
              onClick={createRoute} 
              className="w-full btn-primary text-lg py-4 pulse-glow"
            >
              🌟 Crear mi ruta personalizada
            </button>
          </div>

          {/* How it Works Panel */}
          <div className="card-hover">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-brand-amber to-orange-500 rounded-xl flex items-center justify-center mr-4">
                <span className="text-2xl">💡</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">¿Cómo funciona?</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-brand-green to-brand-blue rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Ingresa tus preferencias</h3>
                  <p className="text-gray-600">Selecciona tu tiempo disponible, intereses y radio de caminata para personalizar tu experiencia.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-brand-green to-brand-blue rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Te sugerimos una ruta base</h3>
                  <p className="text-gray-600">Nuestro algoritmo inteligente crea una ruta optimizada cerca de tu ubicación.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-brand-green to-brand-blue rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Añade micro‑actividades</h3>
                  <p className="text-gray-600">Con <strong>"Añadir algo cerca"</strong> inserta actividades de 10–30 min en tiempo real.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-brand-green to-brand-blue rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Escanea QR en comercios</h3>
                  <p className="text-gray-600">Suma comercios locales al instante escaneando códigos QR para apoyar la economía local.</p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mt-8 p-6 bg-gradient-to-r from-brand-green/5 to-brand-blue/5 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-4">✨ Características especiales</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Rutas en tiempo real</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Comercio local</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Navegación offline</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>QR instantáneo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
