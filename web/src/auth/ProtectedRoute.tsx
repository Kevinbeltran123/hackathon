import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import FullScreenLoader from '../components/FullScreenLoader'

interface ProtectedRouteProps {
  requireRole?: 'usuario' | 'business_owner'
  redirectPath?: string
}

export default function ProtectedRoute({ requireRole, redirectPath }: ProtectedRouteProps) {
  const { loading, session, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return <FullScreenLoader open />
  }

  if (!session || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  // Check role-based access
  if (requireRole && user.role !== requireRole) {
    if (redirectPath) {
      return <Navigate to={redirectPath} replace />
    }
    
    // Redirect based on user role
    if (user.role === 'business_owner') {
      return <Navigate to="/business/dashboard" replace />
    } else {
      return <Navigate to="/app/home" replace />
    }
  }

  return <Outlet />
}
