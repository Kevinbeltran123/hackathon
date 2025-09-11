
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
export { API };
