// User wallet page with coupons
import React, { useState, useEffect } from 'react'
import WalletList from '../../components/profile/WalletList'
import RedeemModal from '../../components/profile/RedeemModal'
import Toast from '../../components/profile/Toast'

const Wallet = () => {
  const [coupons, setCoupons] = useState([])
  const [showRedeemModal, setShowRedeemModal] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState(null)
  const [toast, setToast] = useState({
    isVisible: false,
    type: 'success',
    title: '',
    message: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading coupons
    const mockCoupons = [
      {
        id: 'COUPON_001',
        title: '20% de descuento en restaurantes',
        description: 'Descuento especial en comida tradicional',
        discount: 20,
        discountType: 'percentage',
        agency: 'Aventuras Colombia',
        expiryDate: '2024-12-31',
        terms: 'Válido solo en restaurantes participantes',
        status: 'active',
        code: 'AVENT20',
        createdAt: '2024-01-15T10:00:00Z',
      },
      {
        id: 'COUPON_002',
        title: 'Entrada gratis al museo',
        description: 'Acceso gratuito a exposiciones',
        discount: 100,
        discountType: 'fixed',
        agency: 'Museo de Arte',
        expiryDate: '2024-06-30',
        terms: 'Solo para visitas de martes a jueves',
        status: 'used',
        code: 'MUSEO100',
        createdAt: '2024-01-10T14:30:00Z',
      },
      {
        id: 'COUPON_003',
        title: 'Descuento en artesanías',
        description: '15% de descuento en productos locales',
        discount: 15,
        discountType: 'percentage',
        agency: 'Artesanías del Tolima',
        expiryDate: '2024-03-15',
        terms: 'Mínimo de compra $50.000',
        status: 'expired',
        code: 'ARTE15',
        createdAt: '2024-01-05T09:15:00Z',
      },
    ]

    setTimeout(() => {
      setCoupons(mockCoupons)
      setLoading(false)
    }, 1000)
  }, [])

  const handleRedeemCoupon = (coupon, code) => {
    // Simulate redemption
    setCoupons(prev => 
      prev.map(c => 
        c.id === coupon.id ? { ...c, status: 'used' } : c
      )
    )
    
    setToast({
      isVisible: true,
      type: 'success',
      title: 'Cupón redimido',
      message: '¡Disfruta tu descuento!'
    })
    
    setShowRedeemModal(false)
  }

  const handleRemoveCoupon = (couponId) => {
    setCoupons(prev => prev.filter(c => c.id !== couponId))
    setToast({
      isVisible: true,
      type: 'info',
      title: 'Cupón eliminado',
      message: 'Se ha removido de tu wallet'
    })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocobo mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tu wallet...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-forest mb-2">Mi Wallet</h1>
        <p className="text-gray-600">
          Gestiona tus cupones y descuentos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-ocobo to-gold rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-xl">🎫</span>
          </div>
          <h3 className="text-2xl font-bold text-forest mb-1">
            {coupons.filter(c => c.status === 'active').length}
          </h3>
          <p className="text-sm text-gray-600">Cupones activos</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-forest to-forest2 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-xl">✅</span>
          </div>
          <h3 className="text-2xl font-bold text-forest mb-1">
            {coupons.filter(c => c.status === 'used').length}
          </h3>
          <p className="text-sm text-gray-600">Usados</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-xl">⏰</span>
          </div>
          <h3 className="text-2xl font-bold text-forest mb-1">
            {coupons.filter(c => c.status === 'expired').length}
          </h3>
          <p className="text-sm text-gray-600">Expirados</p>
        </div>
      </div>

      {/* Wallet List */}
      <WalletList
        coupons={coupons}
        onRedeem={(coupon) => {
          setSelectedCoupon(coupon)
          setShowRedeemModal(true)
        }}
        onRemove={handleRemoveCoupon}
      />

      {/* Redeem Modal */}
      <RedeemModal
        isOpen={showRedeemModal}
        onClose={() => setShowRedeemModal(false)}
        onRedeem={handleRedeemCoupon}
        coupon={selectedCoupon}
      />

      {/* Toast */}
      <Toast
        isVisible={toast.isVisible}
        onClose={hideToast}
        type={toast.type}
        title={toast.title}
        message={toast.message}
      />
    </div>
  )
}

export default Wallet
