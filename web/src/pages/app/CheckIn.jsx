// Rediseñado: Check-in Inteligente para Turismo - 3 pasos
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../auth/AuthProvider'

const CheckIn = () => {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [location, setLocation] = useState(null)
  const [isValidatingLocation, setIsValidatingLocation] = useState(false)
  const [placeData, setPlaceData] = useState(null)
  const [rewards, setRewards] = useState(null)
  const [toast, setToast] = useState({ isVisible: false, type: 'success', title: '', message: '' })

  // Nuevo sistema de pasos - Solo 3 pasos
  const steps = [
    { id: 1, title: 'Elegir Lugar', subtitle: 'Descubre Ibagué', icon: '🗺️' },
    { id: 2, title: 'Validar', subtitle: 'Confirma tu ubicación', icon: '📍' },
    { id: 3, title: 'Obtener Recompensa', subtitle: '¡Gana puntos y descubre!', icon: '🎯' },
  ]

  // Lugares con datos turísticos enriquecidos
  const places = [
    {
      id: 1,
      name: 'Conservatorio del Tolima',
      barrio: 'Centro',
      category: 'cultura',
      tags: ['cultura', 'música', 'historia'],
      distance: 250,
      verified: true,
      occupancy: 'Tranquilo',
      avgVisitTime: '45 min',
      bestTimeToVisit: 'Mañana',
      currentWeather: '24°C Soleado',
      funFact: 'Fundado en 1906, es uno de los conservatorios más antiguos de Colombia',
      instagramSpot: 'Escaleras principales con vitrales coloniales',
      basePoints: 50,
      multiplier: isWeekend() ? 1.5 : 1.0,
      specialBonus: getCurrentHourBonus(),
      achievements: ['Primera Visita Cultural', 'Amante de la Música'],
      discounts: [
        { business: 'Café Cultural', discount: '10% off', validUntil: '6pm' }
      ]
    },
    {
      id: 2,
      name: 'Jardín Botánico San Jorge',
      barrio: 'Belén',
      category: 'naturaleza',
      tags: ['naturaleza', 'jardín', 'fotografía'],
      distance: 1200,
      verified: true,
      occupancy: 'Moderado',
      avgVisitTime: '1.5 hrs',
      bestTimeToVisit: 'Tarde',
      currentWeather: '22°C Parcialmente nublado',
      funFact: 'Hogar de más de 200 especies de plantas nativas del Tolima',
      instagramSpot: 'Mariposario central con luz natural',
      basePoints: 75,
      multiplier: isEarlyBird() ? 2.0 : 1.0,
      specialBonus: getWeatherBonus(),
      achievements: ['Explorador Verde', 'Fotógrafo Naturalista'],
      discounts: [
        { business: 'EcoTienda', discount: '15% off', validUntil: '8pm' }
      ]
    },
    {
      id: 3,
      name: 'Restaurante La Pola',
      barrio: 'La Pola',
      category: 'gastro',
      tags: ['gastro', 'restaurante', 'típico'],
      distance: 800,
      verified: true,
      occupancy: 'Lleno',
      avgVisitTime: '1 hr',
      bestTimeToVisit: 'Noche',
      currentWeather: '25°C Ambiente perfecto',
      funFact: 'Especialistas en tamales tolimenses desde 1987',
      instagramSpot: 'Mesa del rincón con decoración típica',
      basePoints: 60,
      multiplier: isHappyHour() ? 1.3 : 1.0,
      specialBonus: getFoodieBonus(),
      achievements: ['Foodie Tolimense', 'Rey del Tamal'],
      discounts: [
        { business: 'La Pola', discount: 'Postre gratis', validUntil: '10pm' }
      ]
    },
    {
      id: 4,
      name: 'Mirador de La Martinica',
      barrio: 'La Martinica',
      category: 'naturaleza',
      tags: ['naturaleza', 'mirador', 'aventura'],
      distance: 2500,
      verified: true,
      occupancy: 'Tranquilo',
      avgVisitTime: '2 hrs',
      bestTimeToVisit: 'Atardecer',
      currentWeather: '20°C Viento suave',
      funFact: 'Vista panorámica de 360° de Ibagué y la Cordillera Central',
      instagramSpot: 'Deck de madera con vista al volcán Nevado del Tolima',
      basePoints: 100,
      multiplier: isSunsetTime() ? 2.5 : 1.0,
      specialBonus: getAdventureBonus(),
      achievements: ['Aventurero de Altura', 'Conquistador de Montañas'],
      discounts: [
        { business: 'Café Mirador', discount: '20% off bebidas calientes', validUntil: '7pm' }
      ]
    },
    {
      id: 5,
      name: 'Casa de la Cultura',
      barrio: 'Centro',
      category: 'cultura',
      tags: ['cultura', 'arte', 'exposiciones'],
      distance: 350,
      verified: true,
      occupancy: 'Tranquilo',
      avgVisitTime: '1 hr',
      bestTimeToVisit: 'Cualquier momento',
      currentWeather: '24°C Interior climatizado',
      funFact: 'Exposiciones rotativas de artistas locales cada mes',
      instagramSpot: 'Patio central con murales de arte urbano',
      basePoints: 55,
      multiplier: hasCurrentExhibition() ? 1.8 : 1.0,
      specialBonus: getCultureBonus(),
      achievements: ['Crítico de Arte', 'Mecenas Cultural'],
      discounts: [
        { business: 'Librería Cultural', discount: '12% off', validUntil: '6pm' }
      ]
    }
  ]

  // Funciones auxiliares para bonificaciones dinámicas
  function isWeekend() {
    const day = new Date().getDay()
    return day === 0 || day === 6
  }

  function isEarlyBird() {
    const hour = new Date().getHours()
    return hour >= 6 && hour <= 9
  }

  function isHappyHour() {
    const hour = new Date().getHours()
    return hour >= 17 && hour <= 19
  }

  function isSunsetTime() {
    const hour = new Date().getHours()
    return hour >= 16 && hour <= 18
  }

  function hasCurrentExhibition() {
    return Math.random() > 0.3 // 70% probabilidad de tener exposición
  }

  function getCurrentHourBonus() {
    const hour = new Date().getHours()
    if (hour >= 10 && hour <= 14) return 'Horario tranquilo: +10 puntos'
    if (hour >= 15 && hour <= 17) return 'Horario ideal: +5 puntos'
    return null
  }

  function getWeatherBonus() {
    return 'Día perfecto para naturaleza: +15 puntos'
  }

  function getFoodieBonus() {
    return 'Experiencia gastronómica: +20 puntos'
  }

  function getAdventureBonus() {
    return 'Espíritu aventurero: +25 puntos'
  }

  function getCultureBonus() {
    return 'Enriquecimiento cultural: +12 puntos'
  }

  // Sistema de geolocalización mejorado
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
        },
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutos
        }
      )
    })
  }

  // Validación inteligente de ubicación
  const validateLocation = async (place) => {
    setIsValidatingLocation(true)
    
    try {
      const userLocation = await getCurrentLocation()
      setLocation(userLocation)

      // Simular validación de distancia (en app real, usar API)
      const isWithinRange = place.distance <= 500 // 500 metros
      
      if (!isWithinRange) {
        setToast({
          isVisible: true,
          type: 'error',
          title: 'Muy lejos del lugar',
          message: `Debes estar a menos de 500m de ${place.name} para hacer check-in`
        })
        setIsValidatingLocation(false)
        return false
      }

      // Cargar datos enriquecidos del lugar
      const enrichedPlaceData = {
        ...place,
        checkedAt: new Date().toLocaleTimeString('es-CO'),
        weather: place.currentWeather,
        crowdLevel: place.occupancy,
        isFirstVisitToday: Math.random() > 0.7, // 30% probabilidad
        socialActivity: {
          friendsNearby: Math.floor(Math.random() * 3),
          recentVisitors: Math.floor(Math.random() * 10) + 1
        }
      }

      setPlaceData(enrichedPlaceData)
      setIsValidatingLocation(false)
      return true

    } catch (error) {
      setToast({
        isVisible: true,
        type: 'error',
        title: 'Error de ubicación',
        message: 'No se pudo obtener tu ubicación. Verifica que tengas GPS activado.'
      })
      setIsValidatingLocation(false)
      return false
    }
  }

  // Cálculo de recompensas dinámicas
  const calculateRewards = (place) => {
    let totalPoints = place.basePoints
    let bonuses = []
    let achievements = []

    // Aplicar multiplicadores
    totalPoints = Math.floor(totalPoints * place.multiplier)

    // Bonos especiales
    if (place.specialBonus) {
      const bonusPoints = parseInt(place.specialBonus.match(/\d+/)?.[0] || '0')
      totalPoints += bonusPoints
      bonuses.push(place.specialBonus)
    }

    // Primer visitante del día
    if (placeData?.isFirstVisitToday) {
      totalPoints *= 2
      bonuses.push('¡Primer visitante del día! Puntos x2')
      achievements.push('Madrugador')
    }

    // Bono por amigos cercanos
    if (placeData?.socialActivity.friendsNearby > 0) {
      const socialBonus = placeData.socialActivity.friendsNearby * 5
      totalPoints += socialBonus
      bonuses.push(`${placeData.socialActivity.friendsNearby} amigos cerca: +${socialBonus} puntos`)
    }

    return {
      totalPoints,
      basePoints: place.basePoints,
      multiplier: place.multiplier,
      bonuses,
      newAchievements: achievements,
      nextSuggestions: getNextSuggestions(place)
    }
  }

  // Sugerencias inteligentes de próximo destino
  const getNextSuggestions = (currentPlace) => {
    return places
      .filter(p => p.id !== currentPlace.id)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 2)
      .map(place => ({
        ...place,
        reason: getSuggestionReason(place, currentPlace)
      }))
  }

  const getSuggestionReason = (nextPlace, currentPlace) => {
    if (nextPlace.category === currentPlace.category) {
      return `Continúa tu ruta ${currentPlace.category === 'cultura' ? 'cultural' : 
                                currentPlace.category === 'gastro' ? 'gastronómica' : 
                                'de naturaleza'}`
    }
    if (nextPlace.distance < 1000) {
      return 'Muy cerca de tu ubicación actual'
    }
    return 'Experiencia complementaria recomendada'
  }

  // Handlers de los pasos
  const handlePlaceSelect = (place) => {
    setSelectedPlace(place)
    setCurrentStep(2)
  }

  const handleValidation = async () => {
    if (!selectedPlace) return

    const isValid = await validateLocation(selectedPlace)
    if (isValid) {
      const rewardData = calculateRewards(selectedPlace)
      setRewards(rewardData)
      setCurrentStep(3)
    }
  }

  const handleConfirmCheckIn = async () => {
    if (!user?.id || !selectedPlace || !rewards) return

    try {
      // Simular API call para guardar check-in
      const checkInData = {
        user_id: user.id,
        place_id: selectedPlace.id,
        location: location,
        points_earned: rewards.totalPoints,
        achievements: rewards.newAchievements,
        checked_at: new Date().toISOString()
      }

      // Simular guardado
      console.log('Check-in guardado:', checkInData)

      setToast({
        isVisible: true,
        type: 'success',
        title: `¡Check-in exitoso en ${selectedPlace.name}!`,
        message: `Has ganado ${rewards.totalPoints} puntos 🎯`
      })

      // Reset después de 3 segundos
      setTimeout(() => {
        setCurrentStep(1)
        setSelectedPlace(null)
        setPlaceData(null)
        setRewards(null)
        setLocation(null)
      }, 3000)

    } catch (error) {
      setToast({
        isVisible: true,
        type: 'error',
        title: 'Error al hacer check-in',
        message: 'Intenta nuevamente en unos momentos'
      })
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      cultura: 'from-purple-500 to-pink-500',
      naturaleza: 'from-green-500 to-emerald-500',
      gastro: 'from-orange-500 to-red-500',
      aventura: 'from-blue-500 to-cyan-500'
    }
    return colors[category] || 'from-gray-500 to-gray-600'
  }

  const getCategoryIcon = (category) => {
    const icons = {
      cultura: '🏛️',
      naturaleza: '🌿',
      gastro: '🍽️',
      aventura: '🏔️'
    }
    return icons[category] || '📍'
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header con diseño turístico */}
        <div className="text-center bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Check-in Inteligente
          </h1>
          <p className="text-gray-600 text-lg">
            Explora Ibagué, gana puntos y descubre experiencias únicas
          </p>
        </div>

        {/* Stepper Progress - Rediseñado */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="flex items-center justify-between relative">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center relative z-10">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-500 ${
                    currentStep >= step.id 
                      ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg scale-110' 
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step.id ? '✓' : step.icon}
                </div>
                <div className="mt-2 text-center">
                  <p className={`font-semibold text-sm ${currentStep >= step.id ? 'text-emerald-600' : 'text-gray-500'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.subtitle}</p>
                </div>
                
                {/* Línea conectora */}
                {index < steps.length - 1 && (
                  <div className={`absolute top-6 left-12 w-full h-0.5 transition-all duration-500 ${
                    currentStep > step.id ? 'bg-gradient-to-r from-emerald-500 to-blue-500' : 'bg-gray-300'
                  }`} style={{ width: 'calc(100vw / 3 - 3rem)' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contenido del Paso Actual */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              🗺️ ¿Dónde te encuentras?
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              {places.map((place) => (
                <div
                  key={place.id}
                  onClick={() => handlePlaceSelect(place)}
                  className="bg-white/90 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-white/20 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getCategoryColor(place.category)} flex items-center justify-center text-white text-xl shadow-lg`}>
                        {getCategoryIcon(place.category)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">
                          {place.name}
                        </h3>
                        <p className="text-sm text-gray-600">{place.barrio}</p>
                      </div>
                    </div>
                    {place.verified && (
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                        ✓ Verificado
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">📍 Distancia:</span>
                      <span className="font-semibold">{place.distance}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">👥 Ocupación:</span>
                      <span className={`font-semibold ${
                        place.occupancy === 'Tranquilo' ? 'text-green-600' :
                        place.occupancy === 'Moderado' ? 'text-yellow-600' : 'text-red-600'
                      }`}>{place.occupancy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">⏱️ Visita típica:</span>
                      <span className="font-semibold">{place.avgVisitTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">🎯 Puntos base:</span>
                      <span className="font-bold text-emerald-600">{place.basePoints} pts</span>
                    </div>
                  </div>

                  {place.specialBonus && (
                    <div className="mt-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-2">
                      <p className="text-xs text-orange-800 font-semibold">⚡ {place.specialBonus}</p>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 italic">{place.funFact}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 2 && selectedPlace && (
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getCategoryColor(selectedPlace.category)} flex items-center justify-center text-white text-2xl shadow-lg mx-auto mb-4`}>
                {getCategoryIcon(selectedPlace.category)}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                📍 Validando ubicación en
              </h2>
              <h3 className="text-xl font-semibold text-emerald-600">
                {selectedPlace.name}
              </h3>
            </div>

            {/* Información en tiempo real del lugar */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    🌍 Información en tiempo real
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>🌤️ Clima actual:</span>
                      <span className="font-semibold">{selectedPlace.currentWeather}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>👥 Nivel de ocupación:</span>
                      <span className={`font-semibold ${
                        selectedPlace.occupancy === 'Tranquilo' ? 'text-green-600' :
                        selectedPlace.occupancy === 'Moderado' ? 'text-yellow-600' : 'text-red-600'
                      }`}>{selectedPlace.occupancy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>⏰ Mejor momento:</span>
                      <span className="font-semibold">{selectedPlace.bestTimeToVisit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>⏱️ Tiempo promedio:</span>
                      <span className="font-semibold">{selectedPlace.avgVisitTime}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                    📸 Spot para Instagram
                  </h4>
                  <p className="text-sm text-gray-700">{selectedPlace.instagramSpot}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    🎯 Recompensas disponibles
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>💰 Puntos base:</span>
                      <span className="font-bold text-emerald-600">{selectedPlace.basePoints} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span>✨ Multiplicador:</span>
                      <span className="font-bold text-purple-600">x{selectedPlace.multiplier}</span>
                    </div>
                    {selectedPlace.specialBonus && (
                      <div className="bg-yellow-100 rounded-lg p-2 mt-2">
                        <span className="text-xs text-orange-800 font-semibold">
                          ⚡ {selectedPlace.specialBonus}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                    🎁 Descuentos exclusivos
                  </h4>
                  {selectedPlace.discounts.map((discount, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-semibold text-orange-600">{discount.business}:</span>
                      <span className="text-gray-700"> {discount.discount}</span>
                      <span className="text-xs text-gray-500"> (válido hasta {discount.validUntil})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dato curioso */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                💡 ¿Sabías que...?
              </h4>
              <p className="text-sm text-gray-700 italic">{selectedPlace.funFact}</p>
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 flex-1"
              >
                ← Cambiar lugar
              </button>
              <button
                onClick={handleValidation}
                disabled={isValidatingLocation}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 flex-1 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isValidatingLocation ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Validando ubicación...</span>
                  </>
                ) : (
                  <>
                    <span>📍</span>
                    <span>Confirmar ubicación</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && rewards && placeData && (
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white text-3xl shadow-lg mx-auto mb-4 animate-pulse">
                🎉
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
                ¡Check-in Exitoso!
              </h2>
              <p className="text-gray-600">Has llegado a {selectedPlace.name}</p>
            </div>

            {/* Resumen de recompensas */}
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                🎯 Tus Recompensas
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-600 mb-1">
                        {rewards.totalPoints}
                      </div>
                      <div className="text-sm text-gray-600">Puntos Totales</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <h4 className="font-semibold text-gray-800 mb-3">💰 Desglose de puntos:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Puntos base:</span>
                        <span className="font-semibold">{rewards.basePoints}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Multiplicador:</span>
                        <span className="font-semibold text-purple-600">x{rewards.multiplier}</span>
                      </div>
                      {rewards.bonuses.map((bonus, index) => (
                        <div key={index} className="text-xs text-green-600 font-medium">
                          ✨ {bonus}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {rewards.newAchievements.length > 0 && (
                    <div className="bg-white rounded-xl p-4 shadow-md">
                      <h4 className="font-semibold text-gray-800 mb-3">🏆 Nuevos Logros:</h4>
                      {rewards.newAchievements.map((achievement, index) => (
                        <div key={index} className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-2 mb-2">
                          <span className="text-sm font-semibold text-orange-800">
                            🎖️ {achievement}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <h4 className="font-semibold text-gray-800 mb-3">📊 Actividad Social:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>👥 Amigos cerca:</span>
                        <span className="font-semibold">{placeData.socialActivity.friendsNearby}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>👋 Visitantes recientes:</span>
                        <span className="font-semibold">{placeData.socialActivity.recentVisitors}</span>
                      </div>
                      {placeData.isFirstVisitToday && (
                        <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg p-2 mt-2">
                          <span className="text-xs font-semibold text-blue-800">
                            🌅 ¡Primer visitante del día!
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sugerencias de próximo destino */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                🚀 Tu próxima aventura
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {rewards.nextSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getCategoryColor(suggestion.category)} flex items-center justify-center text-white`}>
                        {getCategoryIcon(suggestion.category)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{suggestion.name}</h4>
                        <p className="text-sm text-gray-600">{suggestion.distance}m de distancia</p>
                      </div>
                    </div>
                    <p className="text-xs text-purple-600 font-medium">{suggestion.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Descuentos disponibles */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">🎁 Descuentos desbloqueados</h3>
              {selectedPlace.discounts.map((discount, index) => (
                <div key={index} className="bg-white rounded-lg p-3 mb-2 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-orange-600">{discount.business}</span>
                      <p className="text-sm text-gray-700">{discount.discount}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      Válido hasta {discount.validUntil}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Botón de confirmar */}
            <div className="text-center">
              <button
                onClick={handleConfirmCheckIn}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:shadow-xl transition-all duration-300 text-lg font-semibold flex items-center justify-center space-x-2 mx-auto"
              >
                <span>🎯</span>
                <span>Finalizar Check-in</span>
              </button>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast.isVisible && (
          <div className="fixed top-20 right-4 z-[9999] max-w-sm">
            <div className={`rounded-xl p-4 shadow-2xl border backdrop-blur-lg ${
              toast.type === 'success' 
                ? 'bg-green-50/90 border-green-200 text-green-800' 
                : 'bg-red-50/90 border-red-200 text-red-800'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{toast.title}</h4>
                  <p className="text-sm mt-1">{toast.message}</p>
                </div>
                <button
                  onClick={hideToast}
                  className="text-gray-400 hover:text-gray-600 ml-4"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckIn