// Role-based access control component
import React from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { ROLES } from '../../lib/auth'

const RoleGate = ({ 
  allow = [], 
  children, 
  fallback = null,
  requireAll = false 
}) => {
  const { role, isAdmin, loading } = useAuth()

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocobo"></div>
      </div>
    )
  }

  // Check if user has required role(s)
  const hasAccess = requireAll 
    ? allow.every(requiredRole => {
        if (requiredRole === ROLES.ADMIN) return isAdmin
        return role === requiredRole
      })
    : allow.some(requiredRole => {
        if (requiredRole === ROLES.ADMIN) return isAdmin
        return role === requiredRole
      })

  if (!hasAccess) {
    return fallback || <AccessDenied />
  }

  return children
}

// Default access denied component
const AccessDenied = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-forest/5 via-white to-forest2/5 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-glow-forest p-8 text-center max-w-md w-full border border-forest/20">
        {/* Ocobo flower icon */}
        <div className="w-16 h-16 bg-gradient-to-r from-ocobo to-gold rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-2xl">🌸</span>
        </div>
        
        <h1 className="text-2xl font-bold text-forest mb-4">Acceso Denegado</h1>
        <p className="text-gray-600 mb-6">
          No tienes permisos para acceder a esta sección.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gradient-to-r from-forest to-forest2 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-glow-forest transition-all duration-200"
          >
            ← Volver
          </button>
          
          <button
            onClick={() => window.location.href = '/app/home'}
            className="w-full border border-forest text-forest py-3 px-6 rounded-lg font-semibold hover:bg-forest/10 transition-colors"
          >
            Ir al Inicio
          </button>
        </div>
      </div>
    </div>
  )
}

export default RoleGate
