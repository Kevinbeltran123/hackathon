// Authentication and role management with Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Role types
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin'
}

// User profile structure
export const createUserProfile = async (user, role = ROLES.USER) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      {
        id: user.id,
        email: user.email,
        role: role,
        is_admin: role === ROLES.ADMIN,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating user profile:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// Get user profile with role
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// Update user role (admin only)
export const updateUserRole = async (userId, newRole) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      role: newRole,
      is_admin: newRole === ROLES.ADMIN,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user role:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// Check if user has admin role
export const isAdmin = (userProfile) => {
  return userProfile?.is_admin === true || userProfile?.role === ROLES.ADMIN
}

// Check if user has specific role
export const hasRole = (userProfile, requiredRole) => {
  return userProfile?.role === requiredRole
}

// Get current user with profile
export const getCurrentUser = async () => {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { user: null, profile: null, error: authError }
  }

  const { data: profile, error: profileError } = await getUserProfile(user.id)
  
  return { 
    user, 
    profile, 
    error: profileError 
  }
}

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Auth state change listener
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const { data: profile } = await getUserProfile(session.user.id)
      callback({ user: session.user, profile, event })
    } else {
      callback({ user: null, profile: null, event })
    }
  })
}
