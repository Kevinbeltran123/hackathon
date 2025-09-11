
// Haversine distance in meters
export function distanceMeters(a, b) {
  const R = 6371e3;
  const toRad = d => d * Math.PI / 180;
  const φ1 = toRad(a.lat), φ2 = toRad(b.lat);
  const Δφ = toRad(b.lat - a.lat);
  const Δλ = toRad(b.lng - a.lng);
  const sinΔφ = Math.sin(Δφ/2), sinΔλ = Math.sin(Δλ/2);
  const x = sinΔφ*sinΔφ + Math.cos(φ1)*Math.cos(φ2)*sinΔλ*sinΔλ;
  const d = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
  return R * d;
}

export function withinWindow(nowMin, startStr, endStr) {
  // nowMin e.g., minutes from 00:00
  const [sh, sm] = startStr.split(':').map(Number);
  const [eh, em] = endStr.split(':').map(Number);
  const s = sh*60 + sm, e = eh*60 + em;
  return nowMin >= s && nowMin <= e;
}

// Basic score function
export function scoreActivity({affinity, rating, benefitWeight, detourM, extraMin}) {
  const w1=1.2, w2=0.6, w3=0.4, w4=0.0012, w5=0.05;
  return (w1*affinity + w2*(rating/5) + w3*benefitWeight) - (w4*detourM + w5*extraMin);
}
