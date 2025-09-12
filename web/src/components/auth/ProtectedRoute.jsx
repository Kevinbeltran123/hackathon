// Protected route component that requires authentication
import React from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { Navigate, useLocation } from 'react-router-dom'

const ProtectedRoute = ({ children, requireRole = null }) => {
  const { isAuthenticated, loading, role, isAdmin } = useAuth()
  const location = useLocation()

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocobo"></div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check specific role requirement
  if (requireRole) {
    const hasRequiredRole = requireRole === 'admin' ? isAdmin : role === requireRole
    
    if (!hasRequiredRole) {
      return <Navigate to="/app/home" replace />
    }
  }

  return children
}

export default ProtectedRoute
