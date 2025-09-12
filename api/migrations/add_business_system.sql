-- Migración del Sistema de Empresarios y Cupones para Rutas Vivas MVP
-- Fecha: 2024-09-12
-- Propósito: Añadir funcionalidades empresariales completas

-- Tabla de empresarios/propietarios de negocio
CREATE TABLE IF NOT EXISTS business_owners (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL, -- referencia al usuario en el sistema auth
  business_name TEXT NOT NULL,
  business_type TEXT, -- 'restaurant', 'cafe', 'hotel', 'store', etc.
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  subscription_type TEXT DEFAULT 'free', -- 'free', 'premium', 'enterprise'
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de locales/establecimientos por empresario
CREATE TABLE IF NOT EXISTS business_places (
  id INTEGER PRIMARY KEY,
  business_owner_id TEXT REFERENCES business_owners(id),
  place_id INTEGER REFERENCES place(id),
  is_primary INTEGER DEFAULT 0, -- si es el local principal
  management_level TEXT DEFAULT 'full', -- 'full', 'limited', 'view_only'
  added_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Sistema de cupones
CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  business_owner_id TEXT REFERENCES business_owners(id),
  place_id INTEGER REFERENCES place(id), -- NULL = válido en todos los locales del empresario
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL, -- 'percentage', 'fixed_amount', '2x1', 'free_item'
  discount_value REAL, -- 20 (para 20% o $20), NULL para 2x1 o free_item
  min_purchase_amount REAL, -- monto mínimo de compra
  max_discount_amount REAL, -- descuento máximo (para porcentajes)
  usage_limit INTEGER, -- límite total de usos (NULL = ilimitado)
  usage_limit_per_user INTEGER, -- límite por usuario (NULL = ilimitado)
  current_usage INTEGER DEFAULT 0,
  valid_from TEXT NOT NULL,
  valid_until TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  qr_code TEXT, -- código QR único para el cupón
  terms_conditions TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de uso de cupones
CREATE TABLE IF NOT EXISTS coupon_usage (
  id INTEGER PRIMARY KEY,
  coupon_id TEXT REFERENCES coupons(id),
  user_id TEXT NOT NULL,
  place_id INTEGER REFERENCES place(id),
  used_at TEXT DEFAULT CURRENT_TIMESTAMP,
  discount_applied REAL, -- descuento real aplicado
  purchase_amount REAL, -- monto de compra (si aplica)
  notes TEXT
);

-- Tabla de métricas de visitas por lugar
CREATE TABLE IF NOT EXISTS place_visits (
  id INTEGER PRIMARY KEY,
  place_id INTEGER REFERENCES place(id),
  user_id TEXT,
  visit_type TEXT DEFAULT 'checkin', -- 'checkin', 'route_inclusion', 'coupon_view', 'coupon_use'
  source TEXT, -- 'app', 'qr_code', 'recommendation', etc.
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
  duration_minutes INTEGER, -- duración estimada de la visita
  rating_given REAL, -- rating dado por el usuario (si aplica)
  metadata TEXT -- JSON con información adicional
);

-- Tabla de métricas agregadas diarias por lugar
CREATE TABLE IF NOT EXISTS place_metrics_daily (
  id INTEGER PRIMARY KEY,
  place_id INTEGER REFERENCES place(id),
  date TEXT NOT NULL, -- YYYY-MM-DD
  total_visits INTEGER DEFAULT 0,
  total_checkins INTEGER DEFAULT 0,
  total_coupon_views INTEGER DEFAULT 0,
  total_coupon_uses INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  avg_rating REAL,
  revenue_estimated REAL, -- estimado basado en cupones y visitas
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(place_id, date)
);

-- Tabla de notificaciones para empresarios
CREATE TABLE IF NOT EXISTS business_notifications (
  id INTEGER PRIMARY KEY,
  business_owner_id TEXT REFERENCES business_owners(id),
  type TEXT NOT NULL, -- 'new_checkin', 'coupon_used', 'review_received', 'milestone', etc.
  title TEXT NOT NULL,
  message TEXT,
  related_id TEXT, -- ID relacionado (coupon_id, place_id, etc.)
  is_read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de configuraciones de empresario
CREATE TABLE IF NOT EXISTS business_settings (
  business_owner_id TEXT PRIMARY KEY REFERENCES business_owners(id),
  notifications_enabled INTEGER DEFAULT 1,
  email_notifications INTEGER DEFAULT 1,
  analytics_sharing INTEGER DEFAULT 0,
  auto_respond_reviews INTEGER DEFAULT 0,
  business_hours TEXT, -- JSON con horarios por día
  social_media TEXT, -- JSON con redes sociales
  preferences TEXT, -- JSON con preferencias adicionales
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_business_owners_user ON business_owners(user_id);
CREATE INDEX IF NOT EXISTS idx_business_places_owner ON business_places(business_owner_id);
CREATE INDEX IF NOT EXISTS idx_business_places_place ON business_places(place_id);

CREATE INDEX IF NOT EXISTS idx_coupons_owner ON coupons(business_owner_id);
CREATE INDEX IF NOT EXISTS idx_coupons_place ON coupons(place_id);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_dates ON coupons(valid_from, valid_until);

CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user ON coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_place ON coupon_usage(place_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_date ON coupon_usage(used_at);

CREATE INDEX IF NOT EXISTS idx_place_visits_place ON place_visits(place_id);
CREATE INDEX IF NOT EXISTS idx_place_visits_user ON place_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_place_visits_timestamp ON place_visits(timestamp);
CREATE INDEX IF NOT EXISTS idx_place_visits_type ON place_visits(visit_type);

CREATE INDEX IF NOT EXISTS idx_place_metrics_place ON place_metrics_daily(place_id);
CREATE INDEX IF NOT EXISTS idx_place_metrics_date ON place_metrics_daily(date);

CREATE INDEX IF NOT EXISTS idx_business_notifications_owner ON business_notifications(business_owner_id);
CREATE INDEX IF NOT EXISTS idx_business_notifications_read ON business_notifications(is_read);

-- Triggers para mantener métricas actualizadas
CREATE TRIGGER IF NOT EXISTS update_place_visits_on_checkin
  AFTER INSERT ON checkin
  FOR EACH ROW
BEGIN
  -- Registrar visita
  INSERT INTO place_visits (place_id, user_id, visit_type, timestamp)
  VALUES (NEW.place_id, NEW.user_id, 'checkin', NEW.ts);
  
  -- Actualizar métricas diarias
  INSERT OR REPLACE INTO place_metrics_daily (
    place_id, date, total_visits, total_checkins, unique_visitors
  ) VALUES (
    NEW.place_id,
    DATE(NEW.ts),
    COALESCE((SELECT total_visits FROM place_metrics_daily WHERE place_id = NEW.place_id AND date = DATE(NEW.ts)), 0) + 1,
    COALESCE((SELECT total_checkins FROM place_metrics_daily WHERE place_id = NEW.place_id AND date = DATE(NEW.ts)), 0) + 1,
    (SELECT COUNT(DISTINCT user_id) FROM place_visits WHERE place_id = NEW.place_id AND DATE(timestamp) = DATE(NEW.ts))
  );
END;

CREATE TRIGGER IF NOT EXISTS update_coupon_usage_count
  AFTER INSERT ON coupon_usage
  FOR EACH ROW
BEGIN
  -- Actualizar contador de uso del cupón
  UPDATE coupons 
  SET current_usage = current_usage + 1
  WHERE id = NEW.coupon_id;
  
  -- Actualizar métricas diarias
  INSERT OR REPLACE INTO place_metrics_daily (
    place_id, date, total_coupon_uses
  ) VALUES (
    NEW.place_id,
    DATE(NEW.used_at),
    COALESCE((SELECT total_coupon_uses FROM place_metrics_daily WHERE place_id = NEW.place_id AND date = DATE(NEW.used_at)), 0) + 1
  );
  
  -- Crear notificación para el empresario
  INSERT INTO business_notifications (
    business_owner_id, 
    type, 
    title, 
    message, 
    related_id
  ) 
  SELECT 
    c.business_owner_id,
    'coupon_used',
    'Cupón utilizado',
    'Un usuario utilizó tu cupón "' || c.title || '"',
    NEW.coupon_id
  FROM coupons c 
  WHERE c.id = NEW.coupon_id;
END;

CREATE TRIGGER IF NOT EXISTS deactivate_expired_coupons
  AFTER UPDATE ON place_metrics_daily
  FOR EACH ROW
BEGIN
  -- Desactivar cupones expirados
  UPDATE coupons 
  SET is_active = 0 
  WHERE DATE('now') > DATE(valid_until) AND is_active = 1;
  
  -- Desactivar cupones que han alcanzado su límite de uso
  UPDATE coupons 
  SET is_active = 0 
  WHERE usage_limit IS NOT NULL 
    AND current_usage >= usage_limit 
    AND is_active = 1;
END;