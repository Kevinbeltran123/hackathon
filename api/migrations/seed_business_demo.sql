-- Datos de prueba para el Sistema de Empresarios - Demo Ibagué
-- Fecha: 2024-09-12

-- Crear empresario demo
INSERT OR REPLACE INTO business_owners (
  id, user_id, business_name, business_type, 
  contact_email, contact_phone, address, verification_status, subscription_type
) VALUES 
(
  'business-001', 
  'business-123', 
  'Grupo Gastronómico Tolimense', 
  'restaurant',
  'empresario@demo.com',
  '+57 310 987 6543',
  'Centro Histórico, Ibagué',
  'verified',
  'premium'
);

-- Vincular lugares del empresario (algunos restaurantes existentes)
INSERT OR REPLACE INTO business_places (business_owner_id, place_id, is_primary) VALUES
('business-001', 101, 1), -- La Lechona de la Abuela (principal)
('business-001', 102, 0), -- El Fogón Tolimense 
('business-001', 105, 0), -- Café Cultural Gourmet
('business-001', 129, 0); -- Café de la Plaza

-- Cupones activos de ejemplo
INSERT OR REPLACE INTO coupons (
  id, business_owner_id, place_id, title, description, 
  discount_type, discount_value, min_purchase_amount, usage_limit,
  valid_from, valid_until, qr_code, terms_conditions
) VALUES 
(
  'coupon-001',
  'business-001',
  101, -- La Lechona de la Abuela
  '20% OFF en Lechona Familiar',
  'Descuento especial en porciones familiares de lechona auténtica',
  'percentage',
  20.0,
  50000, -- $50.000 COP mínimo
  50,
  '2024-09-12',
  '2024-12-31',
  'QR_LECHONA_20OFF',
  'Válido solo en porciones familiares. No acumulable con otras promociones.'
),
(
  'coupon-002',
  'business-001',
  NULL, -- Válido en todos los locales
  'Café + Postre por $12.000',
  'Combo especial: café de especialidad + postre tradicional',
  'fixed_amount',
  12000, -- Precio fijo
  NULL,
  100,
  '2024-09-12',
  '2024-12-31',
  'QR_COMBO_CAFE',
  'Válido de lunes a viernes de 2pm a 6pm. Sujeto a disponibilidad.'
),
(
  'coupon-003',
  'business-001',
  102, -- El Fogón Tolimense
  '2x1 en Jugos Naturales',
  'Lleva 2 jugos naturales por el precio de 1',
  '2x1',
  NULL,
  15000, -- Mínimo $15.000
  30,
  '2024-09-12',
  '2024-10-31',
  'QR_2X1_JUGOS',
  'Aplica solo en jugos naturales de frutas. Un cupón por mesa.'
),
(
  'coupon-004',
  'business-001',
  105, -- Café Cultural Gourmet
  'Degustación Gratis',
  'Degustación gratuita de nuestros cafés de origen',
  'free_item',
  NULL,
  NULL,
  20,
  '2024-09-12',
  '2024-11-30',
  'QR_DEGUSTACION_FREE',
  'Una degustación por persona. Válido en horarios de 10am a 12pm.'
);

-- Generar algunas métricas de ejemplo (simulando actividad pasada)
INSERT OR REPLACE INTO place_visits (place_id, user_id, visit_type, timestamp, rating_given) VALUES
(101, 'user-001', 'checkin', '2024-09-10 14:30:00', 4.5),
(101, 'user-002', 'checkin', '2024-09-10 15:45:00', 4.8),
(101, 'user-003', 'route_inclusion', '2024-09-10 16:20:00', NULL),
(102, 'user-001', 'checkin', '2024-09-11 12:15:00', 4.2),
(102, 'user-004', 'coupon_view', '2024-09-11 12:30:00', NULL),
(105, 'user-002', 'checkin', '2024-09-11 10:45:00', 4.9),
(105, 'user-003', 'coupon_use', '2024-09-11 11:00:00', 4.7),
(129, 'user-001', 'checkin', '2024-09-11 16:30:00', 4.6),
(129, 'user-004', 'route_inclusion', '2024-09-11 17:00:00', NULL);

-- Métricas agregadas diarias
INSERT OR REPLACE INTO place_metrics_daily (
  place_id, date, total_visits, total_checkins, total_coupon_views, 
  total_coupon_uses, unique_visitors, avg_rating
) VALUES 
(101, '2024-09-10', 3, 2, 0, 0, 3, 4.65),
(101, '2024-09-11', 1, 1, 1, 0, 1, 4.5),
(102, '2024-09-11', 2, 1, 1, 0, 2, 4.2),
(105, '2024-09-11', 2, 1, 0, 1, 2, 4.8),
(129, '2024-09-11', 2, 1, 0, 0, 2, 4.6);

-- Algunos usos de cupones de ejemplo
INSERT OR REPLACE INTO coupon_usage (coupon_id, user_id, place_id, discount_applied, purchase_amount) VALUES
('coupon-004', 'user-003', 105, 0, 0), -- Degustación gratis
('coupon-002', 'user-002', 105, 12000, 12000); -- Combo café + postre

-- Configuraciones del empresario
INSERT OR REPLACE INTO business_settings (
  business_owner_id, 
  notifications_enabled, 
  email_notifications,
  business_hours,
  social_media
) VALUES (
  'business-001',
  1,
  1,
  '{"lunes": "8:00-20:00", "martes": "8:00-20:00", "miercoles": "8:00-20:00", "jueves": "8:00-20:00", "viernes": "8:00-22:00", "sabado": "9:00-22:00", "domingo": "10:00-18:00"}',
  '{"instagram": "@tolimense_group", "facebook": "GrupoGastronomicoTolimense", "whatsapp": "+57 310 987 6543"}'
);

-- Notificaciones de ejemplo
INSERT OR REPLACE INTO business_notifications (
  business_owner_id, type, title, message, related_id
) VALUES 
(
  'business-001',
  'coupon_used',
  'Cupón utilizado',
  'Un usuario utilizó tu cupón "Degustación Gratis" en Café Cultural Gourmet',
  'coupon-004'
),
(
  'business-001',
  'new_checkin',
  'Nueva visita',
  'Nuevo check-in en La Lechona de la Abuela con rating 4.5 estrellas',
  '101'
),
(
  'business-001',
  'milestone',
  '¡Felicitaciones!',
  'Has alcanzado 10 check-ins esta semana en tus locales',
  NULL
);