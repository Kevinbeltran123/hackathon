# Profile Panel Integration Guide

## Overview
This document provides integration notes for the redesigned Profile Panel with ocobo tourism theme.

## Components Architecture

### Core Components
- `ProfileHeader` - User info and stats display
- `StatsStrip` - Achievements and level system
- `Tabs` - Navigation between profile sections
- `CheckInStepper` - Step-by-step check-in process
- `PlacePicker` - Location selection with map/list views
- `PhotoNote` - Photo and note capture
- `ConsentModal` - Data usage consent
- `CouponCreator` - Coupon generation form
- `CouponCard` - Individual coupon display
- `WalletList` - Coupon management
- `RedeemModal` - Coupon redemption
- `Toast` - Notification system

## Color Tokens

```css
:root {
  --forest: #0E3D2E;
  --forest2: #1F4D3B;
  --gold: #F9A825;
  --ocobo: #E91E63;
  --red: #C62828;
  --neutral: #1F2937;
}
```

## Tailwind Configuration

Add to `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        forest: '#0E3D2E',
        forest2: '#1F4D3B',
        gold: '#F9A825',
        ocobo: '#E91E63',
        red: '#C62828',
        neutral: '#1F2937',
      },
      boxShadow: {
        'glow-ocobo': '0 0 20px rgba(233, 30, 99, 0.3)',
        'glow-forest': '0 0 20px rgba(14, 61, 46, 0.3)',
        'glow-gold': '0 0 20px rgba(249, 168, 37, 0.3)',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
}
```

## Leaflet Integration

### PlacePicker Map Integration

```jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapView = ({ places, onPlaceSelect, selectedPlace }) => {
  const center = [4.4399, -75.2050]; // Ibagué coordinates
  
  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {places.map(place => (
        <Marker
          key={place.id}
          position={[place.lat, place.lng]}
          eventHandlers={{
            click: () => onPlaceSelect(place),
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold">{place.name}</h3>
              <p className="text-sm text-gray-600">{place.barrio}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {place.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-forest/10 text-forest text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
```

### Geolocation API Integration

```javascript
// Check-in validation with geolocation
const validateLocation = async (place, userLocation) => {
  const distance = calculateDistance(
    place.lat,
    place.lng,
    userLocation.lat,
    userLocation.lng
  );
  
  return {
    isValid: distance <= 100, // 100m radius
    distance: Math.round(distance),
    message: distance <= 100 
      ? 'Ubicación válida' 
      : 'Estás muy lejos del lugar'
  };
};

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lng2-lng1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};
```

## API Integration

### Check-in Endpoint

```javascript
// POST /api/checkin
const submitCheckIn = async (checkInData) => {
  const response = await fetch('/api/checkin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      placeId: checkInData.placeId,
      userId: checkInData.userId,
      note: checkInData.note,
      photo: checkInData.photo,
      location: checkInData.location,
      timestamp: new Date().toISOString(),
    }),
  });
  
  return response.json();
};
```

### Coupon Management

```javascript
// GET /api/coupons
const fetchCoupons = async (userId) => {
  const response = await fetch(`/api/coupons?userId=${userId}`);
  return response.json();
};

// POST /api/coupons
const createCoupon = async (couponData) => {
  const response = await fetch('/api/coupons', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(couponData),
  });
  
  return response.json();
};

// POST /api/coupons/redeem
const redeemCoupon = async (couponId, code) => {
  const response = await fetch('/api/coupons/redeem', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ couponId, code }),
  });
  
  return response.json();
};
```

## State Management

### Redux Store Structure

```javascript
const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    user: null,
    stats: {
      checkins: 0,
      points: 0,
      coupons: 0,
      level: 1,
    },
    achievements: [],
    checkInFlow: {
      currentStep: 1,
      selectedPlace: null,
      note: '',
      photo: null,
    },
    coupons: [],
    history: [],
    ui: {
      activeTab: 'profile',
      showConsentModal: false,
      showRedeemModal: false,
      toast: {
        isVisible: false,
        type: 'success',
        title: '',
        message: '',
      },
    },
  },
  reducers: {
    // ... reducers
  },
});
```

## Testing Examples

### Unit Tests

```javascript
// ProfileHeader.test.js
import { render, screen } from '@testing-library/react';
import ProfileHeader from '../ProfileHeader';

describe('ProfileHeader', () => {
  const mockUser = {
    name: 'Test User',
    joinDate: 'Enero 2024',
  };
  
  const mockStats = {
    checkins: 5,
    points: 250,
    coupons: 2,
  };

  test('renders user information correctly', () => {
    render(<ProfileHeader user={mockUser} stats={mockStats} />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Miembro desde Enero 2024')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('250')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
```

### Integration Tests

```javascript
// CheckInFlow.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Profile from '../Profile';

describe('Check-in Flow', () => {
  test('completes check-in process', async () => {
    render(<Profile />);
    
    // Navigate to check-in tab
    fireEvent.click(screen.getByText('Check-in'));
    
    // Select a place
    fireEvent.click(screen.getByText('Conservatorio del Tolima'));
    
    // Validate location
    fireEvent.click(screen.getByText('Confirmar ubicación'));
    
    // Add note
    fireEvent.change(screen.getByPlaceholderText('Comparte tu experiencia...'), {
      target: { value: 'Great place!' }
    });
    
    // Finalize check-in
    fireEvent.click(screen.getByText('Finalizar Check-in'));
    fireEvent.click(screen.getByText('Aceptar y Continuar'));
    
    await waitFor(() => {
      expect(screen.getByText('¡Check-in exitoso!')).toBeInTheDocument();
    });
  });
});
```

## Accessibility Features

### WCAG AA Compliance

1. **Keyboard Navigation**: All interactive elements are keyboard accessible
2. **Screen Reader Support**: Proper ARIA labels and roles
3. **Color Contrast**: Meets WCAG AA contrast ratios
4. **Focus Management**: Clear focus indicators
5. **Semantic HTML**: Proper heading hierarchy and landmarks

### Keyboard Shortcuts

- `Tab` - Navigate between elements
- `Enter/Space` - Activate buttons and links
- `Escape` - Close modals
- `Arrow Keys` - Navigate tabs and stepper

## Performance Optimization

### Code Splitting

```javascript
// Lazy load heavy components
const PlacePicker = lazy(() => import('./PlacePicker'));
const CouponCreator = lazy(() => import('./CouponCreator'));
```

### Image Optimization

```javascript
// Optimize photos before upload
const optimizeImage = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};
```

## Internationalization (i18n)

### Text Keys

```javascript
const translations = {
  es: {
    'profile.title': 'Mi Perfil',
    'checkin.title': 'Check-in',
    'coupons.title': 'Cupones',
    'history.title': 'Historial',
    'checkin.steps.choose': 'Elegir Lugar',
    'checkin.steps.validate': 'Validar',
    'checkin.steps.note': 'Nota',
    'checkin.steps.confirm': 'Confirmar',
  },
  en: {
    'profile.title': 'My Profile',
    'checkin.title': 'Check-in',
    'coupons.title': 'Coupons',
    'history.title': 'History',
    'checkin.steps.choose': 'Choose Place',
    'checkin.steps.validate': 'Validate',
    'checkin.steps.note': 'Note',
    'checkin.steps.confirm': 'Confirm',
  },
};
```

## Deployment Notes

1. **Environment Variables**: Set up proper API endpoints
2. **CDN**: Optimize image and asset delivery
3. **Caching**: Implement proper cache headers
4. **Monitoring**: Set up error tracking and analytics
5. **Security**: Implement proper authentication and data validation

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

1. **Offline Support**: PWA capabilities
2. **Push Notifications**: Real-time updates
3. **Social Features**: Share check-ins and achievements
4. **Gamification**: More achievement types and rewards
5. **Analytics**: Detailed user behavior tracking
