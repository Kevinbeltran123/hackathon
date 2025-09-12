
const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function getPlaces(params={}) {
  const qs = new URLSearchParams(params).toString();
  const r = await fetch(`${API}/api/places?${qs}`);
  return r.json();
}
export async function getActivities(params={}) {
  const qs = new URLSearchParams(params).toString();
  const r = await fetch(`${API}/api/activities?${qs}`);
  return r.json();
}
export async function getActivity(id){
  const r = await fetch(`${API}/api/activity/${id}`);
  return r.json();
}
export async function postCheckin(body){
  const r = await fetch(`${API}/api/checkins`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
  return r.json();
}
export async function login(email,password){
  const r = await fetch(`${API}/api/auth/login`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email,password})});
  return r.json();
}
export async function myActivities(token, place_id){
  const r = await fetch(`${API}/api/me/activities?place_id=${place_id}`, {headers:{'Authorization':`Bearer ${token}`}});
  return r.json();
}
export async function createActivity(token, payload){
  const r = await fetch(`${API}/api/me/activities`, {method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify(payload)});
  return r.json();
}
export async function toggleActivity(token, id){
  const r = await fetch(`${API}/api/me/activities/${id}/toggle`, {method:'PATCH', headers:{'Authorization':`Bearer ${token}`}});
  return r.json();
}

// === NEW LOCATION SERVICES ===

export async function geocodeAddress(address) {
  const r = await fetch(`${API}/api/geocode?address=${encodeURIComponent(address)}`);
  return r.json();
}

export async function reverseGeocode(lat, lng) {
  const r = await fetch(`${API}/api/reverse-geocode?lat=${lat}&lng=${lng}`);
  return r.json();
}

export async function validateLocation(name, lat, lng) {
  const r = await fetch(`${API}/api/validate-location`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, lat, lng })
  });
  return r.json();
}

export async function searchPlacesByCategory(category, limit = 20) {
  const r = await fetch(`${API}/api/search-places?category=${encodeURIComponent(category)}&limit=${limit}`);
  return r.json();
}

export async function createVerifiedPlace(placeData) {
  const r = await fetch(`${API}/api/places`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(placeData)
  });
  return r.json();
}

export async function getRouteData(fromLat, fromLng, toLat, toLng, mode = 'walking') {
  const params = new URLSearchParams({
    from_lat: fromLat,
    from_lng: fromLng,
    to_lat: toLat,
    to_lng: toLng,
    mode
  });
  const r = await fetch(`${API}/api/route?${params}`);
  return r.json();
}

export async function optimizeRoute(waypoints, mode = 'walking') {
  const r = await fetch(`${API}/api/optimize-route`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ waypoints, mode })
  });
  return r.json();
}

export async function getNearbyVerified(lat, lng, radius = 2000, verifiedOnly = true) {
  const params = new URLSearchParams({
    lat,
    lng,
    radius,
    verified_only: verifiedOnly
  });
  const r = await fetch(`${API}/api/nearby-verified?${params}`);
  return r.json();
}

export async function getVerificationStats() {
  const r = await fetch(`${API}/api/admin/verification-stats`);
  return r.json();
}

// === CHAT API ===

export async function sendChatMessage(message, context = {}) {
  const r = await fetch(`${API}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      userId: context.userId,
      lat: context.lat,
      lng: context.lng,
      activeRoute: context.activeRoute
    })
  });
  return r.json();
}

export async function getChatStats() {
  const r = await fetch(`${API}/api/admin/chat-stats`);
  return r.json();
}

// === MISSIONS API ===

export async function initUserMissions(userId) {
  const r = await fetch(`${API}/api/user/${userId}/missions/init`, {
    method: 'POST'
  });
  return r.json();
}

export async function getUserMissions(userId) {
  const r = await fetch(`${API}/api/user/${userId}/missions`);
  return r.json();
}

export async function getUserBadges(userId) {
  const r = await fetch(`${API}/api/user/${userId}/badges`);
  return r.json();
}

export async function getUserStats(userId) {
  const r = await fetch(`${API}/api/user/${userId}/stats`);
  return r.json();
}

export async function getMissionsSummary(userId) {
  const r = await fetch(`${API}/api/user/${userId}/missions/summary`);
  return r.json();
}

export async function getAllMissions() {
  const r = await fetch(`${API}/api/admin/missions`);
  return r.json();
}

export async function triggerMissionProgress(userId, placeId, activityId = null) {
  const r = await fetch(`${API}/api/user/${userId}/missions/trigger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ placeId, activityId })
  });
  return r.json();
}

export { API };
