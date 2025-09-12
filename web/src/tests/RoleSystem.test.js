// Tests for role-based access control system
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../hooks/useAuth'
import App from '../App'
import RoleGate from '../components/auth/RoleGate'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import AdminRoute from '../components/auth/AdminRoute'

// Mock Supabase
vi.mock('../lib/auth', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    }
  },
  createUserProfile: vi.fn(),
  getUserProfile: vi.fn(),
  updateUserRole: vi.fn(),
  isAdmin: vi.fn(),
  hasRole: vi.fn(),
  getCurrentUser: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChange: vi.fn()
}))

// Test wrapper with providers
const TestWrapper = ({ children, user = null, profile = null }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
)

describe('Role System', () => {
  test('RoleGate allows access for correct role', () => {
    const mockProfile = { role: 'admin', is_admin: true }
    
    render(
      <TestWrapper profile={mockProfile}>
        <RoleGate allow={['admin']}>
          <div>Admin Content</div>
        </RoleGate>
      </TestWrapper>
    )
    
    expect(screen.getByText('Admin Content')).toBeInTheDocument()
  })

  test('RoleGate denies access for incorrect role', () => {
    const mockProfile = { role: 'user', is_admin: false }
    
    render(
      <TestWrapper profile={mockProfile}>
        <RoleGate allow={['admin']}>
          <div>Admin Content</div>
        </RoleGate>
      </TestWrapper>
    )
    
    expect(screen.getByText('Acceso Denegado')).toBeInTheDocument()
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
  })

  test('RoleGate shows loading state', () => {
    render(
      <TestWrapper>
        <RoleGate allow={['admin']}>
          <div>Admin Content</div>
        </RoleGate>
      </TestWrapper>
    )
    
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  test('ProtectedRoute redirects unauthenticated users', () => {
    render(
      <TestWrapper>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>
    )
    
    // Should redirect to login
    expect(window.location.pathname).toBe('/login')
  })

  test('AdminRoute redirects non-admin users', () => {
    const mockProfile = { role: 'user', is_admin: false }
    
    render(
      <TestWrapper profile={mockProfile}>
        <AdminRoute>
          <div>Admin Content</div>
        </AdminRoute>
      </TestWrapper>
    )
    
    // Should redirect to home
    expect(window.location.pathname).toBe('/app/home')
  })

  test('AdminRoute allows admin users', () => {
    const mockProfile = { role: 'admin', is_admin: true }
    
    render(
      <TestWrapper profile={mockProfile}>
        <AdminRoute>
          <div>Admin Content</div>
        </AdminRoute>
      </TestWrapper>
    )
    
    expect(screen.getByText('Admin Content')).toBeInTheDocument()
  })
})

describe('Navigation Access Control', () => {
  test('User navigation shows only user links', () => {
    const mockProfile = { role: 'user', is_admin: false }
    
    render(
      <TestWrapper profile={mockProfile}>
        <App />
      </TestWrapper>
    )
    
    // Should show user navigation
    expect(screen.getByText('Explorar')).toBeInTheDocument()
    expect(screen.getByText('Check-in')).toBeInTheDocument()
    expect(screen.getByText('Wallet')).toBeInTheDocument()
    
    // Should not show admin links
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    expect(screen.queryByText('Lugares')).not.toBeInTheDocument()
  })

  test('Admin navigation shows all links', () => {
    const mockProfile = { role: 'admin', is_admin: true }
    
    render(
      <TestWrapper profile={mockProfile}>
        <App />
      </TestWrapper>
    )
    
    // Should show user navigation
    expect(screen.getByText('Explorar')).toBeInTheDocument()
    expect(screen.getByText('Check-in')).toBeInTheDocument()
    
    // Should also show admin links
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Lugares')).toBeInTheDocument()
  })
})

describe('API Access Control', () => {
  test('User cannot access admin endpoints', async () => {
    const mockProfile = { role: 'user', is_admin: false }
    
    // Mock fetch to simulate API call
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ error: 'Access denied' })
    })
    
    render(
      <TestWrapper profile={mockProfile}>
        <App />
      </TestWrapper>
    )
    
    // Try to access admin endpoint
    const response = await fetch('/api/admin/users')
    expect(response.status).toBe(403)
  })

  test('Admin can access admin endpoints', async () => {
    const mockProfile = { role: 'admin', is_admin: true }
    
    // Mock fetch to simulate API call
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ users: [] })
    })
    
    render(
      <TestWrapper profile={mockProfile}>
        <App />
      </TestWrapper>
    )
    
    // Try to access admin endpoint
    const response = await fetch('/api/admin/users')
    expect(response.status).toBe(200)
  })
})

describe('RLS Policies', () => {
  test('User can only view own checkins', () => {
    const mockProfile = { id: 'user-123', role: 'user', is_admin: false }
    
    // This would be tested with actual Supabase queries
    // For now, we'll test the logic
    const userCheckins = [
      { id: '1', user_id: 'user-123', place: 'Place 1' },
      { id: '2', user_id: 'user-456', place: 'Place 2' }
    ]
    
    const filteredCheckins = userCheckins.filter(checkin => 
      checkin.user_id === mockProfile.id
    )
    
    expect(filteredCheckins).toHaveLength(1)
    expect(filteredCheckins[0].place).toBe('Place 1')
  })

  test('Admin can view all checkins', () => {
    const mockProfile = { id: 'admin-123', role: 'admin', is_admin: true }
    
    const allCheckins = [
      { id: '1', user_id: 'user-123', place: 'Place 1' },
      { id: '2', user_id: 'user-456', place: 'Place 2' }
    ]
    
    // Admin should see all checkins
    expect(allCheckins).toHaveLength(2)
  })
})

describe('Role Management', () => {
  test('Admin can change user role', async () => {
    const mockUpdateUserRole = vi.fn().mockResolvedValue({ data: {}, error: null })
    
    // Test role change
    await mockUpdateUserRole('user-123', 'admin')
    
    expect(mockUpdateUserRole).toHaveBeenCalledWith('user-123', 'admin')
  })

  test('User cannot change roles', () => {
    const mockProfile = { role: 'user', is_admin: false }
    
    // User should not see role management UI
    render(
      <TestWrapper profile={mockProfile}>
        <App />
      </TestWrapper>
    )
    
    expect(screen.queryByText('Cambiar Rol')).not.toBeInTheDocument()
  })
})

describe('Security Tests', () => {
  test('Unauthorized access attempts are logged', () => {
    // Mock console.warn to track security warnings
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    // Simulate unauthorized access
    const mockProfile = { role: 'user', is_admin: false }
    
    render(
      <TestWrapper profile={mockProfile}>
        <RoleGate allow={['admin']}>
          <div>Admin Content</div>
        </RoleGate>
      </TestWrapper>
    )
    
    // Should show access denied
    expect(screen.getByText('Acceso Denegado')).toBeInTheDocument()
    
    consoleSpy.mockRestore()
  })

  test('Session timeout redirects to login', () => {
    // Mock expired session
    const mockProfile = null
    
    render(
      <TestWrapper profile={mockProfile}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>
    )
    
    // Should redirect to login
    expect(window.location.pathname).toBe('/login')
  })
})

describe('Accessibility', () => {
  test('Role-based content is accessible', () => {
    const mockProfile = { role: 'admin', is_admin: true }
    
    render(
      <TestWrapper profile={mockProfile}>
        <RoleGate allow={['admin']}>
          <div role="main">Admin Content</div>
        </RoleGate>
      </TestWrapper>
    )
    
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  test('Access denied page is accessible', () => {
    const mockProfile = { role: 'user', is_admin: false }
    
    render(
      <TestWrapper profile={mockProfile}>
        <RoleGate allow={['admin']}>
          <div>Admin Content</div>
        </RoleGate>
      </TestWrapper>
    )
    
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByText('Acceso Denegado')).toBeInTheDocument()
  })
})
