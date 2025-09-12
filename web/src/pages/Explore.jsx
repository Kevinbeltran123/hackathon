import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import '../styles/missions.css'
import '../styles/routes.css'
import '../styles/filters.css'
import { getPlaces, getActivities, postCheckin } from '../lib/api.js'
import { usePrefs, useRoute } from '../store/store.js'
import TourGuideChat from '../components/TourGuideChat.jsx'
import MissionsBadge from '../components/MissionsBadge.jsx'
import MissionsPanel from '../components/MissionsPanel.jsx'
import MissionNotifications, { useMissionNotificationSender } from '../components/MissionNotifications.jsx'
import RouteManager from '../components/RouteManager.jsx'
import AdvancedFilterPanel from '../components/AdvancedFilterPanel.jsx'
import RadiusCircle from '../components/RadiusCircle.jsx'
import CategorizedMarkers from '../components/CategorizedMarkers.jsx'

const IBAGUE_CENTER = { lat: 4.4399, lng: -75.2050 }; // Coordenadas fijas del centro de Ibagué

export default function Explore(){
  const { prefs } = usePrefs()
  const { items, addItem, removeAt } = useRoute()
  const [center] = useState(IBAGUE_CENTER) // Centro fijo de Ibagué
  const [places, setPlaces] = useState([])
  const [filteredPlaces, setFilteredPlaces] = useState([])
  const [cands, setCands] = useState([])
  const [timeLeft, setTimeLeft] = useState(prefs.time)
  
  // Estados para el sistema de filtrado avanzado
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [activeFilters, setActiveFilters] = useState(() => {
    const saved = localStorage.getItem('rutasVivas_filters')
    return saved ? JSON.parse(saved) : {
      interests: ['gastro', 'cultura'],
      time: 3,
      radius: 2000,
      center: IBAGUE_CENTER
    }
  })
  const [showRadiusCircle, setShowRadiusCircle] = useState(false)
  
  // Estados del sistema de misiones
  const [userId] = useState(() => {
    // Crear o recuperar user ID para el demo
    let storedUserId = localStorage.getItem('demo_user_id');
    if (!storedUserId) {
      storedUserId = `demo_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('demo_user_id', storedUserId);
    }
    return storedUserId;
  });
  const [showMissionsPanel, setShowMissionsPanel] = useState(false);
  const { sendCompletionNotifications } = useMissionNotificationSender();

  // Aplicar filtros iniciales al cargar
  useEffect(() => {
    applyAdvancedFilters(activeFilters);
  }, []);

  // Cargar lugares usando el sistema de filtros avanzado
  const applyAdvancedFilters = async (filters) => {
    try {
      const response = await fetch('/api/places/filtered', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interests: filters.interests,
          time: filters.time,
          radius: filters.radius,
          lat: IBAGUE_CENTER.lat,
          lng: IBAGUE_CENTER.lng
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFilteredPlaces(data.places || []);
        setActiveFilters(filters);
        setShowRadiusCircle(true);
        
        // Actualizar tiempo basado en estimación
        if (data.estimatedTime) {
          setTimeLeft(Math.max(0, filters.time * 60 - data.estimatedTime));
        }
      }
    } catch (error) {
      console.error('Error applying filters:', error);
      // Fallback al sistema anterior
      getPlaces({
        lat: center.lat, 
        lng: center.lng, 
        tags: activeFilters.interests.join(','), 
        radius: activeFilters.radius
      }).then(setPlaces);
    }
  };

  // Mantener compatibilidad con el sistema anterior
  useEffect(()=>{
    if (filteredPlaces.length === 0) {
      getPlaces({lat:center.lat, lng:center.lng, tags: prefs.tags.join(','), radius: prefs.radius}).then(setPlaces)
    }
  }, [center, prefs, filteredPlaces.length])

  // Hacer removeAt disponible globalmente para RouteManager
  useEffect(() => {
    window.removeTimelineItem = removeAt;
    return () => {
      delete window.removeTimelineItem;
    };
  }, [removeAt]);

  function addNearby(){
    getActivities({lat:center.lat, lng:center.lng, tags: prefs.tags.join(','), time_left: timeLeft, pref_tags: prefs.tags.join(',')}).then(setCands)
  }

  function insertActivity(a){
    addItem({ type:'activity', id:a.id, title:a.title, place_id:a.place_id, place_name:a.place_name, duration:a.duration, lat:a.lat, lng:a.lng })
    setTimeLeft(t => Math.max(0, t - a.duration - 10)) // -10 min caminata simplificada
  }

  // Manejar clics en marcadores categorizados
  const handleCategorizedPlaceClick = (place, action = 'view') => {
    if (action === 'add') {
      // Agregar lugar directamente al timeline
      addItem({
        type: 'place',
        id: place.id,
        title: place.name,
        name: place.name,
        place_id: place.id,
        place_name: place.name,
        duration: place.base_duration || 30,
        lat: place.lat,
        lng: place.lng,
        barrio: place.barrio,
        tags: place.tags
      });
      
      // Actualizar tiempo disponible
      setTimeLeft(t => Math.max(0, t - (place.base_duration || 30) - 10));
    }
  };

  // Función para hacer check-in con misiones
  async function handleCheckIn(placeId, activityId = null) {
    try {
      const checkInResult = await postCheckin({
        user_id: userId,
        place_id: placeId,
        activity_id: activityId
      });

      if (checkInResult.ok && checkInResult.missions) {
        const { completed, unlocked } = checkInResult.missions;
        
        // Enviar notificaciones si hay misiones completadas o desbloqueadas
        if (completed?.length > 0 || unlocked?.length > 0) {
          sendCompletionNotifications(completed, unlocked);
        }
      }

      return checkInResult;
    } catch (error) {
      console.error('Error doing check-in:', error);
      return { ok: false, error: error.message };
    }
  }

  return (
    <div className="grid lg:grid-cols-3 h-[calc(100vh-120px)] relative">
      <div className="lg:col-span-2">
        <MapContainer center={[center.lat, center.lng]} zoom={14} style={{height:'100%'}}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <RouteManager items={items} />
          
          {/* Círculo de radio de caminata */}
          <RadiusCircle 
            center={IBAGUE_CENTER} 
            radius={activeFilters.radius} 
            visible={showRadiusCircle} 
          />
          
          {/* Marcadores categorizados con filtros aplicados */}
          <CategorizedMarkers 
            places={filteredPlaces} 
            onPlaceClick={handleCategorizedPlaceClick}
            selectedInterests={activeFilters.interests}
          />
          
          {/* Marcadores tradicionales (fallback) */}
          {places.map(p => (
            <Marker key={`traditional-${p.id}`} position={[p.lat,p.lng]}>
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-gray-600">{p.barrio} • {p.tags.join(', ')}</div>
                  <div>Duración: {p.base_duration} min</div>
                  {p.verified && (
                    <div className="text-xs text-green-600 font-medium">✓ Verificado</div>
                  )}
                  <button 
                    onClick={() => handleCheckIn(p.id)}
                    className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded transition-colors"
                  >
                    🎯 Check-in + Misiones
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div className="bg-white border-l p-3 overflow-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Mi Ruta</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilterPanel(true)}
              className="px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-1"
              title="Personalizar experiencia"
            >
              <span>🎯</span>
              <span>Filtros</span>
            </button>
            <MissionsBadge 
              userId={userId} 
              onClick={() => setShowMissionsPanel(true)} 
            />
          </div>
        </div>
        
        {/* Resumen de filtros activos */}
        <div className="mb-3 p-2 bg-blue-50 rounded-lg text-xs">
          <div className="font-medium text-blue-800 mb-1">
            📍 Desde Centro de Ibagué • {activeFilters.radius/1000}km radio
          </div>
          <div className="flex flex-wrap gap-1">
            {activeFilters.interests.map(interest => (
              <span key={interest} className="px-1.5 py-0.5 bg-blue-200 text-blue-800 rounded text-xs">
                {interest}
              </span>
            ))}
          </div>
          <div className="text-blue-600 mt-1">
            ⏰ {activeFilters.time}h disponible • {filteredPlaces.length} lugares encontrados
          </div>
        </div>
        
        <div className="text-xs text-gray-600 mb-2">Tiempo restante: <b>{timeLeft} min</b></div>

        <div className="mt-2 space-y-2">
          {items.map((it, idx)=> (
            <div key={idx} className="border rounded-lg p-2 route-timeline-item">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium">{idx + 1}. {it.title || it.name}</div>
                  <div className="text-xs text-gray-600">{it.place_name || ''}</div>
                  <div className="text-xs">Duración: {it.duration || it.base_duration} min</div>
                </div>
                <button 
                  onClick={() => removeAt(idx)}
                  className="text-red-500 hover:text-red-700 text-sm ml-2"
                  title="Eliminar del timeline"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              🗺️ Tu ruta aparecerá aquí conforme agregues lugares
            </div>
          )}
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
      
      {/* Missions System */}
      <MissionsPanel 
        userId={userId}
        isOpen={showMissionsPanel}
        onClose={() => setShowMissionsPanel(false)}
      />
      
      {/* Mission Notifications */}
      <MissionNotifications />
      
      {/* Advanced Filter Panel */}
      <AdvancedFilterPanel
        isOpen={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        onFiltersApply={applyAdvancedFilters}
        initialFilters={activeFilters}
      />
      
      {/* Floating Filter Button for Mobile */}
      <button
        onClick={() => setShowFilterPanel(true)}
        className="floating-filter-btn lg:hidden"
        title="Personalizar experiencia turística"
      >
        <span>🎯</span>
      </button>
    </div>
  )
}
