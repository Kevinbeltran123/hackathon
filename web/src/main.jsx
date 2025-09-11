
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './index.css'
import Home from './pages/Home.jsx'
import Explore from './pages/Explore.jsx'
import Profile from './pages/Profile.jsx'
import ActivityPublic from './pages/ActivityPublic.jsx'
import AdminLogin from './pages/admin/Login.jsx'
import AdminActivities from './pages/admin/Activities.jsx'

function AppShell({children}) {
  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg">Rutas <span className="text-brand-amber">VIVAS</span> Tolima</Link>
          <nav className="text-sm space-x-4">
            <Link to="/explore">Explorar</Link>
            <Link to="/profile">Perfil</Link>
            <a href="/#/admin/login">Panel</a>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-white border-t">
        <div className="max-w-5xl mx-auto px-4 py-4 text-xs text-gray-500">MVP Hackathon • Ibagué</div>
      </footer>
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
        <Route path="/admin/login" element={<AdminLogin/>} />
        <Route path="/admin/activities" element={<AdminActivities/>} />
      </Routes>
    </AppShell>
  </BrowserRouter>
)
