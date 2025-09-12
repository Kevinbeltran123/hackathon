// Mock data for Profile components
export const mockUser = {
  id: 'user_123',
  name: 'Explorador de Ibagué',
  email: 'explorador@rutasvivas.com',
  joinDate: 'Enero 2024',
  avatar: null,
  preferences: {
    interests: ['cultura', 'gastro', 'naturaleza'],
    radius: 2000,
    time: 180,
  },
};

export const mockStats = {
  checkins: 12,
  points: 450,
  coupons: 3,
  level: 2,
  streak: 5,
  totalDistance: 15.2,
};

export const mockAchievements = [
  { id: 'first_checkin', name: 'Primer Check-in', icon: '🎯', unlocked: true },
  { id: 'explorer', name: 'Explorador', icon: '🗺️', unlocked: true },
  { id: 'local_hero', name: 'Héroe Local', icon: '🏆', unlocked: false },
  { id: 'coupon_master', name: 'Maestro de Cupones', icon: '🎫', unlocked: false },
  { id: 'nature_lover', name: 'Amante de la Naturaleza', icon: '🌿', unlocked: false },
  { id: 'culture_buff', name: 'Aficionado Cultural', icon: '🏛️', unlocked: false },
];

export const mockPlaces = [
  {
    id: 1,
    name: 'Conservatorio del Tolima',
    barrio: 'Centro',
    tags: ['cultura', 'música'],
    distance: 250,
    verified: true,
    lat: 4.4399,
    lng: -75.2050,
    rating: 4.8,
    description: 'Instituto de educación musical reconocido',
  },
  {
    id: 2,
    name: 'Jardín Botánico San Jorge',
    barrio: 'Belén',
    tags: ['naturaleza', 'jardín'],
    distance: 1200,
    verified: true,
    lat: 4.4350,
    lng: -75.2100,
    rating: 4.6,
    description: 'Jardín botánico con especies nativas',
  },
  {
    id: 3,
    name: 'Restaurante La Pola',
    barrio: 'La Pola',
    tags: ['gastro', 'restaurante'],
    distance: 800,
    verified: true,
    lat: 4.4420,
    lng: -75.2000,
    rating: 4.5,
    description: 'Cocina tradicional tolimense',
  },
  {
    id: 4,
    name: 'Teatro Tolima',
    barrio: 'Centro',
    tags: ['cultura', 'teatro'],
    distance: 300,
    verified: true,
    lat: 4.4400,
    lng: -75.2040,
    rating: 4.7,
    description: 'Teatro principal de la ciudad',
  },
  {
    id: 5,
    name: 'Mirador Cerro de San Javier',
    barrio: 'San Javier',
    tags: ['naturaleza', 'mirador'],
    distance: 2000,
    verified: true,
    lat: 4.4300,
    lng: -75.1900,
    rating: 4.9,
    description: 'Vista panorámica de Ibagué',
  },
];

export const mockCoupons = [
  {
    id: 'COUPON_001',
    title: '20% de descuento en restaurantes',
    description: 'Descuento especial en comida tradicional',
    discount: 20,
    discountType: 'percentage',
    agency: 'Aventuras Colombia',
    expiryDate: '2024-12-31',
    terms: 'Válido solo en restaurantes participantes',
    status: 'active',
    code: 'AVENT20',
    createdAt: '2024-01-15T10:00:00Z',
    qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  },
  {
    id: 'COUPON_002',
    title: 'Entrada gratis al museo',
    description: 'Acceso gratuito a exposiciones',
    discount: 100,
    discountType: 'fixed',
    agency: 'Museo de Arte',
    expiryDate: '2024-06-30',
    terms: 'Solo para visitas de martes a jueves',
    status: 'used',
    code: 'MUSEO100',
    createdAt: '2024-01-10T14:30:00Z',
    qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  },
  {
    id: 'COUPON_003',
    title: 'Descuento en artesanías',
    description: '15% de descuento en productos locales',
    discount: 15,
    discountType: 'percentage',
    agency: 'Artesanías del Tolima',
    expiryDate: '2024-03-15',
    terms: 'Mínimo de compra $50.000',
    status: 'expired',
    code: 'ARTE15',
    createdAt: '2024-01-05T09:15:00Z',
    qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  },
];

export const mockCheckInHistory = [
  {
    id: 1,
    placeId: 1,
    placeName: 'Conservatorio del Tolima',
    barrio: 'Centro',
    timestamp: '2024-01-15T14:30:00Z',
    points: 50,
    note: 'Concierto increíble de música clásica',
    photo: null,
    verified: true,
  },
  {
    id: 2,
    placeId: 2,
    placeName: 'Jardín Botánico San Jorge',
    barrio: 'Belén',
    timestamp: '2024-01-12T10:15:00Z',
    points: 50,
    note: 'Paseo familiar muy relajante',
    photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...',
    verified: true,
  },
  {
    id: 3,
    placeId: 3,
    placeName: 'Restaurante La Pola',
    barrio: 'La Pola',
    timestamp: '2024-01-10T19:45:00Z',
    points: 50,
    note: 'La lechona más deliciosa de Ibagué',
    photo: null,
    verified: true,
  },
];

export const mockAgencies = [
  {
    id: 'agency_001',
    name: 'Aventuras Colombia',
    nit: '900123456-1',
    rnt: 'RNT-12345',
    verified: true,
    category: 'turismo',
    rating: 4.8,
    description: 'Agencia especializada en turismo de naturaleza',
  },
  {
    id: 'agency_002',
    name: 'Museo de Arte',
    nit: '900234567-2',
    rnt: 'RNT-23456',
    verified: true,
    category: 'cultura',
    rating: 4.6,
    description: 'Museo de arte contemporáneo',
  },
  {
    id: 'agency_003',
    name: 'Artesanías del Tolima',
    nit: '900345678-3',
    rnt: 'RNT-34567',
    verified: true,
    category: 'artesanía',
    rating: 4.7,
    description: 'Productos artesanales tradicionales',
  },
];

// Color tokens for consistency
export const colorTokens = {
  forest: '#0E3D2E',
  forest2: '#1F4D3B',
  gold: '#F9A825',
  ocobo: '#E91E63',
  red: '#C62828',
  neutral: '#1F2937',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

// Animation classes
export const animations = {
  slideIn: 'animate-slide-in',
  fadeIn: 'animate-fade-in',
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
};

// Accessibility helpers
export const a11y = {
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-ocobo/50',
  screenReaderOnly: 'sr-only',
  highContrast: 'contrast-more',
};
