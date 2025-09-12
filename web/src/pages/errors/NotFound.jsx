// 404 Not Found page
import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-forest/5 via-white to-forest2/5 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Ocobo flower icon */}
        <div className="w-24 h-24 bg-gradient-to-r from-ocobo to-gold rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-4xl">🌸</span>
        </div>
        
        <h1 className="text-6xl font-bold text-forest mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-forest mb-4">Página no encontrada</h2>
        <p className="text-gray-600 mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        
        <div className="space-y-3">
          <Link
            to="/app/home"
            className="inline-block bg-gradient-to-r from-ocobo to-gold text-white py-3 px-6 rounded-lg font-semibold hover:shadow-glow-ocobo transition-all duration-200"
          >
            🏠 Ir al Inicio
          </Link>
          
          <div className="text-sm text-gray-500">
            <button
              onClick={() => window.history.back()}
              className="text-ocobo hover:text-ocobo/80 transition-colors"
            >
              ← Volver atrás
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
