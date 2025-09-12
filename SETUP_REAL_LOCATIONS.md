# Rutas VIVAS MVP - Configuración de Ubicaciones Reales

Este documento explica cómo configurar y usar el sistema mejorado de ubicaciones reales para el proyecto Rutas VIVAS MVP.

## 🚀 Cambios Implementados

### Backend (API)

1. **Servicios de Geocodificación**
   - Integración con OpenStreetMap Nominatim (gratuito)
   - Soporte para Google Places API (opcional)
   - Soporte para Mapbox Geocoding API (opcional)
   - Sistema de caché para optimizar consultas

2. **Validación de Ubicaciones**
   - Middleware para validar coordenadas dentro de Ibagué
   - Verificación automática con APIs externas
   - Enriquecimiento de datos de ubicación

3. **Cálculos de Rutas Reales**
   - Cálculo de distancias y tiempos considerando terreno
   - Integración con servicios de rutas externos
   - Optimización de rutas múltiples

4. **Base de Datos Actualizada**
   - Nuevos campos para verificación de ubicaciones
   - Tabla de caché para APIs externas
   - Datos reales de 20 ubicaciones emblemáticas de Ibagué

### Frontend (Web)

1. **Autocompletado de Ubicaciones**
   - Componente `LocationAutocomplete` con búsqueda en tiempo real
   - Indicadores de verificación de ubicaciones
   - Información de distancia y confianza

2. **Creador de Lugares Verificados**
   - Componente `VerifiedPlaceCreator` para agregar nuevos lugares
   - Validación automática de ubicaciones
   - Interfaz intuitiva con retroalimentación visual

## 🛠️ Instalación y Configuración

### 1. Instalar Dependencias Nuevas

**Backend:**
```bash
cd api
npm install dotenv axios node-cache
```

### 2. Configurar Variables de Entorno

**API (.env):**
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus claves de API (opcionales):
```env
# APIs externas (opcionales para funciones avanzadas)
GOOGLE_PLACES_API_KEY=tu_clave_google_aqui
MAPBOX_ACCESS_TOKEN=tu_token_mapbox_aqui
OPENROUTE_SERVICE_API_KEY=tu_clave_openroute_aqui

# Configuración de caché y límites
LOCATION_CACHE_TTL_HOURS=24
MAX_API_CALLS_PER_MINUTE=60

# Límites geográficos de Ibagué
IBAGUE_BOUNDS_SOUTH=4.35
IBAGUE_BOUNDS_NORTH=4.55
IBAGUE_BOUNDS_WEST=-75.35
IBAGUE_BOUNDS_EAST=-75.15
```

**Web (.env.local):**
```bash
cp .env.example .env.local
```

Edita el archivo `.env.local`:
```env
VITE_API_URL=http://localhost:4000
VITE_DEFAULT_CENTER_LAT=4.4389
VITE_DEFAULT_CENTER_LNG=-75.2043
VITE_DEFAULT_ZOOM=14
VITE_IBAGUE_RADIUS_KM=15
```

### 3. Reiniciar con Datos Reales

**Importante:** El sistema ahora usa datos reales de Ibagué. Si tienes una base de datos existente, elimínala para cargar los nuevos datos:

```bash
cd api
rm data.db  # Elimina la base de datos antigua
npm run dev  # Reinicia el servidor para crear la nueva BD con datos reales
```

### 4. Verificar la Instalación

1. **Iniciar el API:**
```bash
cd api
npm run dev
```

2. **Iniciar el Frontend:**
```bash
cd web
npm run dev
```

3. **Probar endpoints nuevos:**
   - `GET /api/geocode?address=Plaza de Bolívar Ibagué`
   - `GET /api/nearby-verified?lat=4.4389&lng=-75.2043`
   - `GET /api/admin/verification-stats`

## 🌟 Funcionalidades Principales

### 1. Búsqueda de Ubicaciones Reales
- Busca lugares por nombre usando APIs externas
- Autocompleta con ubicaciones verificadas
- Filtra resultados dentro de Ibagué

### 2. Validación Automática
- Verifica que las coordenadas sean válidas
- Confirma que las ubicaciones estén en Ibagué
- Enriquece datos con información externa

### 3. Cálculos de Ruta Precisos
- Considera elevación y terreno de Ibagué
- Estima tiempos de caminata realistas
- Optimiza rutas con múltiples paradas

### 4. Datos Verificados
- 20 ubicaciones emblemáticas de Ibagué
- 32 micro-actividades contextuales
- Información completa (direcciones, teléfonos, tipos de negocio)

## 📍 Ubicaciones Incluidas

El sistema incluye datos verificados de:

- **Culturales:** Conservatorio del Tolima, Teatro Tolima, Museo de Arte
- **Históricas:** Plaza de Bolívar, Catedral Primada, Panóptico
- **Naturales:** Jardín Botánico San Jorge, Mirador Cerro de San Javier
- **Comerciales:** Centro Comercial La Estación, Mercado La 21
- **Educativas:** Universidad del Tolima, Biblioteca Darío Echandía
- **Y más...**

## 🔧 APIs Opcionales

### Google Places API
1. Crear proyecto en [Google Cloud Console](https://console.cloud.google.com)
2. Habilitar "Places API" y "Geocoding API"
3. Crear clave de API y restricciones
4. Añadir a `.env`: `GOOGLE_PLACES_API_KEY=tu_clave`

### Mapbox
1. Registrarse en [Mapbox](https://www.mapbox.com)
2. Obtener token de acceso
3. Añadir a `.env`: `MAPBOX_ACCESS_TOKEN=tu_token`

### OpenRouteService
1. Registrarse en [OpenRouteService](https://openrouteservice.org)
2. Obtener clave de API
3. Añadir a `.env`: `OPENROUTE_SERVICE_API_KEY=tu_clave`

## 🐛 Solución de Problemas

### Error: "Location is outside Ibagué bounds"
- Verifica que las coordenadas estén dentro de los límites configurados
- Ajusta las variables `IBAGUE_BOUNDS_*` si es necesario

### Error: "Rate limit exceeded"
- Reduce la frecuencia de búsquedas
- Aumenta `MAX_API_CALLS_PER_MINUTE` si tienes plan premium en APIs

### Sin resultados en búsqueda
- Verifica conexión a internet para APIs externas
- OpenStreetMap Nominatim funciona sin clave de API
- Revisa logs del servidor para errores específicos

### Base de datos con datos antiguos
- Elimina `api/data.db` y reinicia el servidor
- Los nuevos datos se cargarán automáticamente

## 📊 Monitoreo

### Estadísticas de Verificación
Accede a `GET /api/admin/verification-stats` para ver:
- Total de lugares en la base de datos
- Lugares verificados vs no verificados
- Fuentes de verificación utilizadas
- Entradas de caché activas

### Limpieza de Caché
Ejecuta `POST /api/admin/clean-cache` para eliminar entradas expiradas.

## 🚀 Producción

Para producción:

1. **Variables de entorno:**
   - Configura claves de API reales
   - Ajusta límites de rate limiting
   - Configura `NODE_ENV=production`

2. **Base de datos:**
   - Considera usar PostgreSQL o MySQL
   - Implementa backups regulares
   - Monitorea el crecimiento del caché

3. **Seguridad:**
   - Nunca expongas claves de API en el frontend
   - Implementa autenticación para endpoints de administración
   - Configura CORS apropiadamente

## 🤝 Contribuir

Para agregar nuevas ubicaciones reales:

1. Usa el componente `VerifiedPlaceCreator`
2. O edita `api/seed_places_real.json`
3. Reinicia el servidor para cargar cambios
4. Verifica que las coordenadas sean precisas

¡El sistema ahora está listo para trabajar con ubicaciones reales y verificables de Ibagué!