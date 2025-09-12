// Register page with ocobo theme
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, createUserProfile } from '../../lib/auth'
import Toast from '../../components/profile/Toast'

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState({
    isVisible: false,
    type: 'success',
    title: '',
    message: '',
  })

  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    try {
      // Create user account
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName
          }
        }
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await createUserProfile(data.user, 'user')
        
        if (profileError) {
          console.error('Error creating profile:', profileError)
        }

        setToast({
          isVisible: true,
          type: 'success',
          title: '¡Cuenta creada!',
          message: 'Revisa tu correo para confirmar tu cuenta'
        })

        // Redirect after successful registration
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } catch (err) {
      setError('Error inesperado. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest/5 via-white to-forest2/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-ocobo to-gold rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">🌸</span>
          </div>
          <h1 className="text-3xl font-bold text-forest">Rutas VIVAS</h1>
          <p className="text-forest2">Tolima</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-glow-forest p-8 border border-forest/20">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-forest">Crear Cuenta</h2>
            <p className="text-gray-600">Únete a la comunidad de exploradores</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocobo/50 focus:border-ocobo"
                placeholder="Tu nombre completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocobo/50 focus:border-ocobo"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocobo/50 focus:border-ocobo"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar contraseña
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocobo/50 focus:border-ocobo"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-ocobo to-gold text-white py-3 px-4 rounded-lg font-semibold hover:shadow-glow-ocobo transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creando cuenta...
                </div>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="text-ocobo hover:text-ocobo/80 font-medium transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Terms */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>
            Al registrarte, aceptas nuestros{' '}
            <Link to="/terms" className="text-ocobo hover:text-ocobo/80">
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link to="/privacy" className="text-ocobo hover:text-ocobo/80">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </div>

      {/* Toast */}
      <Toast
        isVisible={toast.isVisible}
        onClose={hideToast}
        type={toast.type}
        title={toast.title}
        message={toast.message}
      />
    </div>
  )
}

export default Register
