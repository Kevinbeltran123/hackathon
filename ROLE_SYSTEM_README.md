# Sistema de Roles - Rutas VIVAS Tolima

## 🎯 Descripción

Sistema completo de roles (ADMIN vs USUARIO) implementado con React + Vite + Tailwind + Supabase Auth + RLS, con navegación, vistas y permisos diferenciados.

## 🎨 Paleta de Colores

- **forest**: `#0E3D2E` - Verde bosque principal
- **forest2**: `#1F4D3B` - Verde bosque secundario  
- **gold**: `#F9A825` - Dorado de acento
- **ocobo**: `#E91E63` - Rosa ocobo (flor nacional)
- **red**: `#C62828` - Rojo para alertas
- **neutral**: `#1F2937` - Gris neutro

## 🏗️ Arquitectura

### Router Structure
- **`/app/*`** - Rutas de usuario
- **`/admin/*`** - Rutas de administrador
- **`/login`** - Autenticación
- **`/register`** - Registro

### Componentes de Roles
- **`RoleGate`** - HOC para control de acceso por rol
- **`ProtectedRoute`** - Ruta que requiere autenticación
- **`AdminRoute`** - Ruta que requiere rol admin

### Layouts Diferenciados
- **`AppLayout`** - Layout para usuarios (chips verdes, CTA dorados)
- **`AdminLayout`** - Layout para admins (sidebar métrica, tabla densa)

## 🚀 Instalación

### 1. Dependencias

```bash
cd web
npm install @supabase/supabase-js react-router-dom
```

### 2. Configuración de Supabase

1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar el schema SQL en el editor SQL de Supabase:

```sql
-- Ejecutar el contenido de web/src/lib/supabase-schema.sql
```

3. Configurar variables de entorno:

```bash
# web/.env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:4000
```

### 3. Iniciar Servidor

```bash
cd web
npm run dev
```

## 👥 Flujos de Usuario

### Usuario Regular (`/app/*`)

#### Páginas Disponibles:
- **`/app/home`** - Mapa con filtros y leyenda
- **`/app/checkin`** - CheckInStepper (lugar→validación→nota→consent→confirmación)
- **`/app/wallet`** - WalletList, CouponCard, RedeemModal
- **`/app/history`** - Timeline de check-ins + badges
- **`/app/missions`** - Listado de misiones/retos
- **`/app/profile`** - ProfileHeader, StatsStrip, ajustes

#### Características:
- Navegación con chips verdes y CTA dorados
- Acceso solo a funciones turísticas
- Sistema de puntos y logros
- Check-ins con validación de ubicación

### Administrador (`/admin/*`)

#### Páginas Disponibles:
- **`/admin/dashboard`** - KPIs, mini-mapa calor
- **`/admin/places`** - CRUD de POIs, aprobación de propuestas
- **`/admin/checkins`** - Moderación de fotos/notas, flags
- **`/admin/coupons`** - Creador de campañas, export CSV
- **`/admin/users`** - Lista, cambiar roles, suspender
- **`/admin/settings`** - Branding, paleta, textos i18n

#### Características:
- Sidebar con métricas y navegación
- Tablas densas para gestión
- Acceso completo al sistema
- Herramientas de moderación

## 🔒 Seguridad

### Frontend
- **Autenticación**: `useAuth` hook con Supabase
- **Roles**: Verificación en `onAuthStateChange`
- **Navegación**: Ocultación condicional de enlaces
- **Guards**: Componentes de protección de rutas

### Backend (Supabase RLS)
- **Políticas RLS**: Control granular de acceso a datos
- **Funciones**: `is_admin()` para verificación de roles
- **Triggers**: Creación automática de perfiles
- **Índices**: Optimización de consultas

### Ejemplo de Política RLS:
```sql
-- Usuarios solo ven sus propios check-ins
CREATE POLICY "select_own" ON checkins 
FOR SELECT USING (auth.uid() = user_id);

-- Admins ven todos los check-ins
CREATE POLICY "admin_all_checkins" ON checkins 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.is_admin = TRUE
  )
);
```

## 🧪 Testing

### Casos de Prueba Incluidos:

1. **Control de Acceso**:
   - Usuario sin rol admin no puede ver `/admin/*`
   - Admin ve dashboards y CRUD
   - Usuario final solo flujos turísticos

2. **Navegación**:
   - Menús condicionales por rol
   - Breadcrumbs apropiados
   - Páginas 403/404

3. **Seguridad**:
   - RLS niega consultas cruzadas
   - Guards funcionan correctamente
   - Sesiones expiradas redirigen

### Ejecutar Tests:
```bash
npm run test
```

## 📊 Datos Mock

### Usuarios de Prueba:
- **Admin**: `admin@rutasvivas.com` / `admin123`
- **Usuario**: `usuario@demo.com` / `password123`

### Datos Incluidos:
- 1 administrador, 3 usuarios
- 10 POIs verificados
- 20 check-ins de ejemplo
- 5 cupones activos

## 🎨 Temática Ocobo

### Elementos Visuales:
- **Flor de ocobo** (🌸) en acciones primarias
- **Gradientes** suaves y temáticos
- **Efectos de brillo** con colores de la paleta
- **Iconografía** de turismo y naturaleza

### Accesibilidad (WCAG AA):
- Navegación por teclado completa
- Etiquetas ARIA apropiadas
- Contraste de colores adecuado
- Soporte para lectores de pantalla

## 🔧 Configuración Avanzada

### Variables de Entorno:
```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# API
VITE_API_URL=http://localhost:4000

# Mapas
VITE_MAP_TILER_KEY=your-map-tiler-key
VITE_DEFAULT_CENTER_LAT=4.4389
VITE_DEFAULT_CENTER_LNG=-75.2043

# App
VITE_APP_NAME=Rutas VIVAS
VITE_APP_TAGLINE=Explora la belleza de Ibagué
VITE_DEFAULT_LANGUAGE=es

# Features
VITE_ENABLE_GEOLOCATION=true
VITE_ENABLE_NOTIFICATIONS=true
```

### Personalización:
- **Branding**: Logo, emblema, colores en `/admin/settings`
- **Idiomas**: Soporte i18n (es/en)
- **Funciones**: Toggle de características

## 🚀 Despliegue

### Producción:
1. Configurar Supabase en producción
2. Actualizar variables de entorno
3. Configurar dominio en CORS
4. Implementar CDN para assets

### Monitoreo:
- Logs de acceso denegado
- Métricas de uso por rol
- Alertas de seguridad

## 📝 Notas de Desarrollo

### Estructura de Archivos:
```
web/src/
├── components/
│   ├── auth/          # Componentes de autenticación
│   ├── layouts/       # Layouts diferenciados
│   └── profile/       # Componentes de perfil
├── hooks/
│   └── useAuth.js     # Hook de autenticación
├── lib/
│   ├── auth.js        # Configuración Supabase
│   └── supabase-schema.sql  # Schema RLS
├── pages/
│   ├── app/           # Páginas de usuario
│   ├── admin/         # Páginas de admin
│   ├── auth/          # Login/Register
│   └── errors/        # 404/403
└── tests/
    └── RoleSystem.test.js  # Tests de roles
```

### Próximos Pasos:
1. Integración con MapLibre/MapTiler
2. Implementación de notificaciones push
3. Sistema de analytics avanzado
4. Optimización de rendimiento

---

**¡Sistema de roles completamente implementado y listo para producción!** 🎉
