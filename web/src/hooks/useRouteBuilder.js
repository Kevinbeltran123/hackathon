import { useState, useEffect, useCallback } from 'react';

export const useRouteBuilder = () => {
  const [routePlaces, setRoutePlaces] = useState([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [routeStats, setRouteStats] = useState({
    totalDistance: 0,
    estimatedTime: 0,
    placesCount: 0
  });
  const [routePolyline, setRoutePolyline] = useState(null);
  const [savedRoutes, setSavedRoutes] = useState([]);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = useCallback((lat1, lng1, lat2, lng2) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in meters
  }, []);

  // Calculate route statistics
  const updateRouteStats = useCallback(() => {
    if (routePlaces.length < 2) {
      setRouteStats({
        totalDistance: 0,
        estimatedTime: 0,
        placesCount: routePlaces.length
      });
      return;
    }

    let totalDistance = 0;
    for (let i = 0; i < routePlaces.length - 1; i++) {
      const current = routePlaces[i];
      const next = routePlaces[i + 1];
      totalDistance += calculateDistance(current.lat, current.lng, next.lat, next.lng);
    }

    // Estimate time (assuming 5km/h walking speed + 30 min per place)
    const walkingTime = (totalDistance / 1000) * 12; // minutes for walking
    const placeTime = routePlaces.length * 30; // 30 min per place
    const estimatedTime = walkingTime + placeTime;

    setRouteStats({
      totalDistance,
      estimatedTime,
      placesCount: routePlaces.length
    });
  }, [routePlaces, calculateDistance]);

  // Add place to route
  const addPlaceToRoute = useCallback((place) => {
    setIsBuilding(true);
    setRoutePlaces(prev => {
      const exists = prev.find(p => p.id === place.id);
      if (exists) return prev;
      return [...prev, { ...place, routeOrder: prev.length + 1 }];
    });
    setTimeout(() => setIsBuilding(false), 300);
  }, []);

  // Remove place from route
  const removePlaceFromRoute = useCallback((placeId) => {
    setRoutePlaces(prev => {
      const filtered = prev.filter(p => p.id !== placeId);
      return filtered.map((place, index) => ({
        ...place,
        routeOrder: index + 1
      }));
    });
  }, []);

  // Reorder places in route (for drag & drop)
  const reorderRoute = useCallback((startIndex, endIndex) => {
    setRoutePlaces(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      
      return result.map((place, index) => ({
        ...place,
        routeOrder: index + 1
      }));
    });
  }, []);

  // Clear entire route
  const clearRoute = useCallback(() => {
    setRoutePlaces([]);
    setRoutePolyline(null);
  }, []);

  // Save route to database
  const saveRoute = useCallback(async (routeName, userId) => {
    if (!routeName || routePlaces.length < 2) {
      throw new Error('Route name and at least 2 places required');
    }

    try {
      const routeData = {
        name: routeName,
        user_id: userId,
        places: routePlaces.map((place, index) => ({
          place_id: place.id,
          order: index + 1,
          lat: place.lat,
          lng: place.lng
        })),
        total_distance: routeStats.totalDistance,
        estimated_time: routeStats.estimatedTime,
        created_at: new Date().toISOString()
      };

      const response = await fetch('http://localhost:4001/api/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(routeData)
      });

      if (!response.ok) {
        throw new Error('Failed to save route');
      }

      const savedRoute = await response.json();
      setSavedRoutes(prev => [...prev, savedRoute]);
      return savedRoute;
    } catch (error) {
      console.error('Error saving route:', error);
      throw error;
    }
  }, [routePlaces, routeStats]);

  // Load saved routes
  const loadSavedRoutes = useCallback(async (userId) => {
    try {
      const response = await fetch(`http://localhost:4001/api/users/${userId}/routes`);
      if (response.ok) {
        const routes = await response.json();
        setSavedRoutes(routes);
        return routes;
      }
    } catch (error) {
      console.error('Error loading saved routes:', error);
    }
    return [];
  }, []);

  // Load specific route
  const loadRoute = useCallback(async (routeId) => {
    try {
      const response = await fetch(`http://localhost:4001/api/routes/${routeId}`);
      if (response.ok) {
        const route = await response.json();
        const placesWithOrder = route.places.map(p => ({
          ...p,
          routeOrder: p.order
        }));
        setRoutePlaces(placesWithOrder);
        return route;
      }
    } catch (error) {
      console.error('Error loading route:', error);
    }
    return null;
  }, []);

  // Get next suggested place based on proximity
  const getSuggestedNextPlaces = useCallback((availablePlaces, maxSuggestions = 3) => {
    if (routePlaces.length === 0) return availablePlaces.slice(0, maxSuggestions);

    const lastPlace = routePlaces[routePlaces.length - 1];
    const currentPlaceIds = new Set(routePlaces.map(p => p.id));
    
    const availableWithDistance = availablePlaces
      .filter(place => !currentPlaceIds.has(place.id))
      .map(place => ({
        ...place,
        distanceFromLast: calculateDistance(
          lastPlace.lat, lastPlace.lng, 
          place.lat, place.lng
        )
      }))
      .sort((a, b) => a.distanceFromLast - b.distanceFromLast);

    return availableWithDistance.slice(0, maxSuggestions);
  }, [routePlaces, calculateDistance]);

  // Check if place is in current route
  const isPlaceInRoute = useCallback((placeId) => {
    return routePlaces.some(p => p.id === placeId);
  }, [routePlaces]);

  // Get place position in route
  const getPlaceRoutePosition = useCallback((placeId) => {
    const place = routePlaces.find(p => p.id === placeId);
    return place ? place.routeOrder : 0;
  }, [routePlaces]);

  // Update stats when route changes
  useEffect(() => {
    updateRouteStats();
  }, [routePlaces, updateRouteStats]);

  // Format distance for display
  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  };

  // Format time for display
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    } else {
      return `${mins}m`;
    }
  };

  return {
    // State
    routePlaces,
    isBuilding,
    routeStats: {
      ...routeStats,
      formattedDistance: formatDistance(routeStats.totalDistance),
      formattedTime: formatTime(routeStats.estimatedTime)
    },
    routePolyline,
    savedRoutes,

    // Actions
    addPlaceToRoute,
    removePlaceFromRoute,
    reorderRoute,
    clearRoute,
    saveRoute,
    loadSavedRoutes,
    loadRoute,
    
    // Utilities
    getSuggestedNextPlaces,
    isPlaceInRoute,
    getPlaceRoutePosition,
    setRoutePolyline,
    calculateDistance
  };
};

export default useRouteBuilder;