// Admin coupons management page
import React, { useState, useEffect } from 'react'
import CouponCreator from '../../components/profile/CouponCreator'

const Coupons = () => {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

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
        redemptions: 15,
        maxRedemptions: 100
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
        status: 'active',
        code: 'MUSEO100',
        createdAt: '2024-01-10T14:30:00Z',
        redemptions: 8,
        maxRedemptions: 50
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
        redemptions: 25,
        maxRedemptions: 30
      }
    ]

    setTimeout(() => {
      setCoupons(mockCoupons)
      setLoading(false)
    }, 1000)
  }, [])

  const filters = [
    { id: 'all', name: 'Todos', count: 0 },
    { id: 'active', name: 'Activos', count: 0 },
    { id: 'expired', name: 'Expirados', count: 0 },
    { id: 'paused', name: 'Pausados', count: 0 },
  ]

  const filteredCoupons = coupons.filter(coupon => {
    const matchesFilter = filter === 'all' || coupon.status === filter
    const matchesSearch = coupon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.agency.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleCreateCoupon = (couponData) => {
    const newCoupon = {
      ...couponData,
      id: `COUPON_${Date.now()}`,
      createdAt: new Date().toISOString(),
      redemptions: 0,
      maxRedemptions: 100
    }
    setCoupons(prev => [newCoupon, ...prev])
    setShowCreateModal(false)
  }

  const handleStatusChange = (couponId, newStatus) => {
    setCoupons(prev => prev.map(coupon => 
      coupon.id === couponId 
        ? { ...coupon, status: newStatus }
        : coupon
    ))
  }

  const handleDeleteCoupon = (couponId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cupón?')) {
      setCoupons(prev => prev.filter(coupon => coupon.id !== couponId))
    }
  }

  const exportToCSV = () => {
    const csvContent = [
      ['ID', 'Título', 'Agencia', 'Descuento', 'Código', 'Estado', 'Redenciones', 'Fecha Creación'],
      ...filteredCoupons.map(coupon => [
        coupon.id,
        coupon.title,
        coupon.agency,
        `${coupon.discount}${coupon.discountType === 'percentage' ? '%' : '$'}`,
        coupon.code,
        coupon.status,
        coupon.redemptions,
        new Date(coupon.createdAt).toLocaleDateString('es-CO')
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cupones.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocobo mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando cupones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-forest">Gestión de Cupones</h1>
          <p className="text-gray-600">Crea y administra campañas de descuentos</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 border border-forest text-forest rounded-lg hover:bg-forest/10 transition-colors"
          >
            📊 Exportar CSV
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-ocobo to-gold text-white rounded-lg hover:shadow-glow-ocobo transition-all duration-200"
          >
            ➕ Crear Cupón
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cupones</p>
              <p className="text-2xl font-bold text-forest">{coupons.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-ocobo to-gold rounded-full flex items-center justify-center">
              <span className="text-white text-xl">🎫</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-forest">
                {coupons.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Redenciones</p>
              <p className="text-2xl font-bold text-forest">
                {coupons.reduce((sum, coupon) => sum + coupon.redemptions, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">🎯</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expirados</p>
              <p className="text-2xl font-bold text-forest">
                {coupons.filter(c => c.status === 'expired').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">⏰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar cupones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocobo/50 focus:border-ocobo"
            />
          </div>

          {/* Filters */}
          <div className="flex space-x-2">
            {filters.map((filterOption) => (
              <button
                key={filterOption.id}
                onClick={() => setFilter(filterOption.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === filterOption.id
                    ? 'bg-gradient-to-r from-ocobo to-gold text-white shadow-glow-ocobo'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filterOption.name} ({filterOption.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cupón
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descuento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Redenciones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCoupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-forest">{coupon.title}</div>
                      <div className="text-sm text-gray-500">{coupon.code}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {coupon.agency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {coupon.discountType === 'percentage' ? `${coupon.discount}%` : `$${coupon.discount}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      coupon.status === 'active' ? 'bg-green-100 text-green-800' :
                      coupon.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {coupon.status === 'active' ? 'Activo' :
                       coupon.status === 'expired' ? 'Expirado' : 'Pausado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {coupon.redemptions}/{coupon.maxRedemptions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {coupon.status === 'active' && (
                        <button
                          onClick={() => handleStatusChange(coupon.id, 'paused')}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          ⏸️ Pausar
                        </button>
                      )}
                      {coupon.status === 'paused' && (
                        <button
                          onClick={() => handleStatusChange(coupon.id, 'active')}
                          className="text-green-600 hover:text-green-900"
                        >
                          ▶️ Activar
                        </button>
                      )}
                      <button className="text-blue-600 hover:text-blue-900">
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredCoupons.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🎫</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No se encontraron cupones
          </h3>
          <p className="text-gray-500">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay cupones con este filtro'}
          </p>
        </div>
      )}

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-forest">Crear Nuevo Cupón</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <CouponCreator onCreateCoupon={handleCreateCoupon} />
          </div>
        </div>
      )}
    </div>
  )
}

export default Coupons
