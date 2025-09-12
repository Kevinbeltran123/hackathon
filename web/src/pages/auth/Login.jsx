// Login page with ocobo theme
import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import Toast from '../../components/profile/Toast'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState({
    isVisible: false,
    type: 'success',
    title: '',
    message: '',
  })

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/app/home'

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

    try {
      const { user, error } = await login(formData.email, formData.password)

      if (error) {
        setError(error)
        return
      }

      if (user) {
        setToast({
          isVisible: true,
          type: 'success',
          title: '¡Bienvenido!',
          message: `Has iniciado sesión como ${user.role === 'business_owner' ? 'Empresario' : 'Usuario'}`
        })

        // Redirect based on role
        const redirectPath = user.role === 'business_owner' ? '/business/dashboard' : from
        setTimeout(() => {
          navigate(redirectPath, { replace: true })
        }, 1500)
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

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-glow-forest p-8 border border-forest/20">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-forest">Iniciar Sesión</h2>
            <p className="text-gray-600">Accede a tu cuenta para explorar Ibagué</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link
                to="/register"
                className="text-ocobo hover:text-ocobo/80 font-medium transition-colors"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 bg-gradient-to-r from-forest/10 to-forest2/10 rounded-lg p-4 border border-forest/20">
          <h3 className="text-sm font-semibold text-forest mb-2">Credenciales de Demo:</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Usuario:</strong> usuario@demo.com / password123</p>
            <p><strong>Empresario:</strong> empresario@demo.com / business123</p>
          </div>
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

export default Login
