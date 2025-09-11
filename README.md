# Rutas VIVAS Tolima — MVP Starter

Monorepo simple con **web (React + Vite + Tailwind + Leaflet)** y **api (Node/Express + SQLite)**.
Permite:
- Crear **ruta inicial** según preferencias.
- Mostrar **mapa + timeline**.
- **Añadir algo cerca ahora**: inserta micro-actividades cercanas (10–30 min).
- **QR** para check-in e **insertar actividad**.
- **Panel comercio** (login demo) para publicar/toggle micro-actividades.

## Requisitos
- Node.js >= 18
- npm o pnpm
- (opcional) ngrok para demo externa.

## Cómo correr
### 1) API
```
cd api
npm install
npm run dev
```
Levanta en `http://localhost:4000`, crea `data.db`, migra esquema y **seedea** datos de Ibagué.

### 2) Web (PWA)
```
cd web
npm install
# Configura la URL del API si es distinta:
echo 'VITE_API_URL=http://localhost:4000' > .env.local
npm run dev
```
Abre `http://localhost:5173`.

## Usuarios demo (panel comercio)
- Email: `artesano@demo.com` / Clave: `demo123`
- Email: `cafe@demo.com`     / Clave: `demo123`

## Estructura
```
rutas-vivas-mvp/
  api/   -> Express + SQLite (better-sqlite3)
  web/   -> React + Vite + Tailwind + Leaflet
```

## Pitch / Demo (5 min)
1) Preferencias -> **Crear ruta** (ver mapa + timeline).
2) **Añadir algo cerca** -> inserta 1–2 actividades.
3) Escanear **QR** de un comercio -> agregar a ruta.
4) Ver **sellos** tras 3 check-ins.

> MVP: sin pagos, sin reseñas extensas. Todo listo para hackathon.
