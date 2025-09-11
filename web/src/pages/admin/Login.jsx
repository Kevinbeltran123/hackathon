import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../../lib/api.js'
import { useAuth } from '../../store/store.js'

export default function AdminLogin(){
  const nav = useNavigate()
  const { setAuth } = useAuth()
  const [email, setEmail] = useState('artesano@demo.com')
  const [password, setPassword] = useState('demo123')
  const [err, setErr] = useState(null)

  async function doLogin(){
    const r = await login(email,password)
    if (r.error){ setErr('Credenciales inválidas'); return }
    setAuth(r.token, r.merchant)
    nav('/admin/activities')
  }

  return (
    <div className="max-w-sm mx-auto p-4">
      <h2 className="text-xl font-semibold mb-2">Panel de comercio</h2>
      <div className="bg-white rounded p-4 space-y-2">
        <input className="border rounded px-3 py-2 w-full" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email"/>
        <input className="border rounded px-3 py-2 w-full" value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Clave"/>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button className="bg-brand-blue text-white w-full py-2 rounded" onClick={doLogin}>Entrar</button>
      </div>
    </div>
  )
}
