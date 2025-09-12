import db from '../db.js';

// ====== GESTIÓN DE MISIONES DE USUARIO ======

/**
 * Inicializa misiones para un nuevo usuario
 */
export function initializeUserMissions(userId) {
  try {
    // Obtener misiones de onboarding activas
    const onboardingMissions = db.prepare(`
      SELECT * FROM missions 
      WHERE category = 'onboarding' 
      AND is_active = 1 
      AND (unlock_condition IS NULL OR unlock_condition = '')
    `).all();

    // Crear user_missions para cada misión de onboarding
    const insertUserMission = db.prepare(`
      INSERT OR IGNORE INTO user_missions 
      (user_id, mission_id, target_progress, status) 
      VALUES (?, ?, ?, 'active')
    `);

    onboardingMissions.forEach(mission => {
      insertUserMission.run(userId, mission.id, mission.target_count);
    });

    // Inicializar estadísticas del usuario
    const insertUserStats = db.prepare(`
      INSERT OR IGNORE INTO user_stats (user_id) VALUES (?)
    `);
    insertUserStats.run(userId);

    return { success: true, missionsActivated: onboardingMissions.length };
  } catch (error) {
    console.error('Error initializing user missions:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene las misiones activas de un usuario
 */
export function getUserActiveMissions(userId) {
  try {
    const missions = db.prepare(`
      SELECT 
        um.id as user_mission_id,
        um.progress,
        um.target_progress,
        um.status,
        um.started_at,
        m.type,
        m.title,
        m.description,
        m.category,
        m.badge_icon,
        m.badge_color,
        m.points,
        m.difficulty,
        m.estimated_time,
        m.reward_value
      FROM user_missions um
      JOIN missions m ON m.id = um.mission_id
      WHERE um.user_id = ? AND um.status = 'active'
      ORDER BY m.category, m.difficulty
    `).all(userId);

    return { success: true, missions };
  } catch (error) {
    console.error('Error getting user missions:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene los badges/logros de un usuario
 */
export function getUserBadges(userId) {
  try {
    const badges = db.prepare(`
      SELECT * FROM user_badges 
      WHERE user_id = ? 
      ORDER BY earned_at DESC
    `).all(userId);

    return { success: true, badges };
  } catch (error) {
    console.error('Error getting user badges:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene estadísticas del usuario
 */
export function getUserStats(userId) {
  try {
    let stats = db.prepare(`
      SELECT * FROM user_stats WHERE user_id = ?
    `).get(userId);

    if (!stats) {
      // Inicializar estadísticas si no existen
      initializeUserMissions(userId);
      stats = db.prepare(`
        SELECT * FROM user_stats WHERE user_id = ?
      `).get(userId);
    }

    return { success: true, stats };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return { success: false, error: error.message };
  }
}

// ====== LÓGICA DE PROGRESO DE MISIONES ======

/**
 * Procesa un check-in y actualiza el progreso de misiones
 */
export function processCheckInForMissions(userId, placeId, activityId = null) {
  const db_transaction = db.transaction(() => {
    try {
      // Obtener información del lugar
      const place = db.prepare(`
        SELECT p.*, GROUP_CONCAT(pc.category) as categories 
        FROM place p 
        LEFT JOIN place_categories pc ON pc.place_id = p.id 
        WHERE p.id = ? 
        GROUP BY p.id
      `).get(placeId);

      if (!place) {
        return { success: false, error: 'Place not found' };
      }

      // Obtener misiones activas del usuario
      const activeMissions = db.prepare(`
        SELECT um.*, m.* 
        FROM user_missions um 
        JOIN missions m ON m.id = um.mission_id 
        WHERE um.user_id = ? AND um.status = 'active'
      `).all(userId);

      const completedMissions = [];
      const updatedMissions = [];

      activeMissions.forEach(mission => {
        const progressUpdate = calculateMissionProgress(mission, userId, place, activityId);
        
        if (progressUpdate.shouldUpdate) {
          const newProgress = Math.min(mission.progress + progressUpdate.increment, mission.target_count);
          
          // Actualizar progreso
          db.prepare(`
            UPDATE user_missions 
            SET progress = ? 
            WHERE id = ?
          `).run(newProgress, mission.user_mission_id || mission.id);

          updatedMissions.push({
            missionId: mission.id,
            title: mission.title,
            oldProgress: mission.progress,
            newProgress: newProgress,
            target: mission.target_count
          });

          // Verificar si se completó
          if (newProgress >= mission.target_count) {
            completeMission(userId, mission);
            completedMissions.push({
              id: mission.id,
              title: mission.title,
              badge: mission.reward_value,
              points: mission.points,
              icon: mission.badge_icon,
              color: mission.badge_color
            });
          }
        }
      });

      // Verificar si se desbloquean nuevas misiones
      const unlockedMissions = checkUnlockedMissions(userId);

      return {
        success: true,
        completedMissions,
        updatedMissions,
        unlockedMissions,
        place: place.name
      };

    } catch (error) {
      console.error('Error processing check-in for missions:', error);
      throw error;
    }
  });

  return db_transaction();
}

/**
 * Calcula el progreso de una misión específica
 */
function calculateMissionProgress(mission, userId, place, activityId) {
  const placeCategories = place.categories ? place.categories.split(',') : [];
  
  switch (mission.target_type) {
    case 'checkins':
      return { shouldUpdate: true, increment: 1 };
      
    case 'places':
      // Verificar que no haya visitado este lugar antes para esta misión
      const previousVisit = db.prepare(`
        SELECT COUNT(*) as count 
        FROM checkin 
        WHERE user_id = ? AND place_id = ?
      `).get(userId, place.id);
      
      return { shouldUpdate: previousVisit.count === 0, increment: 1 };
      
    case 'categories':
      if (!mission.target_filter) return { shouldUpdate: false, increment: 0 };
      
      const targetCategories = mission.target_filter.split(',');
      const hasMatchingCategory = placeCategories.some(cat => 
        targetCategories.includes(cat.trim())
      );
      
      if (hasMatchingCategory) {
        // Verificar que no haya visitado un lugar de esta categoría antes
        const categoryVisits = db.prepare(`
          SELECT COUNT(DISTINCT c.place_id) as count 
          FROM checkin c 
          JOIN place_categories pc ON pc.place_id = c.place_id 
          WHERE c.user_id = ? AND pc.category IN (${targetCategories.map(() => '?').join(',')})
        `).get(userId, ...targetCategories);
        
        return { shouldUpdate: true, increment: 1 };
      }
      return { shouldUpdate: false, increment: 0 };
      
    case 'checkins_weekend':
      const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
      return { shouldUpdate: isWeekend, increment: 1 };
      
    case 'checkins_daily':
      const today = new Date().toISOString().split('T')[0];
      const todayCheckins = db.prepare(`
        SELECT COUNT(*) as count 
        FROM checkin 
        WHERE user_id = ? AND DATE(ts) = ?
      `).get(userId, today);
      
      return { shouldUpdate: true, increment: 1 };
      
    case 'checkins_morning':
      const hour = new Date().getHours();
      const isMorning = hour < 10;
      const isCultural = placeCategories.includes('cultural') || placeCategories.includes('historic');
      return { shouldUpdate: isMorning && isCultural, increment: 1 };
      
    default:
      return { shouldUpdate: false, increment: 0 };
  }
}

/**
 * Completa una misión y otorga recompensas
 */
function completeMission(userId, mission) {
  try {
    // Marcar misión como completada
    db.prepare(`
      UPDATE user_missions 
      SET status = 'completed', completed_at = CURRENT_TIMESTAMP 
      WHERE user_id = ? AND mission_id = ?
    `).run(userId, mission.mission_id || mission.id);

    // Otorgar badge
    db.prepare(`
      INSERT INTO user_badges 
      (user_id, mission_id, badge_type, badge_name, badge_description, badge_icon, badge_color, points_earned)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      mission.mission_id || mission.id,
      mission.reward_type,
      mission.reward_value,
      mission.description,
      mission.badge_icon,
      mission.badge_color,
      mission.points
    );

  } catch (error) {
    console.error('Error completing mission:', error);
    throw error;
  }
}

/**
 * Verifica y activa misiones desbloqueables
 */
function checkUnlockedMissions(userId) {
  try {
    const userStats = db.prepare(`
      SELECT * FROM user_stats WHERE user_id = ?
    `).get(userId);

    if (!userStats) return [];

    // Obtener misiones bloqueadas que podrían desbloquearse
    const lockedMissions = db.prepare(`
      SELECT m.* FROM missions m
      LEFT JOIN user_missions um ON um.mission_id = m.id AND um.user_id = ?
      WHERE m.is_active = 1 
      AND m.unlock_condition IS NOT NULL 
      AND m.unlock_condition != ''
      AND (um.id IS NULL OR um.status = 'locked')
    `).all(userId);

    const unlockedMissions = [];

    lockedMissions.forEach(mission => {
      if (evaluateUnlockCondition(mission.unlock_condition, userId, userStats)) {
        // Activar misión
        db.prepare(`
          INSERT OR REPLACE INTO user_missions 
          (user_id, mission_id, target_progress, status) 
          VALUES (?, ?, ?, 'active')
        `).run(userId, mission.id, mission.target_count);

        unlockedMissions.push({
          id: mission.id,
          title: mission.title,
          description: mission.description,
          icon: mission.badge_icon,
          color: mission.badge_color
        });
      }
    });

    return unlockedMissions;
  } catch (error) {
    console.error('Error checking unlocked missions:', error);
    return [];
  }
}

/**
 * Evalúa condiciones de desbloqueo
 */
function evaluateUnlockCondition(condition, userId, userStats) {
  try {
    const [type, value] = condition.split(':');
    
    switch (type) {
      case 'missions_completed':
        return userStats.missions_completed >= parseInt(value);
        
      case 'total_points':
        return userStats.total_points >= parseInt(value);
        
      case 'unique_places':
        return userStats.unique_places_visited >= parseInt(value);
        
      default:
        // Para condiciones específicas de misión (ej: "culture_buff:completed")
        const completedMission = db.prepare(`
          SELECT COUNT(*) as count 
          FROM user_missions um 
          JOIN missions m ON m.id = um.mission_id 
          WHERE um.user_id = ? AND m.type = ? AND um.status = 'completed'
        `).get(userId, type);
        
        return completedMission.count > 0;
    }
  } catch (error) {
    console.error('Error evaluating unlock condition:', error);
    return false;
  }
}

// ====== UTILIDADES ======

/**
 * Obtiene el resumen de misiones para mostrar en header
 */
export function getMissionsSummary(userId) {
  try {
    const summary = db.prepare(`
      SELECT 
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_missions,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_missions,
        COUNT(*) as total_missions
      FROM user_missions 
      WHERE user_id = ?
    `).get(userId);

    const stats = db.prepare(`
      SELECT total_points, total_badges 
      FROM user_stats 
      WHERE user_id = ?
    `).get(userId);

    return {
      success: true,
      active: summary?.active_missions || 0,
      completed: summary?.completed_missions || 0,
      total: summary?.total_missions || 0,
      points: stats?.total_points || 0,
      badges: stats?.total_badges || 0
    };
  } catch (error) {
    console.error('Error getting missions summary:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene todas las misiones disponibles (para admin)
 */
export function getAllMissions() {
  try {
    const missions = db.prepare(`
      SELECT * FROM missions 
      ORDER BY category, difficulty, title
    `).all();

    return { success: true, missions };
  } catch (error) {
    console.error('Error getting all missions:', error);
    return { success: false, error: error.message };
  }
}

export default {
  initializeUserMissions,
  getUserActiveMissions,
  getUserBadges,
  getUserStats,
  processCheckInForMissions,
  getMissionsSummary,
  getAllMissions
};