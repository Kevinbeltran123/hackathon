// User profile page
import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import ProfileHeader from '../../components/profile/ProfileHeader'
import StatsStrip from '../../components/profile/StatsStrip'
import Tabs from '../../components/profile/Tabs'
import Toast from '../../components/profile/Toast'

const Profile = () => {
  const { user, profile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('perfil')
  const [toast, setToast] = useState({
    isVisible: false,
    type: 'success',
    title: '',
    message: '',
  })

  const handleSignOut = async () => {
    await signOut()
    setToast({
      isVisible: true,
      type: 'info',
      title: 'Sesión cerrada',
      message: 'Has cerrado sesión correctamente'
    })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Profile Header */}
      <ProfileHeader 
        user={user}
        profile={profile}
        onSignOut={handleSignOut}
      />

      {/* Stats Strip */}
      <StatsStrip 
        checkIns={12}
        points={450}
        level={3}
        badges={['Explorador', 'Gourmet', 'Cultural']}
      />

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          { id: 'perfil', name: 'Perfil', icon: '👤' },
          { id: 'checkin', name: 'Check-in', icon: '📍' },
          { id: 'cupones', name: 'Cupones', icon: '🎫' },
          { id: 'historial', name: 'Historial', icon: '📊' }
        ]}
      />

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
        {activeTab === 'perfil' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-forest">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={profile?.full_name || ''}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocobo/50"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocobo/50"
                  readOnly
                />
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-forest mb-3">Configuración de Privacidad</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-700">Compartir ubicación</p>
                    <p className="text-sm text-gray-500">Permitir que la app use tu ubicación para check-ins</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-ocobo border-gray-300 rounded focus:ring-ocobo"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-700">Notificaciones push</p>
                    <p className="text-sm text-gray-500">Recibir notificaciones sobre nuevas misiones y cupones</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-ocobo border-gray-300 rounded focus:ring-ocobo"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'checkin' && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📍</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Check-in
            </h3>
            <p className="text-gray-500 mb-6">
              Haz check-in en lugares para ganar puntos y desbloquear logros
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-ocobo to-gold text-white rounded-lg font-semibold hover:shadow-glow-ocobo transition-all duration-200">
              Ir a Check-in
            </button>
          </div>
        )}

        {activeTab === 'cupones' && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🎫</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Cupones
            </h3>
            <p className="text-gray-500 mb-6">
              Gestiona tus cupones y descuentos
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-ocobo to-gold text-white rounded-lg font-semibold hover:shadow-glow-ocobo transition-all duration-200">
              Ver Wallet
            </button>
          </div>
        )}

        {activeTab === 'historial' && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Historial
            </h3>
            <p className="text-gray-500 mb-6">
              Revisa todos tus check-ins y logros
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-ocobo to-gold text-white rounded-lg font-semibold hover:shadow-glow-ocobo transition-all duration-200">
              Ver Historial
            </button>
          </div>
        )}
      </div>

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

export default Profile
