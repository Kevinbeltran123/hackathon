import { useState, useEffect, useCallback } from 'react';
import { 
  initUserMissions, 
  getUserMissions, 
  getUserBadges, 
  getUserStats, 
  getMissionsSummary 
} from '../lib/api.js';

// Hook personalizado para gestionar el estado de misiones
export function useMissions(userId) {
  const [missions, setMissions] = useState([]);
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inicializar usuario (solo una vez)
  const initializeUser = useCallback(async () => {
    if (!userId) return;
    
    try {
      await initUserMissions(userId);
    } catch (error) {
      console.error('Error initializing user:', error);
      // No es crítico si falla, el usuario podría ya estar inicializado
    }
  }, [userId]);

  // Cargar misiones activas
  const loadMissions = useCallback(async () => {
    if (!userId) return;
    
    try {
      const result = await getUserMissions(userId);
      if (result.success) {
        setMissions(result.missions || []);
      }
    } catch (error) {
      console.error('Error loading missions:', error);
      setError('Error cargando misiones');
    }
  }, [userId]);

  // Cargar badges
  const loadBadges = useCallback(async () => {
    if (!userId) return;
    
    try {
      const result = await getUserBadges(userId);
      if (result.success) {
        setBadges(result.badges || []);
      }
    } catch (error) {
      console.error('Error loading badges:', error);
    }
  }, [userId]);

  // Cargar estadísticas
  const loadStats = useCallback(async () => {
    if (!userId) return;
    
    try {
      const result = await getUserStats(userId);
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [userId]);

  // Cargar resumen para header
  const loadSummary = useCallback(async () => {
    if (!userId) return;
    
    try {
      const result = await getMissionsSummary(userId);
      if (result.success) {
        setSummary({
          active: result.active,
          completed: result.completed,
          points: result.points,
          badges: result.badges
        });
      }
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  }, [userId]);

  // Cargar todos los datos
  const loadAllData = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      await Promise.all([
        loadMissions(),
        loadBadges(),
        loadStats(),
        loadSummary()
      ]);
    } catch (error) {
      setError('Error cargando datos de misiones');
    } finally {
      setLoading(false);
    }
  }, [userId, loadMissions, loadBadges, loadStats, loadSummary]);

  // Actualizar progreso después de un check-in
  const updateAfterCheckIn = useCallback((checkInResult) => {
    if (checkInResult?.missions) {
      const { completed, updated, unlocked } = checkInResult.missions;
      
      // Recargar todos los datos si hay cambios significativos
      if (completed?.length > 0 || unlocked?.length > 0) {
        loadAllData();
        return { completed, unlocked };
      }
      
      // Solo actualizar progreso si hay actualizaciones menores
      if (updated?.length > 0) {
        loadSummary();
        loadMissions();
      }
    }
    return null;
  }, [loadAllData, loadSummary, loadMissions]);

  // Efecto inicial
  useEffect(() => {
    if (userId) {
      initializeUser().then(() => {
        loadAllData();
      });
    }
  }, [userId, initializeUser, loadAllData]);

  return {
    // Datos
    missions,
    badges,
    stats,
    summary,
    loading,
    error,
    
    // Acciones
    refresh: loadAllData,
    refreshSummary: loadSummary,
    updateAfterCheckIn,
    
    // Estados calculados
    activeMissions: missions.filter(m => m.status === 'active'),
    completedMissions: missions.filter(m => m.status === 'completed'),
    hasActiveMissions: missions.some(m => m.status === 'active'),
    recentBadges: badges.slice(0, 3) // Últimos 3 badges
  };
}

// Hook para notificaciones de misiones
export function useMissionNotifications() {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now();
    const newNotification = { 
      id, 
      timestamp: new Date(), 
      ...notification 
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Máximo 5
    
    // Auto-remove después de 5 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications
  };
}

export default useMissions;