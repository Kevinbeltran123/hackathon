-- Datos semilla para el Sistema de Misiones de Ibagué
-- Misiones específicamente diseñadas para el turismo en Ibagué, Colombia

-- Insertar categorías para los lugares existentes
INSERT OR REPLACE INTO place_categories (place_id, category, subcategory, is_primary) VALUES
-- Lugares culturales
(1, 'cultural', 'conservatorio', 1), -- Conservatorio del Tolima
(2, 'historic', 'plaza', 1), -- Plaza de Bolívar
(3, 'cultural', 'teatro', 1), -- Teatro Tolima
(4, 'historic', 'cathedral', 1), -- Catedral Primada
(5, 'cultural', 'museo', 1), -- Panóptico
(6, 'nature', 'jardin', 1), -- Jardín Botánico
(7, 'nature', 'mirador', 1), -- Mirador Cerro San Javier
(8, 'recreation', 'parque', 1), -- Parque Centenario
(9, 'shopping', 'mercado', 1), -- Mercado La 21
(10, 'shopping', 'centro_comercial', 1), -- Centro Comercial La Estación
(11, 'restaurant', 'comida_tipica', 1), -- Restaurante El Bambuco
(12, 'restaurant', 'parrilla', 1), -- Parrilla Los Compadres
(13, 'cafe', 'cafe_local', 1), -- Café San Jorge
(14, 'recreation', 'cine', 1), -- Cine Colombia Ibagué
(15, 'recreation', 'estadio', 1); -- Estadio Manuel Murillo Toro

-- Misiones de Onboarding
INSERT OR REPLACE INTO missions (type, title, description, category, target_count, target_type, reward_type, reward_value, points, badge_icon, badge_color, difficulty, estimated_time) VALUES
('first_steps', '¡Bienvenido a Ibagué!', 'Haz tu primer check-in en cualquier lugar de nuestra hermosa Capital Musical', 'onboarding', 1, 'checkins', 'badge', 'Explorer Novato', 50, '🎵', '#10B981', 'easy', '5 minutos'),

('first_cultural', 'Primer Encuentro Cultural', 'Visita tu primer sitio cultural de Ibagué', 'onboarding', 1, 'categories', 'badge', 'Curioso Cultural', 75, '🏛️', '#8B5CF6', 'easy', '30 minutos');

-- Misiones de Exploración
INSERT OR REPLACE INTO missions (type, title, description, category, target_count, target_type, target_filter, reward_type, reward_value, points, badge_icon, badge_color, difficulty, estimated_time) VALUES
('explorer', 'Explorador Urbano', 'Descubre 5 lugares diferentes de Ibagué', 'exploration', 5, 'places', NULL, 'badge', 'Explorador Urbano', 200, '🗺️', '#3B82F6', 'medium', '2-3 horas'),

('local_lover', 'Amante de lo Local', 'Apoya 3 comercios locales diferentes', 'exploration', 3, 'categories', 'restaurant,cafe,shopping', 'badge', 'Defensor Local', 150, '❤️', '#EF4444', 'medium', '1-2 horas'),

('neighborhood_explorer', 'Explorador de Barrios', 'Visita lugares en 3 barrios diferentes de Ibagué', 'exploration', 3, 'neighborhoods', NULL, 'badge', 'Conocedor de Barrios', 175, '🏘️', '#F59E0B', 'medium', '3-4 horas');

-- Misiones Culturales
INSERT OR REPLACE INTO missions (type, title, description, category, target_count, target_type, target_filter, reward_type, reward_value, points, badge_icon, badge_color, difficulty, estimated_time) VALUES
('culture_buff', 'Guardián del Patrimonio', 'Explora 3 sitios históricos y culturales', 'cultural', 3, 'categories', 'cultural,historic', 'badge', 'Guardián Cultural', 225, '🏺', '#6366F1', 'medium', '2-3 horas'),

('music_lover', 'Alma Musical', 'Visita los principales espacios musicales de la Capital Musical', 'cultural', 2, 'specific_places', 'conservatorio,teatro', 'badge', 'Alma de Bambuco', 300, '🎼', '#EC4899', 'hard', '3-4 horas'),

('heritage_hunter', 'Cazador de Historia', 'Descubre todos los sitios históricos del centro', 'cultural', 4, 'categories', 'historic', 'badge', 'Historiador Local', 400, '📜', '#92400E', 'hard', '4-5 horas');

-- Misiones Gastronómicas
INSERT OR REPLACE INTO missions (type, title, description, category, target_count, target_type, target_filter, reward_type, reward_value, points, badge_icon, badge_color, difficulty, estimated_time) VALUES
('foodie', 'Degustador Tolimense', 'Prueba la gastronomía en 3 lugares diferentes', 'food', 3, 'categories', 'restaurant,cafe', 'badge', 'Foodie Tolimense', 200, '🍽️', '#F97316', 'medium', '2-3 horas'),

('coffee_lover', 'Amante del Café', 'Visita 2 cafeterías y descubre el café del Tolima', 'food', 2, 'categories', 'cafe', 'badge', 'Catador de Café', 125, '☕', '#92400E', 'easy', '1 hora'),

('local_flavors', 'Sabores Auténticos', 'Disfruta comida típica en el Mercado La 21', 'food', 1, 'specific_places', 'mercado', 'badge', 'Explorador de Sabores', 150, '🌶️', '#DC2626', 'easy', '45 minutos');

-- Misiones de Naturaleza
INSERT OR REPLACE INTO missions (type, title, description, category, target_count, target_type, target_filter, reward_type, reward_value, points, badge_icon, badge_color, difficulty, estimated_time) VALUES
('nature_lover', 'Conexión Natural', 'Visita los espacios verdes de Ibagué', 'nature', 2, 'categories', 'nature', 'badge', 'Amante de la Naturaleza', 175, '🌿', '#10B981', 'medium', '2 horas'),

('scenic_hunter', 'Cazador de Vistas', 'Captura las mejores vistas desde el Mirador', 'nature', 1, 'specific_places', 'mirador', 'badge', 'Cazador de Horizontes', 200, '🌄', '#059669', 'medium', '1 hora');

-- Misiones Temporales/Especiales
INSERT OR REPLACE INTO missions (type, title, description, category, target_count, target_type, reward_type, reward_value, points, badge_icon, badge_color, difficulty, estimated_time, is_repeatable) VALUES
('weekend_warrior', 'Guerrero del Fin de Semana', 'Completa una ruta completa durante el fin de semana', 'special', 5, 'checkins_weekend', 'badge', 'Aventurero Fin de Semana', 250, '🏃‍♂️', '#7C3AED', 'medium', '3-4 horas', 1),

('speed_runner', 'Velocista Urbano', 'Realiza 4 check-ins en un solo día', 'challenge', 4, 'checkins_daily', 'badge', 'Velocista de Ibagué', 300, '⚡', '#F59E0B', 'hard', '4-6 horas', 1),

('early_bird', 'Madrugador Cultural', 'Haz check-in antes de las 10 AM en un lugar cultural', 'special', 1, 'checkins_morning', 'badge', 'Madrugador Ibaguereño', 100, '🌅', '#0EA5E9', 'easy', '30 minutos', 1);

-- Misiones Sociales (preparadas para futuro)
INSERT OR REPLACE INTO missions (type, title, description, category, target_count, target_type, reward_type, reward_value, points, badge_icon, badge_color, difficulty, estimated_time, is_active) VALUES
('social_explorer', 'Embajador Social', 'Comparte tu experiencia en 2 lugares diferentes', 'social', 2, 'shared_checkins', 'badge', 'Embajador de Ibagué', 150, '📱', '#06B6D4', 'easy', '1 hora', 0);

-- Misiones Avanzadas/Desbloqueables
INSERT OR REPLACE INTO missions (type, title, description, category, target_count, target_type, target_filter, reward_type, reward_value, points, badge_icon, badge_color, difficulty, estimated_time, unlock_condition) VALUES
('ibague_master', 'Maestro Ibaguereño', 'Conviértete en experto visitando 10 lugares únicos', 'master', 10, 'places', NULL, 'badge', 'Maestro de Ibagué', 500, '👑', '#FBBF24', 'hard', '1-2 días', 'missions_completed:5'),

('culture_master', 'Maestro Cultural', 'Domina la cultura visitando todos los sitios patrimoniales', 'master', 6, 'categories', 'cultural,historic', 'badge', 'Maestro de la Cultura', 600, '🎭', '#7C2D12', 'hard', '2-3 días', 'culture_buff:completed');

-- Evento especial: Festival del Bambuco (ejemplo)
INSERT OR REPLACE INTO special_events (name, description, start_date, end_date, bonus_missions, bonus_multiplier, is_active) VALUES
('Festival del Bambuco 2024', 'Celebración anual de la música tradicional tolimense', '2024-06-01', '2024-06-30', '["music_lover", "culture_buff"]', 2.0, 0);