
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './index.css'
import Home from './pages/Home.jsx'
import Explore from './pages/Explore.jsx'
import Profile from './pages/Profile.jsx'
import ActivityPublic from './pages/ActivityPublic.jsx'
import AdminLogin from './pages/admin/Login.jsx'
import AgencyRegister from "./pages/AgencyRegister.jsx"
import AgencyVerify from "./pages/AgencyVerify.jsx"
import AdminActivities from './pages/admin/Activities.jsx'

function AppShell({children}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="gradient-primary shadow-lg flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl">🌸</span>
            </div>
            <div className="text-white">
              <h1 className="font-bold text-xl">Rutas <span className="text-yellow-300">VIVAS</span></h1>
              <p className="text-xs text-blue-100">Tolima</p>
            </div>
          </Link>
          <nav className="flex items-center space-x-2">
            <Link 
              to="/explore" 
              className="px-4 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200 font-medium"
            >
              🗺️ Explorar
            </Link>
            <Link 
              to="/agencies" 
              className="px-4 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200 font-medium"
            >
              🏢 Agencias
            </Link>
            <Link 
              to="/profile" 
              className="px-4 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200 font-medium"
            >
              👤 Perfil
            </Link>
            <a 
              href="/#/admin/login" 
              className="px-4 py-2 bg-white bg-opacity-20 text-white hover:bg-opacity-30 rounded-lg transition-all duration-200 font-medium"
            >
              ⚙️ Panel
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AppShell>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/explore" element={<Explore/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/activity/:id" element={<ActivityPublic/>} />
        <Route path="/agencies" element={<AgencyRegister/>} />
        <Route path="/agencies/verify/:id" element={<AgencyVerify/>} />
        <Route path="/admin/login" element={<AdminLogin/>} />
        <Route path="/admin/activities" element={<AdminActivities/>} />
      </Routes>
    </AppShell>
  </BrowserRouter>
)
