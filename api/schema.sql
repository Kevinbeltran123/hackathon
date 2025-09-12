
CREATE TABLE IF NOT EXISTS place (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  barrio TEXT,
  tags TEXT,
  base_duration INTEGER,
  price_level INTEGER,
  rating REAL DEFAULT 4.3,
  address TEXT,
  phone TEXT,
  website TEXT,
  google_place_id TEXT,
  osm_id TEXT,
  verified INTEGER DEFAULT 0,
  verification_source TEXT,
  last_verified TEXT,
  business_type TEXT,
  opening_hours TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS micro_activity (
  id INTEGER PRIMARY KEY,
  place_id INTEGER REFERENCES place(id),
  title TEXT,
  duration INTEGER,
  time_start TEXT,
  time_end TEXT,
  capacity INTEGER,
  active INTEGER DEFAULT 1,
  benefit_text TEXT
);

CREATE TABLE IF NOT EXISTS merchant (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  place_id INTEGER REFERENCES place(id)
);

CREATE TABLE IF NOT EXISTS checkin (
  id INTEGER PRIMARY KEY,
  user_id TEXT,
  place_id INTEGER,
  activity_id INTEGER,
  ts TEXT
);

-- Cache table for external API responses
CREATE TABLE IF NOT EXISTS location_cache (
  id INTEGER PRIMARY KEY,
  query_hash TEXT UNIQUE,
  response_data TEXT,
  api_source TEXT,
  created_at TEXT,
  expires_at TEXT
);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_place_location ON place(lat, lng);
CREATE INDEX IF NOT EXISTS idx_place_verification ON place(verified, verification_source);
CREATE INDEX IF NOT EXISTS idx_cache_query ON location_cache(query_hash);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON location_cache(expires_at);
