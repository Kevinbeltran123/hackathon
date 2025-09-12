import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { getPlaces, getActivities } from '../lib/api.js'
import { usePrefs, useRoute } from '../store/store.js'
import TourGuideChat from '../components/TourGuideChat.jsx'

export default function Explore(){
  const { prefs } = usePrefs()
  const { items, addItem } = useRoute()
  const [center, setCenter] = useState({lat:4.4399, lng:-75.2050}) // centro de Ibagué
  const [places, setPlaces] = useState([])
  const [cands, setCands] = useState([])
  const [timeLeft, setTimeLeft] = useState(prefs.time)

  useEffect(()=>{
    navigator.geolocation.getCurrentPosition(
      (pos)=> setCenter({lat: pos.coords.latitude, lng: pos.coords.longitude}),
      ()=> {}
    )
  },[])

  useEffect(()=>{
    getPlaces({lat:center.lat, lng:center.lng, tags: prefs.tags.join(','), radius: prefs.radius}).then(setPlaces)
  }, [center, prefs])

  function addNearby(){
    getActivities({lat:center.lat, lng:center.lng, tags: prefs.tags.join(','), time_left: timeLeft, pref_tags: prefs.tags.join(',')}).then(setCands)
  }

  function insertActivity(a){
    addItem({ type:'activity', id:a.id, title:a.title, place_id:a.place_id, place_name:a.place_name, duration:a.duration, lat:a.lat, lng:a.lng })
    setTimeLeft(t => Math.max(0, t - a.duration - 10)) // -10 min caminata simplificada
  }

  return (
    <div className="grid lg:grid-cols-3 h-[calc(100vh-120px)] relative">
      <div className="lg:col-span-2">
        <MapContainer center={[center.lat, center.lng]} zoom={15} style={{height:'100%'}}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {places.map(p => (
            <Marker key={p.id} position={[p.lat,p.lng]}>
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-gray-600">{p.barrio} • {p.tags.join(', ')}</div>
                  <div>Duración: {p.base_duration} min</div>
                  {p.verified && (
                    <div className="text-xs text-green-600 font-medium">✓ Verificado</div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div className="bg-white border-l p-3 overflow-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Timeline</h3>
          <div className="text-xs text-gray-600">Tiempo restante: <b>{timeLeft} min</b></div>
        </div>

        <div className="mt-2 space-y-2">
          {items.map((it, idx)=> (
            <div key={idx} className="border rounded-lg p-2">
              <div className="font-medium">{it.title || it.name}</div>
              <div className="text-xs text-gray-600">{it.place_name || ''}</div>
              <div className="text-xs">Duración: {it.duration || it.base_duration} min</div>
            </div>
          ))}
        </div>

        <button onClick={addNearby} className="mt-3 w-full bg-brand-amber text-white rounded-lg px-3 py-2">Añadir algo cerca ahora</button>

        {cands.length>0 && (
          <div className="mt-3">
            <h4 className="text-sm font-semibold">Sugerencias cercanas</h4>
            <div className="space-y-2 mt-2">
              {cands.map(c => (
                <div key={c.id} className="border rounded p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{c.title}</div>
                      <div className="text-xs text-gray-600">{c.place_name} • {c.duration} min</div>
                      <div className="text-xs">{c.benefit_text || ''}</div>
                    </div>
                    <button className="bg-brand-green text-white px-3 py-1 rounded" onClick={()=>insertActivity(c)}>Agregar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Tour Guide Chat */}
      <TourGuideChat userLocation={center} />
    </div>
  )
}
