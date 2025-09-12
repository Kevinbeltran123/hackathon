### Product Requirements Document (PRD)
Rutas VIVAS MVP – Real Locations System (Ibagué)

## 1) Overview
- **Product**: Real locations, validation, and routing for Rutas VIVAS MVP
- **Goal**: Let users search, validate, and route to real, verified places in Ibagué with accurate geocoding, distance/time estimates, and mission-based engagement.
- **Primary Users**:
  - Tourists/Residents exploring Ibagué
  - Local agencies/admins verifying and curating places

## 2) Objectives and Success Metrics
- **Objectives**
  - Provide reliable, verified location search and display within Ibagué.
  - Enable accurate routing and time estimates for walking/terrain.
  - Allow admins to add and validate verified places with minimal friction.
- **Success Metrics**
  - ≥95% of geocoding queries return a valid in-bounds result.
  - ≥90% of user searches return a relevant match within 2 seconds.
  - ≤1% rate of invalid/out-of-bounds place saves.
  - ≥50% of routes include at least one verified place.
  - Admin stats endpoint p95 latency ≤1.5s; uptime ≥99%.

## 3) Scope
- **In-scope (MVP)**
  - Real geocoding via OpenStreetMap Nominatim (default); optional Google Places and Mapbox when keys provided.
  - Location validation against Ibagué geographic bounds; enrichment when external APIs available.
  - Verified places dataset (20+ landmarks) and micro-activities (30+).
  - Routing distance/time calculation (walking; terrain-aware via integrated service).
  - Frontend search with autocomplete; verified place creation UI.
  - Caching layer and rate limiting for external APIs.
  - Admin stats endpoints and cache maintenance.
- **Out-of-scope (MVP)**
  - Geographies outside Ibagué.
  - Advanced authz/RBAC for all endpoints (basic protection acceptable).
  - Multi-modal navigation UI (bus/car), turn-by-turn guidance.
  - Payments, reviews, social features.

## 4) User Stories
- **Search & Explore**
  - As a visitor, I can search for places in Ibagué and see verified suggestions I trust.
  - As a visitor, I can view distance/time to a place to plan realistically.
- **Verification & Admin**
  - As an admin, I can add a place with coordinates and have it validated automatically.
  - As an admin, I can see verification stats (counts, sources used, cache entries).
  - As an admin, I can clean expired cache entries.
- **Routing**
  - As a visitor, I can get optimized routing estimates for single or multiple stops.
- **Reliability**
  - As a user, I get fast, consistent results even when third-party APIs rate-limit.

## 5) Functional Requirements
### 5.1 Backend (API)
- **Geocoding and Search**
  - Default: OpenStreetMap Nominatim; optional Google Places and Mapbox if keys set.
  - Cache geocoding results with TTL (default 24 hours).
  - Respect rate limiting via `MAX_API_CALLS_PER_MINUTE`.
  - Endpoints:
    - `GET /api/geocode?address=<query>` → candidates with confidence, source, address.
    - `GET /api/nearby-verified?lat=<lat>&lng=<lng>[&radius=<km>]` → verified places in radius.
- **Location Validation**
  - Middleware verifies coordinates within Ibagué bounds (`IBAGUE_BOUNDS_*`).
  - External verification when available; enrich with metadata (address, categories, phone if available).
- **Routing**
  - Compute distances and walking time; consider elevation/terrain through integrated routing service.
  - Support multi-stop optimization; return ordered stops, total distance and ETA.
  - Endpoint:
    - `GET /api/route?from=<lat,lng>&to=<lat,lng>[&stops=<...>]` → legs, distance, time.
- **Data**
  - Database stores: places with verification flags, sources, metadata; cache entries; seeded real data for 20+ Ibagué locations and 30+ micro-activities.
- **Admin**
  - `GET /api/admin/verification-stats` → totals, verified vs unverified, sources, active cache entries.
  - `POST /api/admin/clean-cache` → remove expired cache.
- **Environment & Config**
  - `.env` supports: `GOOGLE_PLACES_API_KEY`, `MAPBOX_ACCESS_TOKEN`, `OPENROUTE_SERVICE_API_KEY`.
  - Bounds, TTL, and rate limits configurable via env.

### 5.2 Frontend (Web)
- **Location Autocomplete**
  - `LocationAutocomplete` component performing real-time queries to API.
  - Show verification indicator, distance, and confidence score.
- **Verified Place Management**
  - `VerifiedPlaceCreator` to add new places.
  - Automatic validation and clear feedback (inside/outside bounds, success/failure).
- **Explore Map**
  - Display verified places and categories; radius visualization and nearby search.
  - Display route results: distance and ETA.
- **Missions Integration**
  - UI elements (badges/notifications) for missions tied to verified places.
- **Configuration**
  - `.env.local` includes `VITE_API_URL`, default map center/zoom, Ibagué radius.

## 6) Non-Functional Requirements
- **Performance**
  - p95 API responses ≤1.5s for cached geocoding/nearby queries; ≤2.5s with external call.
  - Autocomplete renders within 300ms on cache hit.
- **Reliability**
  - Graceful fallback to OSM if premium APIs hit rate limits.
  - Cache hit ratio target ≥70% for repeated queries.
- **Security**
  - Never expose API keys to frontend; basic CORS; protect admin endpoints (server secret or IP allowlist acceptable for MVP).
- **Scalability**
  - Configurable cache TTL; DB path to PostgreSQL/MySQL later.
- **Maintainability**
  - Clear services for geocoding, routing, caching, validation.
- **Observability**
  - Logging for source selection, validation failures, cache hits/misses.
  - Admin stats endpoint provides simple health signals.

## 7) Data Model (High-level)
- **Place**: id, name, lat, lng, address, category, isVerified, verificationSource, verificationDate, metadata (phone, website), createdAt, updatedAt
- **CacheEntry**: key, payload, source, createdAt, expiresAt
- **MicroActivity**: id, placeId, title, description, contextTags

## 8) APIs (Representative)
- `GET /api/geocode?address=<string>` → 200: list of `{ name, lat, lng, confidence, source, address }`
- `GET /api/nearby-verified?lat=<num>&lng=<num>[&radius=<km>]` → 200: list of verified places
- `GET /api/route?from=<lat,lng>&to=<lat,lng>[&stops=<lat,lng;...>]` → 200: `{ legs, totalDistance, totalDuration }`
- `GET /api/admin/verification-stats` → 200: `{ totals, verifiedVsUnverified, sources, activeCacheEntries }`
- `POST /api/admin/clean-cache` → 200: `{ removed: number }`

## 9) Environment & Setup
- **Backend**
  - Install: `cd api && npm install dotenv axios node-cache`
  - Env: copy `.env.example` to `.env` and configure keys and bounds (`IBAGUE_BOUNDS_*`, `LOCATION_CACHE_TTL_HOURS`, `MAX_API_CALLS_PER_MINUTE`).
  - DB reset for real data: remove `api/data.db` and restart server to reseed.
- **Frontend**
  - Env: copy `.env.example` to `web/.env.local` and set `VITE_API_URL`, defaults for center/zoom/radius.

## 10) Admin & Monitoring
- **Verification Stats**: totals (places), verified vs unverified, sources used, active cache entries.
- **Cache Maintenance**: manual clean of expired cache entries via endpoint.

## 11) Risks & Assumptions
- **External Dependencies**: Third-party API availability and rate limits; OSM used as baseline.
- **Geographic Constraint**: Strict Ibagué bounds may exclude fringe locations; bounds are configurable.
- **Data Accuracy**: Seeded data assumed accurate; admins can correct via verified place creator.

## 12) Milestones (MVP)
- M1: Backend geocoding + validation + caching + seeded data ready.
- M2: Frontend autocomplete and explore map with verified indicators.
- M3: Routing with terrain-aware estimates and multi-stop support.
- M4: Admin stats + cache maintenance; performance hardening.


