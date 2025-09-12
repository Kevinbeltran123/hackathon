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
import RouteLegend from '../components/RouteLegend.jsx'

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
  const [showRouteLegend, setShowRouteLegend] = useState(false);
  const { sendCompletionNotifications } = useMissionNotificationSender();

  // Aplicar filtros iniciales al cargar
  useEffect(() => {
    console.log('Applying initial filters:', activeFilters);
    applyAdvancedFilters(activeFilters);
    
    // Fallback temporal: cargar lugares básicos si no hay resultados
    setTimeout(() => {
      if (filteredPlaces.length === 0) {
        console.log('No filtered places after 2 seconds, loading basic places...');
        getPlaces({
          lat: IBAGUE_CENTER.lat, 
          lng: IBAGUE_CENTER.lng, 
          radius: 3000
        }).then(places => {
          console.log('Basic places loaded:', places.length);
          setPlaces(places);
        });
      }
    }, 2000);
  }, []);

  // Cargar lugares usando el sistema de filtros avanzado con APIs externas
  const applyAdvancedFilters = async (filters) => {
    try {
      console.log('Applying filters with enhanced search:', filters);
      
      // Try enhanced search first
      const response = await fetch('/api/places/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interests: filters.interests,
          time: filters.time,
          radius: filters.radius,
          lat: IBAGUE_CENTER.lat,
          lng: IBAGUE_CENTER.lng,
          user_id: userId // Include user_id for preferences
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Enhanced API Response:', data);
        setFilteredPlaces(data.places || []);
        setActiveFilters(filters);
        setShowRadiusCircle(true);
        
        // Show sources info
        if (data.sources) {
          console.log(`Found ${data.sources.enhanced} enhanced places, ${data.sources.local} local places`);
        }
        
        // Actualizar tiempo basado en estimación
        if (data.estimatedTime) {
          setTimeLeft(Math.max(0, filters.time * 60 - data.estimatedTime));
        }
      } else {
        console.error('Enhanced API Error:', response.status, response.statusText);
        
        // Fallback to regular filtered endpoint
        const fallbackResponse = await fetch('/api/places/filtered', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            interests: filters.interests,
            time: filters.time,
            radius: filters.radius,
            lat: IBAGUE_CENTER.lat,
            lng: IBAGUE_CENTER.lng,
            user_id: userId
          })
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          console.log('Fallback API Response:', fallbackData);
          setFilteredPlaces(fallbackData.places || []);
          setActiveFilters(filters);
          setShowRadiusCircle(true);
          
          if (fallbackData.estimatedTime) {
            setTimeLeft(Math.max(0, filters.time * 60 - fallbackData.estimatedTime));
          }
        }
      }
    } catch (error) {
      console.error('Error applying filters:', error);
      // Final fallback al sistema anterior
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
      console.log('No filtered places, trying fallback with prefs:', prefs);
      getPlaces({lat:center.lat, lng:center.lng, tags: prefs.tags.join(','), radius: prefs.radius}).then(places => {
        console.log('Fallback places loaded:', places.length);
        setPlaces(places);
      });
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
    <div className="grid lg:grid-cols-3 h-[calc(100vh-80px)] relative">
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
          {console.log('Rendering CategorizedMarkers with places:', filteredPlaces.length, filteredPlaces)}
          <CategorizedMarkers 
            places={filteredPlaces.length > 0 ? filteredPlaces : places} 
            onPlaceClick={handleCategorizedPlaceClick}
            selectedInterests={activeFilters.interests}
          />
          
          {/* Marcadores tradicionales (fallback) - solo si no hay lugares filtrados */}
          {filteredPlaces.length === 0 && places.map(p => (
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
      <div className="bg-gradient-to-br from-brand-ocobo-light/10 to-brand-forest-green/10 border-l border-brand-ocobo-pink/20 flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-brand-ocobo-pink/20 bg-gradient-to-r from-brand-ocobo-pink/10 to-brand-forest-green/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Mi Ruta</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilterPanel(true)}
                className="px-4 py-2 bg-gradient-to-r from-brand-ocobo-pink to-brand-forest-green text-white text-sm rounded-lg hover:shadow-glow-ocobo transition-all duration-200 flex items-center gap-2"
                title="Personalizar experiencia"
              >
                <span>🎯</span>
                <span>Filtros</span>
              </button>
              <button
                onClick={() => setShowRouteLegend(true)}
                className="px-4 py-2 bg-gradient-to-r from-brand-amber-gold to-brand-sunset-orange text-white text-sm rounded-lg hover:shadow-glow-gold transition-all duration-200 flex items-center gap-2"
                title="Ver leyenda de rutas"
              >
                <span>🗺️</span>
                <span>Leyenda</span>
              </button>
              <MissionsBadge 
                userId={userId} 
                onClick={() => setShowMissionsPanel(true)} 
              />
            </div>
          </div>
          
          {/* Resumen de filtros activos */}
          <div className="p-4 bg-gradient-to-r from-brand-ocobo-light/20 to-brand-forest-green/20 rounded-xl border border-brand-ocobo-pink/30 shadow-glow-ocobo">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-brand-ocobo-dark">
                📍 Centro de Ibagué • {activeFilters.radius/1000}km radio
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-brand-forest-green font-semibold">⏰ {activeFilters.time}h</span>
                <span className="text-brand-ocobo-pink font-semibold">📍 {(filteredPlaces.length > 0 ? filteredPlaces : places).length}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeFilters.interests.map(interest => (
                <span key={interest} className="px-3 py-1 bg-gradient-to-r from-brand-ocobo-pink to-brand-forest-green text-white rounded-full text-xs font-medium shadow-soft">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Time Progress */}
        <div className="p-4 border-b border-brand-ocobo-pink/20">
          <div className="flex items-center justify-between text-sm text-brand-ocobo-dark mb-2">
            <span>Tiempo restante</span>
            <span className="font-semibold text-brand-forest-green">{timeLeft} min</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill-ocobo" 
              style={{ width: `${Math.max(0, (timeLeft / (activeFilters.time * 60)) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Route Timeline */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-semibold text-brand-ocobo-dark mb-3">📍 Tu ruta</h4>
              {items.map((it, idx) => (
                <div key={idx} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-brand-ocobo-light/20 to-brand-forest-green/20 rounded-xl border border-brand-ocobo-pink/30 hover:shadow-glow-ocobo transition-all duration-200">
                  <div className="w-8 h-8 bg-gradient-to-r from-brand-ocobo-pink to-brand-forest-green rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-soft">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-brand-ocobo-dark truncate">{it.title || it.name}</div>
                    <div className="text-xs text-brand-ocobo-dark/70">{it.place_name || ''}</div>
                    <div className="text-xs text-brand-forest-green font-medium">Duración: {it.duration || it.base_duration} min</div>
                  </div>
                  <button 
                    onClick={() => removeAt(idx)}
                    className="text-brand-ocobo-pink hover:text-red-600 text-lg hover:scale-110 transition-all duration-200"
                    title="Eliminar del timeline"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🗺️</span>
              </div>
              <div className="text-gray-500 text-sm mb-4">Tu ruta aparecerá aquí conforme agregues lugares</div>
              <button 
                onClick={addNearby}
                className="btn-accent text-sm py-2 px-4"
              >
                Añadir algo cerca ahora
              </button>
            </div>
          )}

          {/* Sugerencias cercanas */}
          {cands.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-brand-ocobo-dark mb-3">💡 Sugerencias cercanas</h4>
              <div className="space-y-3">
                {cands.map(c => (
                  <div key={c.id} className="p-3 bg-gradient-to-r from-brand-ocobo-light/20 to-brand-forest-green/20 border border-brand-ocobo-pink/30 rounded-xl hover:shadow-glow-ocobo transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-brand-ocobo-dark text-sm">{c.title}</div>
                        <div className="text-xs text-brand-ocobo-dark/70">{c.place_name} • {c.duration} min</div>
                        {c.benefit_text && (
                          <div className="text-xs text-brand-forest-green mt-1">{c.benefit_text}</div>
                        )}
                      </div>
                      <button 
                        className="bg-gradient-to-r from-brand-ocobo-pink to-brand-forest-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-glow-ocobo transform hover:scale-105 transition-all duration-200" 
                        onClick={() => insertActivity(c)}
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
        userId={userId}
      />
      
      {/* Route Legend */}
      <RouteLegend 
        isVisible={showRouteLegend}
        onClose={() => setShowRouteLegend(false)}
      />
      
      {/* Floating Filter Button for Mobile */}
      <button
        onClick={() => setShowFilterPanel(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-brand-ocobo-pink to-brand-forest-green text-white rounded-full shadow-glow-ocobo hover:shadow-glow-ocobo-lg transform hover:scale-110 transition-all duration-200 flex items-center justify-center text-2xl z-50 lg:hidden"
        title="Personalizar experiencia turística"
      >
        <span>🎯</span>
      </button>
    </div>
  )
}
