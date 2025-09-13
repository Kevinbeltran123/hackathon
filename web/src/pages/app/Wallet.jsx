// Rediseñado: Smart Wallet Turística Gamificada
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../auth/AuthProvider'
import TourGuideChat from '../../components/TourGuideChat'

const Wallet = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('cupones')
  const [coupons, setCoupons] = useState([])
  const [userPoints, setUserPoints] = useState(0)
  const [userLevel, setUserLevel] = useState({ level: 1, name: 'Explorador Novato', progress: 65, nextLevel: 'Turista Experimentado' })
  const [achievements, setAchievements] = useState([])
  const [experiences, setExperiences] = useState([])
  const [collections, setCollections] = useState([])
  const [socialActivity, setSocialActivity] = useState([])
  const [dailySpinUsed, setDailySpinUsed] = useState(false)
  const [streak, setStreak] = useState(5)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ isVisible: false, type: 'success', title: '', message: '' })
  const [showSpinModal, setShowSpinModal] = useState(false)
  const [showExperienceModal, setShowExperienceModal] = useState(false)
  const [selectedExperience, setSelectedExperience] = useState(null)
  const [location, setLocation] = useState(null)

  // Tabs configuration
  const tabs = [
    { id: 'cupones', name: 'Mis Cupones', icon: '🎫' },
    { id: 'marketplace', name: 'Marketplace', icon: '🛍️' },
    { id: 'colecciones', name: 'Colecciones', icon: '🎖️' },
    { id: 'social', name: 'Social', icon: '👥' },
    { id: 'estadisticas', name: 'Stats', icon: '📊' }
  ]

  // Mock data initialization
  useEffect(() => {
    const initializeWalletData = () => {
      // User points and level
      setUserPoints(2450)
      
      // Enhanced coupons with rarity system
      const mockCoupons = [
        {
          id: 'COUPON_001',
          title: 'Café Gratis en La Pola',
          description: 'Café colombiano premium + postre',
          discount: 100,
          discountType: 'fixed',
          value: '$12.000',
          business: 'Restaurante La Pola',
          category: 'gastro',
          rarity: 'epic',
          rarityColor: 'from-purple-500 to-pink-500',
          expiryDate: '2024-12-31',
          timeLimit: null,
          status: 'active',
          code: 'LAPOLA001',
          earnedFrom: 'Check-in Ruta Gastronómica',
          earnedDate: '2024-01-15T10:00:00Z',
          location: { lat: 4.4389, lng: -75.2322 },
          distance: 150,
          isProximity: true,
          socialBonus: false,
          isLimited: false,
          usageCount: 0,
          maxUsage: 1,
          tags: ['premium', 'gastronomía', 'centro'],
          restrictions: 'Solo almuerzo 12pm-3pm'
        },
        {
          id: 'COUPON_002', 
          title: '50% OFF Tour Guiado Conservatorio',
          description: 'Tour privado con historia musical',
          discount: 50,
          discountType: 'percentage',
          value: '$25.000',
          business: 'Conservatorio del Tolima',
          category: 'cultura',
          rarity: 'legendary',
          rarityColor: 'from-yellow-400 to-orange-500',
          expiryDate: '2024-06-30',
          timeLimit: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas
          status: 'active',
          code: 'CONSERV50',
          earnedFrom: 'Primer visitante del día',
          earnedDate: '2024-01-20T08:30:00Z',
          location: { lat: 4.4381, lng: -75.2317 },
          distance: 230,
          isProximity: true,
          socialBonus: true,
          isLimited: true,
          usageCount: 0,
          maxUsage: 1,
          tags: ['exclusivo', 'cultura', 'historia'],
          restrictions: 'Reserva previa requerida'
        },
        {
          id: 'COUPON_003',
          title: 'Artesanías Típicas 30% OFF',
          description: 'Productos locales auténticos',
          discount: 30,
          discountType: 'percentage', 
          value: 'Variable',
          business: 'Mercado Artesanal',
          category: 'shopping',
          rarity: 'rare',
          rarityColor: 'from-blue-500 to-cyan-500',
          expiryDate: '2024-03-15',
          timeLimit: null,
          status: 'used',
          code: 'ARTES30',
          earnedFrom: 'Colección Tolimense completa',
          earnedDate: '2024-01-10T14:00:00Z',
          location: { lat: 4.4392, lng: -75.2330 },
          distance: 850,
          isProximity: false,
          socialBonus: false,
          isLimited: false,
          usageCount: 1,
          maxUsage: 1,
          tags: ['artesanías', 'local', 'colección'],
          usedDate: '2024-01-22T16:20:00Z'
        },
        {
          id: 'COUPON_004',
          title: 'Entrada VIP Jardín Botánico',
          description: 'Acceso especial + guía naturalista',
          discount: 100,
          discountType: 'fixed',
          value: '$15.000',
          business: 'Jardín Botánico San Jorge',
          category: 'naturaleza',
          rarity: 'epic',
          rarityColor: 'from-green-500 to-emerald-500',
          expiryDate: '2024-05-20',
          timeLimit: null,
          status: 'active',
          code: 'JARDIN100',
          earnedFrom: 'Intercambio con amigo',
          earnedDate: '2024-01-18T11:15:00Z',
          location: { lat: 4.4425, lng: -75.2280 },
          distance: 1200,
          isProximity: false,
          socialBonus: true,
          isLimited: false,
          usageCount: 0,
          maxUsage: 1,
          tags: ['naturaleza', 'VIP', 'educativo'],
          giftedBy: 'María González'
        }
      ]

      // Premium experiences in marketplace
      const mockExperiences = [
        {
          id: 'EXP_001',
          title: 'Tour Gastronómico Privado',
          description: 'Recorrido por 5 restaurantes locales con chef',
          pointsCost: 5000,
          category: 'gastro',
          duration: '4 horas',
          includes: ['Transporte', 'Degustaciones', 'Chef privado'],
          available: true,
          maxParticipants: 8,
          currentBookings: 3,
          rating: 4.9,
          image: '/images/tour-gastro.jpg',
          provider: 'Tolima Food Tours',
          restrictions: 'Solo fines de semana'
        },
        {
          id: 'EXP_002', 
          title: 'Concierto Privado Conservatorio',
          description: 'Concierto exclusivo de música clásica',
          pointsCost: 3000,
          category: 'cultura',
          duration: '2 horas',
          includes: ['Concierto privado', 'Recorrido', 'Refrigerio'],
          available: true,
          maxParticipants: 20,
          currentBookings: 15,
          rating: 4.8,
          image: '/images/concierto.jpg',
          provider: 'Conservatorio del Tolima',
          restrictions: 'Martes y jueves 7pm'
        },
        {
          id: 'EXP_003',
          title: 'Experiencia Glamping Tolima',
          description: 'Noche bajo las estrellas en las montañas',
          pointsCost: 7500,
          category: 'aventura',
          duration: '24 horas',
          includes: ['Alojamiento', 'Comidas', 'Actividades', 'Transporte'],
          available: false,
          maxParticipants: 6,
          currentBookings: 6,
          rating: 5.0,
          image: '/images/glamping.jpg',
          provider: 'Tolima Adventure',
          restrictions: 'Clima permita'
        }
      ]

      // Collections system
      const mockCollections = [
        {
          id: 'COL_001',
          name: 'Ruta del Café Tolimense',
          description: 'Colecciona cupones de todas las cafeterías locales',
          progress: 3,
          total: 5,
          reward: 'Curso de barista gratis',
          rarity: 'epic',
          coupons: ['Café La Pola', 'Tostadero Central', 'Café San Jorge'],
          missing: ['Café Colonial', 'Expreso Tolima'],
          completed: false,
          category: 'gastro'
        },
        {
          id: 'COL_002',
          name: 'Explorador Cultural',
          description: 'Visita todos los sitios históricos de Ibagué',
          progress: 4,
          total: 6,
          reward: 'Libro de historia + tour exclusivo',
          rarity: 'legendary',
          coupons: ['Conservatorio', 'Casa Cultura', 'Teatro Amira', 'Catedral'],
          missing: ['Museo', 'Plaza Bolívar'],
          completed: false,
          category: 'cultura'
        },
        {
          id: 'COL_003',
          name: 'Aventurero Verde',
          description: 'Conquista todos los espacios naturales',
          progress: 2,
          total: 4,
          reward: 'Kit de supervivencia + camping gratis',
          rarity: 'rare',
          coupons: ['Jardín Botánico', 'Mirador Martinica'],
          missing: ['Parque Galarza', 'Sendero Combeima'],
          completed: false,
          category: 'naturaleza'
        }
      ]

      // Social activity
      const mockSocial = [
        {
          id: 'SOC_001',
          type: 'gift_received',
          friend: 'María González',
          coupon: 'Entrada VIP Jardín Botánico',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          avatar: '👩‍🦱'
        },
        {
          id: 'SOC_002',
          type: 'shared_achievement',
          friend: 'Carlos Ramírez',
          achievement: 'Foodie Tolimense',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
          avatar: '👨‍💼'
        },
        {
          id: 'SOC_003',
          type: 'group_coupon_used',
          friends: ['Ana López', 'Luis Torres', 'Sofia Martín'],
          coupon: 'Descuento grupal restaurante',
          discount: '25%',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          avatar: '👥'
        }
      ]

      // Achievements
      const mockAchievements = [
        { id: 'ACH_001', name: 'Foodie Tolimense', icon: '🍽️', earned: true, earnedDate: '2024-01-15' },
        { id: 'ACH_002', name: 'Explorador Verde', icon: '🌿', earned: true, earnedDate: '2024-01-18' },
        { id: 'ACH_003', name: 'Madrugador', icon: '🌅', earned: true, earnedDate: '2024-01-20' },
        { id: 'ACH_004', name: 'Rey del Tamal', icon: '👑', earned: false },
        { id: 'ACH_005', name: 'Aventurero de Altura', icon: '🏔️', earned: false },
        { id: 'ACH_006', name: 'Mecenas Cultural', icon: '🎭', earned: false }
      ]

      setCoupons(mockCoupons)
      setExperiences(mockExperiences)
      setCollections(mockCollections)
      setSocialActivity(mockSocial)
      setAchievements(mockAchievements)
      setLoading(false)
    }

    // Get user location for proximity features
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => console.log('Location access denied')
      )
    }

    setTimeout(initializeWalletData, 1000)
  }, [])

  // Utility functions
  const getRarityBorder = (rarity) => {
    const borders = {
      common: 'border-gray-300',
      rare: 'border-blue-400',
      epic: 'border-purple-400', 
      legendary: 'border-yellow-400'
    }
    return borders[rarity] || 'border-gray-300'
  }

  const getRarityGlow = (rarity) => {
    const glows = {
      common: '',
      rare: 'shadow-blue-200',
      epic: 'shadow-purple-200',
      legendary: 'shadow-yellow-200'
    }
    return glows[rarity] || ''
  }

  const formatTimeRemaining = (timeLimit) => {
    if (!timeLimit) return null
    const now = new Date()
    const diff = timeLimit - now
    if (diff <= 0) return 'Expirado'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m restantes`
  }

  const calculateDistance = (couponLocation) => {
    if (!location || !couponLocation) return null
    // Simple distance calculation (in real app, use proper geolocation libraries)
    const lat1 = location.lat
    const lon1 = location.lng
    const lat2 = couponLocation.lat
    const lon2 = couponLocation.lng
    
    const R = 6371e3 // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180
    const φ2 = lat2 * Math.PI/180
    const Δφ = (lat2-lat1) * Math.PI/180
    const Δλ = (lon2-lon1) * Math.PI/180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return Math.round(R * c) // Distance in meters
  }

  // Smart recommendations
  const getSmartRecommendations = () => {
    const now = new Date().getHours()
    const activeCoupons = coupons.filter(c => c.status === 'active')
    
    return activeCoupons
      .map(coupon => {
        let score = 0
        let reason = ''

        // Proximity bonus
        const distance = calculateDistance(coupon.location)
        if (distance && distance <= 500) {
          score += 50
          reason = `Estás a solo ${distance}m de distancia`
        }

        // Time-based recommendations
        if (coupon.category === 'gastro') {
          if (now >= 12 && now <= 14) { // Lunch time
            score += 30
            reason = reason || 'Perfecto para almorzar'
          }
          if (now >= 18 && now <= 20) { // Dinner time
            score += 25
            reason = reason || 'Ideal para la cena'
          }
        }

        // Time limit urgency
        if (coupon.timeLimit) {
          const timeLeft = (coupon.timeLimit - new Date()) / (1000 * 60 * 60)
          if (timeLeft <= 2) {
            score += 40
            reason = '¡Se vence pronto!'
          }
        }

        // Rarity bonus
        if (coupon.rarity === 'legendary') score += 20
        if (coupon.rarity === 'epic') score += 15

        return { ...coupon, recommendationScore: score, recommendationReason: reason }
      })
      .filter(c => c.recommendationScore > 0)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 3)
  }

  // Handlers
  const handleDailySpin = () => {
    if (dailySpinUsed) return
    
    setShowSpinModal(true)
    // Simulate spin result
    setTimeout(() => {
      const rewards = [
        { type: 'coupon', title: 'Café gratis', rarity: 'common' },
        { type: 'points', amount: 100 },
        { type: 'coupon', title: '20% OFF comida', rarity: 'rare' },
        { type: 'points', amount: 250 }
      ]
      const reward = rewards[Math.floor(Math.random() * rewards.length)]
      
      if (reward.type === 'points') {
        setUserPoints(prev => prev + reward.amount)
        setToast({
          isVisible: true,
          type: 'success',
          title: '¡Ruleta ganadora!',
          message: `Has ganado ${reward.amount} puntos`
        })
      } else {
        setToast({
          isVisible: true,
          type: 'success',
          title: '¡Nuevo cupón!',
          message: `Has ganado: ${reward.title}`
        })
      }
      
      setDailySpinUsed(true)
      setShowSpinModal(false)
    }, 3000)
  }

  const handleBuyExperience = (experience) => {
    if (userPoints < experience.pointsCost) {
      setToast({
        isVisible: true,
        type: 'error',
        title: 'Puntos insuficientes',
        message: `Necesitas ${experience.pointsCost - userPoints} puntos más`
      })
      return
    }

    setUserPoints(prev => prev - experience.pointsCost)
    setToast({
      isVisible: true,
      type: 'success',
      title: '¡Experiencia adquirida!',
      message: `${experience.title} ha sido agregada a tu agenda`
    })
  }

  const handleGiftCoupon = (couponId, friendName) => {
    setCoupons(prev => prev.filter(c => c.id !== couponId))
    setToast({
      isVisible: true,
      type: 'success',
      title: 'Cupón enviado',
      message: `Has regalado el cupón a ${friendName}`
    })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando tu Smart Wallet...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Enhanced Header */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">💎</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  Smart Wallet
                </h1>
                <p className="text-gray-600">Tu tesoro turístico personal</p>
              </div>
            </div>
            
            {/* Daily Spin Button */}
            <button
              onClick={handleDailySpin}
              disabled={dailySpinUsed}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                dailySpinUsed 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-lg hover:scale-105 animate-pulse'
              }`}
            >
              {dailySpinUsed ? '✓ Ruleta usada' : '🎰 Ruleta Diaria'}
            </button>
          </div>

          {/* User Level and Points */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-emerald-100 to-blue-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Nivel de Explorador</span>
                <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-1 rounded-full">
                  Nivel {userLevel.level}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{userLevel.name}</h3>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${userLevel.progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600">Próximo: {userLevel.nextLevel}</p>
            </div>

            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {userPoints.toLocaleString()}
              </div>
              <p className="text-sm text-gray-700">Puntos Disponibles</p>
              <div className="flex items-center justify-center mt-2 space-x-2">
                <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                  🔥 Racha {streak} días
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Logros Recientes</h4>
              <div className="space-y-1">
                {achievements.filter(a => a.earned).slice(0, 3).map(achievement => (
                  <div key={achievement.id} className="flex items-center space-x-2">
                    <span className="text-lg">{achievement.icon}</span>
                    <span className="text-xs text-gray-700">{achievement.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Smart Recommendations */}
        {getSmartRecommendations().length > 0 && (
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🤖</span>
              Recomendaciones Inteligentes
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {getSmartRecommendations().map(coupon => (
                <div key={coupon.id} className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800 text-sm">{coupon.title}</h4>
                    <span className="text-lg">{coupon.category === 'gastro' ? '🍽️' : coupon.category === 'cultura' ? '🏛️' : '🌿'}</span>
                  </div>
                  <p className="text-xs text-blue-700 font-medium mb-2">{coupon.recommendationReason}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{coupon.business}</span>
                    <button className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full hover:bg-blue-600 transition-colors">
                      Usar Ahora
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[120px] px-4 py-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
          
          {/* Cupones Tab */}
          {activeTab === 'cupones' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Mis Cupones</h2>
                <div className="flex space-x-2">
                  {['active', 'used', 'expired'].map(status => (
                    <span key={status} className={`px-3 py-1 rounded-full text-xs font-medium ${
                      status === 'active' ? 'bg-green-100 text-green-800' :
                      status === 'used' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {coupons.filter(c => c.status === status).length} {status === 'active' ? 'Activos' : status === 'used' ? 'Usados' : 'Expirados'}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {coupons.map(coupon => (
                  <div
                    key={coupon.id}
                    className={`relative bg-white rounded-xl p-6 border-2 transition-all duration-300 hover:shadow-lg ${getRarityBorder(coupon.rarity)} ${getRarityGlow(coupon.rarity)} ${
                      coupon.status === 'used' ? 'opacity-60' : ''
                    }`}
                  >
                    {/* Rarity indicator */}
                    <div className={`absolute top-2 right-2 w-3 h-3 rounded-full bg-gradient-to-r ${coupon.rarityColor}`}></div>
                    
                    {/* Time limit indicator */}
                    {coupon.timeLimit && (
                      <div className="absolute top-2 left-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        ⏰ {formatTimeRemaining(coupon.timeLimit)}
                      </div>
                    )}

                    {/* Social indicator */}
                    {coupon.socialBonus && (
                      <div className="absolute top-8 left-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                        👥 Social
                      </div>
                    )}

                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-800 text-sm leading-tight">{coupon.title}</h3>
                        <span className="text-2xl ml-2">
                          {coupon.category === 'gastro' ? '🍽️' : 
                           coupon.category === 'cultura' ? '🏛️' : 
                           coupon.category === 'naturaleza' ? '🌿' : '🛍️'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{coupon.description}</p>
                      <p className="text-xs text-gray-500">{coupon.business}</p>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Descuento:</span>
                        <span className="font-bold text-emerald-600">
                          {coupon.discountType === 'percentage' ? `${coupon.discount}%` : coupon.value}
                        </span>
                      </div>
                      
                      {coupon.distance && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Distancia:</span>
                          <span className={`text-xs font-medium ${coupon.distance <= 500 ? 'text-green-600' : 'text-gray-600'}`}>
                            {coupon.distance}m
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Origen:</span>
                        <span className="text-xs text-purple-600 font-medium">{coupon.earnedFrom}</span>
                      </div>
                    </div>

                    {coupon.status === 'active' && (
                      <div className="space-y-2">
                        <button className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200">
                          🎫 Usar Cupón
                        </button>
                        <div className="flex space-x-2">
                          <button className="flex-1 bg-gray-100 text-gray-700 py-1 px-3 rounded-lg text-xs hover:bg-gray-200 transition-colors">
                            📤 Regalar
                          </button>
                          <button className="flex-1 bg-gray-100 text-gray-700 py-1 px-3 rounded-lg text-xs hover:bg-gray-200 transition-colors">
                            📍 Ver en Mapa
                          </button>
                        </div>
                      </div>
                    )}

                    {coupon.status === 'used' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-green-600">✓</span>
                          <span className="text-xs text-green-800 font-medium">Usado con éxito</span>
                        </div>
                        {coupon.usedDate && (
                          <p className="text-xs text-green-600 text-center mt-1">
                            {new Date(coupon.usedDate).toLocaleDateString('es-CO')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Marketplace Tab */}
          {activeTab === 'marketplace' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Marketplace de Puntos</h2>
                <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg">
                  💰 {userPoints.toLocaleString()} puntos disponibles
                </div>
              </div>

              {/* Premium Experiences */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">🌟 Experiencias Premium</h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {experiences.map(experience => (
                    <div key={experience.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                      <div className="h-48 bg-gradient-to-r from-emerald-400 to-blue-400 flex items-center justify-center">
                        <span className="text-6xl">
                          {experience.category === 'gastro' ? '🍽️' : 
                           experience.category === 'cultura' ? '🎭' : '🏔️'}
                        </span>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-gray-800">{experience.title}</h4>
                          <div className="flex items-center space-x-1">
                            <span className="text-yellow-500">⭐</span>
                            <span className="text-xs text-gray-600">{experience.rating}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{experience.description}</p>
                        
                        <div className="space-y-2 text-xs text-gray-600 mb-4">
                          <div className="flex justify-between">
                            <span>⏱️ Duración:</span>
                            <span>{experience.duration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>👥 Cupos:</span>
                            <span>{experience.currentBookings}/{experience.maxParticipants}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>🏢 Proveedor:</span>
                            <span>{experience.provider}</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h5 className="text-xs font-semibold text-gray-700 mb-1">Incluye:</h5>
                          <div className="flex flex-wrap gap-1">
                            {experience.includes.map((item, index) => (
                              <span key={index} className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-center">
                            <div className="text-lg font-bold text-emerald-600">
                              {experience.pointsCost.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">puntos</div>
                          </div>
                          <button
                            onClick={() => handleBuyExperience(experience)}
                            disabled={!experience.available || userPoints < experience.pointsCost}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              experience.available && userPoints >= experience.pointsCost
                                ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:shadow-lg'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {!experience.available ? 'Agotado' : 
                             userPoints < experience.pointsCost ? 'Sin puntos' : 'Comprar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Point Conversion */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">💎 Conversión de Puntos</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    { points: 500, coupon: 'Café gratis', business: 'Cualquier cafetería' },
                    { points: 1000, coupon: '20% OFF comida', business: 'Restaurantes locales' },
                    { points: 1500, coupon: 'Entrada museo', business: 'Museos de Ibagué' },
                    { points: 2000, coupon: '30% OFF artesanías', business: 'Tiendas locales' }
                  ].map((offer, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-purple-200">
                      <div className="text-center mb-3">
                        <div className="text-lg font-bold text-purple-600">{offer.points}</div>
                        <div className="text-xs text-gray-500">puntos</div>
                      </div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-1">{offer.coupon}</h4>
                      <p className="text-xs text-gray-600 mb-3">{offer.business}</p>
                      <button
                        disabled={userPoints < offer.points}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                          userPoints >= offer.points
                            ? 'bg-purple-500 text-white hover:bg-purple-600'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Canjear
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Colecciones Tab */}
          {activeTab === 'colecciones' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Colecciones NFT</h2>
                <div className="text-sm text-gray-600">
                  {collections.filter(c => c.completed).length} de {collections.length} completadas
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {collections.map(collection => (
                  <div key={collection.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-800 mb-1">{collection.name}</h3>
                        <p className="text-sm text-gray-600">{collection.description}</p>
                      </div>
                      <span className="text-2xl">
                        {collection.category === 'gastro' ? '☕' : 
                         collection.category === 'cultura' ? '🏛️' : '🌿'}
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Progreso</span>
                        <span className="text-sm text-gray-600">{collection.progress}/{collection.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(collection.progress / collection.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Collected items */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">✅ Coleccionados:</h4>
                      <div className="space-y-1">
                        {collection.coupons.map((coupon, index) => (
                          <div key={index} className="text-xs text-green-600 flex items-center">
                            <span className="mr-2">✓</span>
                            {coupon}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Missing items */}
                    {collection.missing.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">❌ Faltantes:</h4>
                        <div className="space-y-1">
                          {collection.missing.map((item, index) => (
                            <div key={index} className="text-xs text-gray-500 flex items-center">
                              <span className="mr-2">○</span>
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reward */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3">
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">🎁 Recompensa:</h4>
                      <p className="text-xs text-orange-800">{collection.reward}</p>
                    </div>

                    {collection.completed && (
                      <button className="w-full mt-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium">
                        ✨ Reclamar Recompensa
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Tab */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Actividad Social</h2>
                <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  👥 Invitar Amigos
                </button>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📱 Actividad Reciente</h3>
                <div className="space-y-4">
                  {socialActivity.map(activity => (
                    <div key={activity.id} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl">{activity.avatar}</div>
                      <div className="flex-1">
                        {activity.type === 'gift_received' && (
                          <div>
                            <p className="text-sm text-gray-800">
                              <span className="font-semibold">{activity.friend}</span> te regaló un cupón
                            </p>
                            <p className="text-xs text-purple-600">{activity.coupon}</p>
                          </div>
                        )}
                        {activity.type === 'shared_achievement' && (
                          <div>
                            <p className="text-sm text-gray-800">
                              <span className="font-semibold">{activity.friend}</span> compartió un logro
                            </p>
                            <p className="text-xs text-purple-600">{activity.achievement}</p>
                          </div>
                        )}
                        {activity.type === 'group_coupon_used' && (
                          <div>
                            <p className="text-sm text-gray-800">
                              Usaste un cupón grupal con {activity.friends.length} amigos
                            </p>
                            <p className="text-xs text-purple-600">{activity.coupon} - {activity.discount}</p>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.timestamp.toLocaleString('es-CO')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group Features */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">👥 Cupones Grupales</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Activa cupones especiales cuando estés con amigos
                  </p>
                  <div className="space-y-2">
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Restaurante 4 personas</span>
                        <span className="text-sm text-blue-600 font-bold">25% OFF</span>
                      </div>
                      <p className="text-xs text-gray-500">Disponible ahora</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Tour grupal</span>
                        <span className="text-sm text-blue-600 font-bold">2x1</span>
                      </div>
                      <p className="text-xs text-gray-500">Mínimo 6 personas</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">🎁 Centro de Regalos</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Regala cupones a tus amigos turistas
                  </p>
                  <div className="space-y-2">
                    <button className="w-full bg-white border border-purple-200 text-purple-700 py-2 px-4 rounded-lg text-sm hover:bg-purple-50 transition-colors">
                      📤 Regalar Cupón Activo
                    </button>
                    <button className="w-full bg-white border border-purple-200 text-purple-700 py-2 px-4 rounded-lg text-sm hover:bg-purple-50 transition-colors">
                      💎 Comprar Regalo Premium
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'estadisticas' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">📊 Estadísticas de Viaje</h2>

              {/* Key Stats */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">$127.500</div>
                  <p className="text-sm text-gray-700">Ahorrado Total</p>
                </div>
                <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">23</div>
                  <p className="text-sm text-gray-700">Lugares Visitados</p>
                </div>
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">45</div>
                  <p className="text-sm text-gray-700">Cupones Usados</p>
                </div>
                <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-1">12</div>
                  <p className="text-sm text-gray-700">Amigos Conectados</p>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">🏷️ Por Categoría</h3>
                <div className="space-y-4">
                  {[
                    { category: 'Gastronomía', icon: '🍽️', used: 18, saved: '$45.000', color: 'from-orange-500 to-red-500' },
                    { category: 'Cultura', icon: '🏛️', used: 12, saved: '$32.500', color: 'from-purple-500 to-pink-500' },
                    { category: 'Naturaleza', icon: '🌿', used: 8, saved: '$28.000', color: 'from-green-500 to-emerald-500' },
                    { category: 'Compras', icon: '🛍️', used: 7, saved: '$22.000', color: 'from-blue-500 to-cyan-500' }
                  ].map((stat, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center text-white text-lg`}>
                          {stat.icon}
                        </div>
                        <span className="font-medium text-gray-800">{stat.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-800">{stat.used} cupones</div>
                        <div className="text-sm text-green-600">{stat.saved} ahorrado</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Travel Timeline */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📅 Timeline de Viaje</h3>
                <div className="space-y-3">
                  {[
                    { date: 'Hoy', activity: 'Café gratis en La Pola', type: 'coupon_used', icon: '☕' },
                    { date: 'Ayer', activity: 'Check-in Jardín Botánico', type: 'checkin', icon: '📍' },
                    { date: '2 días', activity: 'Logro "Foodie Tolimense"', type: 'achievement', icon: '🏆' },
                    { date: '3 días', activity: 'Regalo de María González', type: 'gift', icon: '🎁' },
                    { date: '1 semana', activity: 'Tour Conservatorio', type: 'experience', icon: '🎭' }
                  ].map((event, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="text-2xl">{event.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{event.activity}</p>
                        <p className="text-xs text-gray-500">{event.date}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.type === 'coupon_used' ? 'bg-green-100 text-green-800' :
                        event.type === 'checkin' ? 'bg-blue-100 text-blue-800' :
                        event.type === 'achievement' ? 'bg-yellow-100 text-yellow-800' :
                        event.type === 'gift' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {event.type === 'coupon_used' ? 'Cupón' :
                         event.type === 'checkin' ? 'Check-in' :
                         event.type === 'achievement' ? 'Logro' :
                         event.type === 'gift' ? 'Regalo' : 'Experiencia'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Daily Spin Modal */}
        {showSpinModal && (
          <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
              <div className="w-32 h-32 mx-auto mb-6 relative">
                <div className="w-full h-full border-8 border-yellow-400 rounded-full animate-spin flex items-center justify-center">
                  <span className="text-4xl">🎰</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">¡Girando la ruleta!</h3>
              <p className="text-gray-600">Espera a ver qué premio te toca...</p>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast.isVisible && (
          <div className="fixed top-20 right-4 z-[9999] max-w-sm">
            <div className={`rounded-xl p-4 shadow-2xl border backdrop-blur-lg ${
              toast.type === 'success' 
                ? 'bg-green-50/90 border-green-200 text-green-800' 
                : toast.type === 'error'
                ? 'bg-red-50/90 border-red-200 text-red-800'
                : 'bg-blue-50/90 border-blue-200 text-blue-800'
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

      {/* Tour Guide Chat */}
      <TourGuideChat 
        userLocation={location}
        userPoints={userPoints}
        lastCheckIn={null}
        currentActivity="managing-wallet"
      />
    </div>
  )
}

export default Wallet