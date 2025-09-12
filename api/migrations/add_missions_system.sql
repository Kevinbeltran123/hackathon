-- Migración del Sistema de Misiones Dinámicas para Rutas Vivas MVP
-- Fecha: 2024-09-12

-- Tabla principal de misiones (templates globales)
CREATE TABLE IF NOT EXISTS missions (
  id INTEGER PRIMARY KEY,
  type TEXT NOT NULL, -- 'first_steps', 'explorer', 'local_lover', etc.
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT, -- 'onboarding', 'exploration', 'cultural', 'food', 'social'
  target_count INTEGER NOT NULL DEFAULT 1, -- cuántos elementos necesita (ej: 3 restaurantes)
  target_type TEXT, -- 'checkins', 'places', 'activities', 'categories'
  target_filter TEXT, -- filtros específicos (ej: 'restaurant,cafe' para foodie)
  reward_type TEXT NOT NULL DEFAULT 'badge', -- 'badge', 'points', 'unlock'
  reward_value TEXT, -- descripción de la recompensa
  points INTEGER DEFAULT 0, -- puntos otorgados
  badge_icon TEXT, -- emoji o código del ícono
  badge_color TEXT DEFAULT '#3B82F6', -- color del badge
  is_active INTEGER DEFAULT 1, -- si está activa globalmente
  is_repeatable INTEGER DEFAULT 0, -- si se puede repetir
  difficulty TEXT DEFAULT 'easy', -- 'easy', 'medium', 'hard'
  estimated_time TEXT, -- '10 minutos', '2 horas', etc.
  unlock_condition TEXT, -- condiciones para desbloquear esta misión
  seasonal_start TEXT, -- fecha inicio si es estacional
  seasonal_end TEXT, -- fecha fin si es estacional
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de progreso de misiones por usuario
CREATE TABLE IF NOT EXISTS user_missions (
  id INTEGER PRIMARY KEY,
  user_id TEXT NOT NULL,
  mission_id INTEGER REFERENCES missions(id),
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'expired', 'locked'
  progress INTEGER DEFAULT 0, -- progreso actual (ej: 2 de 5)
  target_progress INTEGER, -- objetivo copiado de la misión
  started_at TEXT DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT,
  expires_at TEXT, -- para misiones temporales
  bonus_multiplier REAL DEFAULT 1.0, -- multiplicador de puntos especiales
  data TEXT -- JSON con datos específicos del progreso
);

-- Tabla de badges/logros obtenidos
CREATE TABLE IF NOT EXISTS user_badges (
  id INTEGER PRIMARY KEY,
  user_id TEXT NOT NULL,
  mission_id INTEGER REFERENCES missions(id),
  badge_type TEXT NOT NULL, -- tipo de badge obtenido
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  badge_icon TEXT,
  badge_color TEXT,
  points_earned INTEGER DEFAULT 0,
  earned_at TEXT DEFAULT CURRENT_TIMESTAMP,
  is_featured INTEGER DEFAULT 0 -- si es un logro destacado
);

-- Tabla de estadísticas de usuario
CREATE TABLE IF NOT EXISTS user_stats (
  id INTEGER PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  total_points INTEGER DEFAULT 0,
  total_badges INTEGER DEFAULT 0,
  total_checkins INTEGER DEFAULT 0,
  unique_places_visited INTEGER DEFAULT 0,
  missions_completed INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0, -- días consecutivos de actividad
  max_streak INTEGER DEFAULT 0,
  last_activity TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de categorías para lugares (expandir el sistema actual)
CREATE TABLE IF NOT EXISTS place_categories (
  id INTEGER PRIMARY KEY,
  place_id INTEGER REFERENCES place(id),
  category TEXT NOT NULL, -- 'restaurant', 'cafe', 'cultural', 'historic', 'shopping', etc.
  subcategory TEXT, -- 'comida_tipica', 'museo', 'iglesia', etc.
  is_primary INTEGER DEFAULT 0 -- si es la categoría principal del lugar
);

-- Tabla de eventos especiales/temporales
CREATE TABLE IF NOT EXISTS special_events (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  bonus_missions TEXT, -- JSON con IDs de misiones especiales
  bonus_multiplier REAL DEFAULT 1.5,
  is_active INTEGER DEFAULT 1
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_missions_type ON missions(type);
CREATE INDEX IF NOT EXISTS idx_missions_category ON missions(category);
CREATE INDEX IF NOT EXISTS idx_missions_active ON missions(is_active);

CREATE INDEX IF NOT EXISTS idx_user_missions_user ON user_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_status ON user_missions(status);
CREATE INDEX IF NOT EXISTS idx_user_missions_mission ON user_missions(mission_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_user_status ON user_missions(user_id, status);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned ON user_badges(earned_at);

CREATE INDEX IF NOT EXISTS idx_user_stats_user ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_points ON user_stats(total_points);

CREATE INDEX IF NOT EXISTS idx_place_categories_place ON place_categories(place_id);
CREATE INDEX IF NOT EXISTS idx_place_categories_category ON place_categories(category);

-- Triggers para mantener estadísticas actualizadas
CREATE TRIGGER IF NOT EXISTS update_user_stats_on_checkin
  AFTER INSERT ON checkin
  FOR EACH ROW
BEGIN
  -- Actualizar estadísticas básicas
  INSERT OR REPLACE INTO user_stats (
    user_id, total_checkins, unique_places_visited, last_activity, updated_at
  ) VALUES (
    NEW.user_id,
    COALESCE((SELECT total_checkins FROM user_stats WHERE user_id = NEW.user_id), 0) + 1,
    (SELECT COUNT(DISTINCT place_id) FROM checkin WHERE user_id = NEW.user_id),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );
END;

CREATE TRIGGER IF NOT EXISTS update_user_stats_on_mission_complete
  AFTER UPDATE ON user_missions
  FOR EACH ROW
  WHEN NEW.status = 'completed' AND OLD.status != 'completed'
BEGIN
  UPDATE user_stats 
  SET 
    missions_completed = missions_completed + 1,
    total_badges = (SELECT COUNT(*) FROM user_badges WHERE user_id = NEW.user_id),
    updated_at = CURRENT_TIMESTAMP
  WHERE user_id = NEW.user_id;
END;

CREATE TRIGGER IF NOT EXISTS update_user_stats_on_badge_earned
  AFTER INSERT ON user_badges
  FOR EACH ROW
BEGIN
  UPDATE user_stats 
  SET 
    total_points = total_points + NEW.points_earned,
    total_badges = total_badges + 1,
    updated_at = CURRENT_TIMESTAMP
  WHERE user_id = NEW.user_id;
END;