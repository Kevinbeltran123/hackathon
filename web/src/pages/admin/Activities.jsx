import React, { useEffect, useState } from 'react'
import { myActivities, toggleActivity, createActivity } from '../../lib/api.js'
import { useAuth } from '../../store/store.js'

export default function AdminActivities(){
  const { token, me } = useAuth()
  const [list, setList] = useState([])
  const [form, setForm] = useState({ title:'', duration:20, time_start:'10:00', time_end:'18:00', capacity:5, active:true, benefit_text:''})

  useEffect(()=>{
    if (token && me) {
      myActivities(token, me.place_id).then(setList)
    }
  },[token, me])

  async function doToggle(id){
    const r = await toggleActivity(token, id)
    setList(ls => ls.map(x => x.id===id? {...x, active:r.active }: x))
  }

  async function doCreate(){
    const payload = { ...form, place_id: me.place_id }
    const r = await createActivity(token, payload)
    setList([{id:r.id, ...payload}, ...list])
    setForm({ title:'', duration:20, time_start:'10:00', time_end:'18:00', capacity:5, active:true, benefit_text:''})
  }

  if (!token) return <div className="p-4">Inicia sesión…</div>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-2">Mis micro‑actividades</h2>

      <div className="bg-white rounded p-3 mb-4">
        <div className="font-medium mb-2">Nueva actividad</div>
        <div className="grid grid-cols-2 gap-2">
          <input className="border rounded px-2 py-1" placeholder="Título" value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
          <input className="border rounded px-2 py-1" type="number" placeholder="Duración (min)" value={form.duration} onChange={e=>setForm({...form, duration:Number(e.target.value)})}/>
          <input className="border rounded px-2 py-1" placeholder="Inicio (hh:mm)" value={form.time_start} onChange={e=>setForm({...form, time_start:e.target.value})}/>
          <input className="border rounded px-2 py-1" placeholder="Fin (hh:mm)" value={form.time_end} onChange={e=>setForm({...form, time_end:e.target.value})}/>
          <input className="border rounded px-2 py-1" type="number" placeholder="Cupos" value={form.capacity} onChange={e=>setForm({...form, capacity:Number(e.target.value)})}/>
          <input className="border rounded px-2 py-1" placeholder="Beneficio" value={form.benefit_text} onChange={e=>setForm({...form, benefit_text:e.target.value})}/>
          <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form, active:e.target.checked})}/> Activa</label>
        </div>
        <button className="mt-2 bg-brand-green text-white px-3 py-1 rounded" onClick={doCreate}>Publicar</button>
      </div>

      <div className="space-y-2">
        {list.map(x=> (
          <div key={x.id} className="border rounded p-2 flex items-center justify-between">
            <div>
              <div className="font-medium">{x.title}</div>
              <div className="text-xs text-gray-600">{x.time_start}-{x.time_end} • {x.duration} min • Cap: {x.capacity}</div>
            </div>
            <button className={`${x.active?'bg-red-500':'bg-emerald-600'} text-white px-3 py-1 rounded`} onClick={()=>doToggle(x.id)}>{x.active?'Desactivar':'Activar'}</button>
          </div>
        ))}
      </div>
    </div>
  )
}
