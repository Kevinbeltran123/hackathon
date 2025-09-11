
import Database from 'better-sqlite3';
import fs from 'fs';

const db = new Database('data.db');

// Migrate schema
const schema = fs.readFileSync('./schema.sql', 'utf-8');
db.exec(schema);

// Seed if empty
const count = db.prepare('SELECT COUNT(*) as c FROM place').get().c;

if (count === 0) {
  const places = JSON.parse(fs.readFileSync('./seed_places.json', 'utf-8'));
  const insertPlace = db.prepare(`
    INSERT INTO place (name, lat, lng, barrio, tags, base_duration, price_level, rating)
    VALUES (@name, @lat, @lng, @barrio, @tags, @base_duration, @price_level, @rating)
  `);
  const insertMany = db.transaction((rows) => {
    for (const r of rows) insertPlace.run(r);
  });
  insertMany(places);

  // Map names -> ids
  const placeRows = db.prepare('SELECT id, name FROM place').all();
  const byName = Object.fromEntries(placeRows.map(r => [r.name, r.id]));

  const acts = JSON.parse(fs.readFileSync('./seed_micro_activities.json', 'utf-8'));
  const insertAct = db.prepare(`
    INSERT INTO micro_activity (place_id, title, duration, time_start, time_end, capacity, active, benefit_text)
    VALUES (@place_id, @title, @duration, @time_start, @time_end, @capacity, @active, @benefit_text)
  `);
  const insertActs = db.transaction((rows) => {
    for (const a of rows) {
      const place_id = byName[a.place_name] || null;
      if (!place_id) continue;
      insertAct.run({ place_id, title: a.title, duration: a.duration, time_start: a.time_start, time_end: a.time_end, capacity: a.capacity, active: a.active, benefit_text: a.benefit_text });
    }
  });
  insertActs(acts);

  const merchants = JSON.parse(fs.readFileSync('./seed_merchants.json', 'utf-8'));
  const insertMerchant = db.prepare(`
    INSERT INTO merchant (email, password_hash, place_id) VALUES (@email, @password_hash, @place_id)
  `);
  const insertMerchants = db.transaction((rows) => {
    for (const m of rows) {
      const place_id = byName[m.place_name] || null;
      insertMerchant.run({ email: m.email, password_hash: m.password_hash, place_id });
    }
  });
  insertMerchants(merchants);

  console.log('[DB] Seeded initial data');
}

export default db;
