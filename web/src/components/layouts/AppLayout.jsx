// User app layout with ocobo theme
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'

const AppLayout = ({ children }) => {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Explorar', href: '/app/home', icon: '🗺️' },
    { name: 'Check-in', href: '/app/checkin', icon: '📍' },
    { name: 'Wallet', href: '/app/wallet', icon: '💳' },
    { name: 'Historial', href: '/app/history', icon: '📊' },
    { name: 'Misiones', href: '/app/missions', icon: '🎯' },
    { name: 'Perfil', href: '/app/profile', icon: '👤' },
  ]

  const handleSignOut = async () => {
    await signOut()
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest/5 via-white to-forest2/5">
      {/* Header */}
      <header className="bg-white shadow-soft border-b border-forest/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/app/home" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-ocobo to-gold rounded-full flex items-center justify-center">
                <span className="text-white text-lg">🌸</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-forest">Rutas VIVAS</h1>
                <p className="text-xs text-forest2">Tolima</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-ocobo to-gold text-white shadow-glow-ocobo'
                      : 'text-gray-600 hover:text-ocobo hover:bg-ocobo/10'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* User Info */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-forest to-forest2 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-forest">{profile?.email || user?.email}</p>
                  <p className="text-xs text-gray-500">
                    {profile?.role === 'admin' ? 'Administrador' : 'Explorador'}
                  </p>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <span>🚪</span>
                <span className="hidden sm:inline">Salir</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:text-ocobo hover:bg-ocobo/10"
              >
                <span className="text-xl">☰</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-forest/10 bg-white">
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-ocobo to-gold text-white shadow-glow-ocobo'
                      : 'text-gray-600 hover:text-ocobo hover:bg-ocobo/10'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-forest to-forest2 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white">🌸</span>
              </div>
              <div>
                <p className="font-semibold">Rutas VIVAS Tolima</p>
                <p className="text-sm text-white/80">Explora la belleza de Ibagué</p>
              </div>
            </div>
            
            <div className="text-sm text-white/80">
              <p>© 2024 Rutas VIVAS. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AppLayout
