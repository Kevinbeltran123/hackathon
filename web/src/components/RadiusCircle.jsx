import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const RADIUS_COLORS = {
  500: '#EF4444',   // Red
  1000: '#F59E0B',  // Amber
  1500: '#10B981',  // Green
  2000: '#3B82F6',  // Blue
  3000: '#8B5CF6'   // Purple
};

export default function RadiusCircle({ center, radius, visible = true }) {
  const map = useMap();
  const circleRef = useRef(null);

  useEffect(() => {
    if (!map || !center) return;

    // Remove existing circle
    if (circleRef.current) {
      map.removeLayer(circleRef.current);
      circleRef.current = null;
    }

    if (!visible || !radius) return;

    // Create new circle
    const circle = L.circle([center.lat, center.lng], {
      radius: radius,
      color: RADIUS_COLORS[radius] || '#3B82F6',
      fillColor: RADIUS_COLORS[radius] || '#3B82F6',
      fillOpacity: 0.1,
      weight: 2,
      opacity: 0.6,
      className: 'radius-circle'
    });

    // Add pulsing animation
    const originalStyle = circle.options;
    let pulseDirection = 1;
    
    const pulseAnimation = setInterval(() => {
      if (!circle._map) {
        clearInterval(pulseAnimation);
        return;
      }
      
      const currentOpacity = circle.options.fillOpacity;
      const newOpacity = currentOpacity + (0.02 * pulseDirection);
      
      if (newOpacity >= 0.15 || newOpacity <= 0.05) {
        pulseDirection *= -1;
      }
      
      circle.setStyle({
        fillOpacity: Math.max(0.05, Math.min(0.15, newOpacity))
      });
    }, 100);

    // Store reference to clear animation later
    circle._pulseAnimation = pulseAnimation;

    // Add to map
    circle.addTo(map);
    circleRef.current = circle;

    // Cleanup function
    return () => {
      if (circle._pulseAnimation) {
        clearInterval(circle._pulseAnimation);
      }
      if (circle._map) {
        map.removeLayer(circle);
      }
    };

  }, [map, center, radius, visible]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (circleRef.current && circleRef.current._pulseAnimation) {
        clearInterval(circleRef.current._pulseAnimation);
      }
      if (circleRef.current && circleRef.current._map) {
        map.removeLayer(circleRef.current);
      }
    };
  }, [map]);

  return null; // This component doesn't render JSX
}