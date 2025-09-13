import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../components/Header'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white text-neutral-900">
      <Header />
      <main id="content" className="relative z-0 pt-16">
        <Outlet />
      </main>
      <footer className="border-t py-6 text-sm text-neutral-600 bg-white">
        <div className="container mx-auto px-4 text-center">
          © 2024 Rutas VIVAS. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  )
}

