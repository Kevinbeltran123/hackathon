import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ActionsDropdown, { Item } from './ActionsDropdown'
import { useAuth } from '../auth/AuthProvider'

export default function Header() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  // Trigger filters toggle from Home page
  const toggleFilters = () => {
    const event = new CustomEvent('toggleFilters')
    window.dispatchEvent(event)
  }

  const navItems: Item[] = [
    { key: 'explore', label: 'Explorar', to: '/app/home', icon: '🗺️', active: location.pathname === '/app/home' },
    { key: 'checkin', label: 'Check-in', to: '/app/checkin', icon: '📍', active: location.pathname === '/app/checkin' },
    { key: 'wallet', label: 'Wallet', to: '/app/wallet', icon: '💳', active: location.pathname === '/app/wallet' },
    { key: 'history', label: 'Historial', to: '/app/history', icon: '📊', active: location.pathname === '/app/history' },
    { key: 'missions', label: 'Misiones', to: '/app/missions', icon: '🎯', active: location.pathname === '/app/missions' },
    { key: 'filters', label: 'Filtros', onClick: toggleFilters, icon: '🔍' },
  ]

  // Logo component
  const Logo = () => (
    <Link to="/app/home" className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-r from-ocobo to-gold rounded-full flex items-center justify-center">
        <span className="text-white text-lg">🌸</span>
      </div>
      <div className="hidden sm:block">
        <h1 className="text-xl font-bold text-forest leading-none">Rutas VIVAS</h1>
        <p className="text-xs text-forest2 -mt-0.5">Tolima</p>
      </div>
    </Link>
  )

  // UserMenu component  
  const UserMenu = () => (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="w-8 h-8 bg-gradient-to-r from-forest to-forest2 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <svg className="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg ring-1 ring-black/5 z-50 overflow-hidden" role="menu">
          <div className="px-4 py-3 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-forest to-forest2 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-forest truncate">{user?.full_name || user?.email || 'Usuario'}</div>
                <div className="text-xs text-gray-500 truncate">{user?.role === 'admin' ? 'Administrador' : 'Explorador'}</div>
              </div>
            </div>
          </div>
          <div className="py-1">
            <Link to="/app/profile" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" role="menuitem" onClick={() => setOpen(false)}>
              Perfil
            </Link>
            <button onClick={() => logout()} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600" role="menuitem">
              Salir
            </button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Header básico sin menú */}
      <header className="fixed inset-x-0 top-0 h-16 z-40 bg-white/90 backdrop-blur border-b">
        <div className="w-full h-full px-4 flex items-center">
          {/* Espacio vacío - el menú está posicionado independientemente */}
        </div>
      </header>

      {/* Menú flotante fijo en esquina derecha */}
      <div className="fixed top-4 right-4 z-[60] floating-menu">
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-1">
          <ActionsDropdown items={navItems} />
        </div>
      </div>
    </>
  )
}


