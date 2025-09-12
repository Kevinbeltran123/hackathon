// Authentication hook with role management (Mock version for demo)
import { useState, useEffect, useContext, createContext } from 'react'

const AuthContext = createContext()

// Mock users for demo
const MOCK_USERS = {
  'usuario@demo.com': {
    id: 'user-123',
    email: 'usuario@demo.com',
    password: 'password123',
    profile: {
      id: 'user-123',
      email: 'usuario@demo.com',
      full_name: 'Usuario Demo',
      role: 'user',
      is_admin: false
    }
  },
  'admin@demo.com': {
    id: 'admin-123',
    email: 'admin@demo.com',
    password: 'admin123',
    profile: {
      id: 'admin-123',
      email: 'admin@demo.com',
      full_name: 'Administrador',
      role: 'admin',
      is_admin: true
    }
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('rutas-vivas-user')
    const savedProfile = localStorage.getItem('rutas-vivas-profile')
    
    if (savedUser && savedProfile) {
      setUser(JSON.parse(savedUser))
      setProfile(JSON.parse(savedProfile))
    }
  }, [])

  // Mock login function
  const login = async (email, password) => {
    setLoading(true)
    setError(null)
    
    try {
      const mockUser = MOCK_USERS[email]
      
      if (!mockUser || mockUser.password !== password) {
        throw new Error('Credenciales inválidas')
      }
      
      setUser(mockUser)
      setProfile(mockUser.profile)
      
      // Save to localStorage
      localStorage.setItem('rutas-vivas-user', JSON.stringify(mockUser))
      localStorage.setItem('rutas-vivas-profile', JSON.stringify(mockUser.profile))
      
      return { user: mockUser, profile: mockUser.profile, error: null }
    } catch (err) {
      setError(err.message)
      return { user: null, profile: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Mock logout function
  const logout = async () => {
    setUser(null)
    setProfile(null)
    localStorage.removeItem('rutas-vivas-user')
    localStorage.removeItem('rutas-vivas-profile')
    return { error: null }
  }

  const value = {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: profile?.is_admin || false,
    hasRole: (role) => profile?.role === role,
    role: profile?.role || null,
    login,
    logout,
    signOut: logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Custom hooks for specific roles
export const useAdmin = () => {
  const { isAdmin, ...auth } = useAuth()
  return { ...auth, isAdmin }
}

export const useRole = (requiredRole) => {
  const { hasRole, role, ...auth } = useAuth()
  return { 
    ...auth, 
    hasRequiredRole: hasRole(requiredRole),
    currentRole: role
  }
}
