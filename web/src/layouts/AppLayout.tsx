import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export default function AppLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: 'Explorar', href: '/app/home', icon: '🗺️' },
    { name: 'Check-in', href: '/app/checkin', icon: '📍' },
    { name: 'Wallet', href: '/app/wallet', icon: '💳' },
    { name: 'Historial', href: '/app/history', icon: '📊' },
    { name: 'Misiones', href: '/app/missions', icon: '🎯' },
    { name: 'Perfil', href: '/app/profile', icon: '👤' },
  ]

  const isActive = (path: string) => location.pathname === path

  const handleSignOut = async () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white text-neutral-900">
      {/* Fixed Header */}
      <header className="fixed inset-x-0 top-0 z-50 h-16 bg-white/90 backdrop-blur border-b border-forest/10">
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
                      ? 'bg-gradient-to-r from-ocobo to-gold text-white shadow-lg'
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
              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-forest to-forest2 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="text-sm">
                  <div className="font-medium text-forest">{user?.full_name || 'Usuario'}</div>
                  <div className="text-xs text-gray-500">{user?.role === 'usuario' ? 'Explorador' : 'Usuario'}</div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-ocobo hover:bg-ocobo/10 rounded-lg transition-all duration-200"
              >
                <span>🚪</span>
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with proper spacing */}
      <main id="content" className="relative z-0 pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-sm text-neutral-600 bg-white">
        <div className="container mx-auto px-4 text-center">
          © 2024 Rutas VIVAS. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  )
}
