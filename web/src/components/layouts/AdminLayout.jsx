// Admin layout with sidebar and metrics
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAdmin } from '../../hooks/useAuth.jsx'

const AdminLayout = ({ children }) => {
  const { user, profile, signOut } = useAdmin()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { name: 'Lugares', href: '/admin/places', icon: '📍' },
    { name: 'Check-ins', href: '/admin/checkins', icon: '✅' },
    { name: 'Cupones', href: '/admin/coupons', icon: '🎫' },
    { name: 'Usuarios', href: '/admin/users', icon: '👥' },
    { name: 'Configuración', href: '/admin/settings', icon: '⚙️' },
  ]

  const handleSignOut = async () => {
    await signOut()
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link to="/admin/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-ocobo to-gold rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🌸</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-forest">Admin Panel</h1>
                <p className="text-xs text-gray-500">Rutas VIVAS</p>
              </div>
            </Link>
            
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-forest to-forest2 text-white shadow-glow-forest'
                    : 'text-gray-600 hover:text-forest hover:bg-forest/10'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-ocobo to-gold rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-forest truncate">
                  {profile?.email || user?.email}
                </p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <span>🚪</span>
              <span>Salir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <span className="text-xl">☰</span>
            </button>

            <div className="flex items-center space-x-4">
              {/* Quick Stats */}
              <div className="hidden sm:flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Sistema activo</span>
                </div>
                <div className="text-gray-500">|</div>
                <div className="text-gray-600">
                  {new Date().toLocaleDateString('es-CO')}
                </div>
              </div>

              {/* Notifications */}
              <button className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <span className="text-lg">🔔</span>
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default AdminLayout
