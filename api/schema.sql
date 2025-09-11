
CREATE TABLE IF NOT EXISTS place (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  barrio TEXT,
  tags TEXT,
  base_duration INTEGER,
  price_level INTEGER,
  rating REAL DEFAULT 4.3
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
