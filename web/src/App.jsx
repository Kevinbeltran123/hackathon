import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import ProtectedRoute from './auth/ProtectedRoute'
import AppLayout from './layouts/AppLayout'
import BusinessLayout from './components/layouts/BusinessLayout'

// User pages
import Home from './pages/app/Home'
import CheckIn from './pages/app/CheckIn'
import Wallet from './pages/app/Wallet'
import History from './pages/app/History'
import Missions from './pages/app/Missions'
import Profile from './pages/app/Profile'

// Business Owner pages  
import BusinessDashboard from './pages/business/Dashboard'
import BusinessPlaces from './pages/business/Places'
import BusinessMetrics from './pages/business/Metrics'
import BusinessCoupons from './pages/business/Coupons'
import BusinessSettings from './pages/business/Settings'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Error pages
import NotFound from './pages/errors/NotFound'
import AccessDenied from './pages/errors/AccessDenied'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* User Routes */}
          <Route path="/app" element={<ProtectedRoute requireRole="usuario" />}>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/app/home" replace />} />
              <Route path="home" element={<Home />} />
              <Route path="checkin" element={<CheckIn />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="history" element={<History />} />
              <Route path="missions" element={<Missions />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Business Owner Routes */}
          <Route path="/business" element={<ProtectedRoute requireRole="business_owner" />}>
            <Route element={<BusinessLayout />}>
              <Route index element={<Navigate to="/business/dashboard" replace />} />
              <Route path="dashboard" element={<BusinessDashboard />} />
              <Route path="places" element={<BusinessPlaces />} />
              <Route path="metrics" element={<BusinessMetrics />} />
              <Route path="coupons" element={<BusinessCoupons />} />
              <Route path="settings" element={<BusinessSettings />} />
            </Route>
          </Route>

          {/* Error Routes */}
          <Route path="/404" element={<NotFound />} />
          <Route path="/403" element={<AccessDenied />} />
          
          {/* Default Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App