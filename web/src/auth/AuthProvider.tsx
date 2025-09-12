import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  full_name: string
  role: 'usuario' | 'business_owner'
  is_admin: boolean
  business_id?: string
  avatar?: string
  phone?: string
}

interface Session {
  user: User
}

interface AuthContextType {
  loading: boolean
  session: Session | null
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  isBusinessOwner: boolean
  isUser: boolean
  login: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>
  logout: () => Promise<{ error: string | null }>
  signOut: () => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for demo
const MOCK_USERS = {
  'usuario@demo.com': {
    id: 'user-123',
    email: 'usuario@demo.com',
    password: 'password123',
    full_name: 'Ana Martínez',
    role: 'usuario',
    is_admin: false,
    avatar: '👩‍🦱',
    phone: '+57 300 123 4567'
  },
  'empresario@demo.com': {
    id: 'business-123',
    email: 'empresario@demo.com',
    password: 'business123',
    full_name: 'Carlos Rodríguez',
    role: 'business_owner',
    is_admin: true,
    business_id: 'business-001',
    avatar: '👨‍💼',
    phone: '+57 310 987 6543'
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)

  // Check for existing session on mount
  useEffect(() => {
    let mounted = true

    const checkSession = async () => {
      try {
        const savedUser = localStorage.getItem('rutas-vivas-user')
        const savedProfile = localStorage.getItem('rutas-vivas-profile')
        
        if (savedUser && savedProfile && mounted) {
          const userData = JSON.parse(savedUser)
          const profileData = JSON.parse(savedProfile)
          
          setUser(userData)
          setSession({ user: userData })
        }
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    checkSession()

    return () => {
      mounted = false
    }
  }, [])

  // Mock login function
  const login = async (email: string, password: string) => {
    try {
      const mockUser = MOCK_USERS[email as keyof typeof MOCK_USERS]
      
      if (!mockUser || mockUser.password !== password) {
        return { user: null, error: 'Credenciales inválidas' }
      }
      
      setUser(mockUser)
      setSession({ user: mockUser })
      
      // Save to localStorage
      localStorage.setItem('rutas-vivas-user', JSON.stringify(mockUser))
      localStorage.setItem('rutas-vivas-profile', JSON.stringify(mockUser))
      
      return { user: mockUser, error: null }
    } catch (error) {
      return { user: null, error: 'Error en el login' }
    }
  }

  // Mock logout function
  const logout = async () => {
    try {
      setUser(null)
      setSession(null)
      localStorage.removeItem('rutas-vivas-user')
      localStorage.removeItem('rutas-vivas-profile')
      return { error: null }
    } catch (error) {
      return { error: 'Error en el logout' }
    }
  }

  const signOut = logout

  const value: AuthContextType = {
    loading,
    session,
    user,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin || false,
    isBusinessOwner: user?.role === 'business_owner' || false,
    isUser: user?.role === 'usuario' || false,
    login,
    logout,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
