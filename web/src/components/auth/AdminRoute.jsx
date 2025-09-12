// Admin-only route component
import React from 'react'
import { useAdmin } from '../../hooks/useAuth.jsx'
import { Navigate, useLocation } from 'react-router-dom'

const AdminRoute = ({ children }) => {
  const { isAdmin, loading, isAuthenticated } = useAdmin()
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

  // Redirect to home if not admin
  if (!isAdmin) {
    return <Navigate to="/app/home" replace />
  }

  return children
}

export default AdminRoute
