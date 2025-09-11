import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getActivity } from '../lib/api.js'
import { useRoute } from '../store/store.js'

export default function ActivityPublic(){
  const { id } = useParams()
  const [act, setAct] = useState(null)
  const { addItem } = useRoute()

  useEffect(()=>{
    getActivity(id).then(setAct)
  },[id])

  if (!act) return <div className="p-4">Cargando…</div>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-semibold">{act.title}</h2>
      <div className="text-sm text-gray-600">{act.place_name} • {act.duration} min • {act.benefit_text || 'Sin beneficio'}</div>
      <button className="mt-3 bg-brand-green text-white px-4 py-2 rounded" onClick={()=> addItem({ type:'activity', id:act.id, title:act.title, place_id:act.place_id, place_name:act.place_name, duration:act.duration, lat:act.lat, lng:act.lng })}>Agregar a mi ruta</button>
      <div className="mt-6 text-xs text-gray-500">Abierto: {act.time_start}-{act.time_end} • Barrio: {act.barrio}</div>
    </div>
  )
}
