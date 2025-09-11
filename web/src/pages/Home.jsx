import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePrefs } from '../store/store.js'

export default function Home(){
  const nav = useNavigate()
  const { prefs, setPrefs } = usePrefs()
  const [local, setLocal] = useState(prefs)

  function createRoute(){
    setPrefs(local)
    nav('/explore')
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Crea tu día en Ibagué</h1>
      <p className="text-gray-600 mb-6">Rutas dinámicas con micro‑actividades cercanas para apoyar el comercio local.</p>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm mb-1">Tiempo disponible (min)</label>
          <input className="border rounded px-3 py-2 w-full" type="number" min="60" max="420" value={local.time} onChange={e=>setLocal({...local, time: Number(e.target.value)})}/>
          <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
            <button className="border rounded py-1" onClick={()=>setLocal({...local,time:120})}>2h</button>
            <button className="border rounded py-1" onClick={()=>setLocal({...local,time:180})}>3h</button>
            <button className="border rounded py-1" onClick={()=>setLocal({...local,time:240})}>4h</button>
          </div>

          <label className="block text-sm mt-4 mb-1">Intereses</label>
          <div className="flex flex-wrap gap-2">
            {['cultura','gastro','artesania','naturaleza','musica'].map(t => {
              const on = local.tags.includes(t)
              return <button key={t} className={`px-3 py-1 rounded border ${on?'bg-brand-amber/20 border-brand-amber':'bg-white'}`} onClick={()=> {
                const has = local.tags.includes(t)
                setLocal({...local, tags: has? local.tags.filter(x=>x!==t): [...local.tags, t]})
              }}>{t}</button>
            })}
          </div>

          <label className="block text-sm mt-4 mb-1">Radio de caminata máx. (m)</label>
          <input className="border rounded px-3 py-2 w-full" type="number" min="400" max="2500" step="100" value={local.radius} onChange={e=>setLocal({...local, radius: Number(e.target.value)})} />

          <button onClick={createRoute} className="mt-6 bg-brand-blue text-white px-4 py-2 rounded-lg">Crear ruta</button>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold mb-2">¿Cómo funciona?</h3>
          <ol className="list-decimal ml-5 text-sm text-gray-700 space-y-1">
            <li>Ingresa tus preferencias y tiempo.</li>
            <li>Te sugerimos una ruta base cerca de ti.</li>
            <li>Con <b>“Añadir algo cerca”</b> inserta micro‑actividades de 10–30 min.</li>
            <li>Escanea QR en comercios para sumarlos al instante.</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
