# 🛡️ Sistema Antifraude para Agencias de Turismo

Solución completa para prevenir fraude y suplantación de agencias de turismo mediante identidad digital y códigos QR de verificación.

## 🎯 Características

- ✅ **Registro de Agencias**: Registra agencias con nombre, NIT y RNT
- 🔐 **Certificados Digitales**: Genera certificados únicos para cada agencia
- 📱 **Códigos QR**: Genera QR codes para verificación rápida
- 🔍 **Verificación Instantánea**: Verifica la autenticidad de una agencia escaneando su QR
- 🌐 **Interfaz Web**: Interfaz amigable para registro y verificación
- 📊 **API RESTful**: Endpoints para integración con otros sistemas

## 🚀 Instalación y Configuración

### Requisitos
- Python 3.7+
- pip (gestor de paquetes de Python)

### Paso 1: Navegar al directorio
```bash
cd hackathon-main
```

### Paso 2: Crear entorno virtual (recomendado)
```bash
python -m venv venv
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate
```

### Paso 3: Instalar dependencias
```bash
pip install -r requirements.txt
```

### Paso 4: Ejecutar la aplicación
```bash
python app.py
```

El servidor estará disponible en: **http://localhost:5000**

## 📋 Uso del Sistema

### 1. Registro de Agencia
1. Abre tu navegador y ve a `http://localhost:5000`
2. Completa el formulario con:
   - **Nombre de la Agencia**
   - **NIT** (Número de Identificación Tributaria)
   - **RNT** (Registro Nacional de Turismo)
3. Haz clic en "Registrar Agencia"
4. El sistema generará:
   - Un ID único
   - Un certificado digital
   - Un código QR de verificación

### 2. Verificación de Agencia
- **Opción 1**: Escanea el código QR con cualquier lector de códigos QR
- **Opción 2**: Visita directamente la URL: `http://localhost:5000/verificar_agencia/<ID_AGENCIA>`

### 3. Ejemplo Práctico

**Registrar una agencia de ejemplo:**
```bash
# Usar curl para registrar via API
curl -X POST http://localhost:5000/registrar_agencia \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Aventuras Colombia Ltda",
    "nit": "900123456-1",
    "rnt": "RNT-12345"
  }'
```

**Respuesta esperada:**
```json
{
  "mensaje": "Agencia registrada exitosamente",
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "nombre": "Aventuras Colombia Ltda",
  "nit": "900123456-1",
  "rnt": "RNT-12345",
  "certificado": "a1b2c3d4e5f6...",
  "estado": "verificada",
  "url_verificacion": "/verificar_agencia/123e4567-e89b-12d3-a456-426614174000"
}
```

## 🔌 API Endpoints

### POST `/registrar_agencia`
Registra una nueva agencia de turismo.

**Cuerpo de la petición:**
```json
{
  "nombre": "Nombre de la Agencia",
  "nit": "123456789-0",
  "rnt": "RNT-XXXXX"
}
```

### GET `/verificar_agencia/<id>`
Verifica la información de una agencia por su ID.

**Respuesta HTML** con información de la agencia o mensaje de error si no existe.

### GET `/qr/<id>`
Obtiene la imagen del código QR de una agencia.

**Respuesta:** Imagen PNG del código QR.

### GET `/api/agencias`
Lista todas las agencias registradas (para propósitos de prueba).

## 📁 Estructura del Proyecto

```
hackathon-main/
├── app.py              # Aplicación principal de Flask
├── requirements.txt    # Dependencias de Python
├── README.md          # Documentación
├── qr_codes/          # Directorio donde se guardan los códigos QR (creado automáticamente)
│   └── <id_agencia>.png
```

## 🔒 Seguridad

- **IDs Únicos**: Cada agencia recibe un UUID único
- **Certificados Digitales**: Hashes SHA-256 seguros para cada agencia
- **Validación**: Verificación de campos obligatorios y prevención de duplicados por NIT
- **Estados de Verificación**: Sistema de estados para rastrear el estado de cada agencia

## 🧪 Pruebas

### Probar el registro:
1. Ve a `http://localhost:5000`
2. Registra una agencia de prueba
3. Observa el código QR generado

### Probar la verificación:
1. Copia la URL de verificación mostrada
2. Ábrela en una nueva pestaña
3. Verifica que muestre la información correcta

### Probar casos de error:
1. Intenta registrar una agencia con el mismo NIT dos veces
2. Intenta verificar un ID que no existe
3. Observa los mensajes de error apropiados

## 🔧 Personalización

### Cambiar el puerto:
```python
app.run(debug=True, port=8080)  # Cambiar 5000 por 8080
```

### Modificar el diseño:
Edita las plantillas HTML inline en `app.py` para personalizar la apariencia.

### Agregar validaciones:
Modifica las funciones de validación para agregar más verificaciones de seguridad.

## 🚨 Producción

Para usar en producción:

1. **Cambiar a base de datos real** (PostgreSQL, MySQL, etc.)
2. **Usar HTTPS** para todas las comunicaciones
3. **Agregar autenticación** para endpoints administrativos
4. **Implementar rate limiting**
5. **Usar un servidor WSGI** como Gunicorn
6. **Configurar logs** apropiados

## 📞 Soporte

Este sistema fue desarrollado para el hackathon. Para preguntas o mejoras, contacta al equipo de desarrollo.

---
**Nota**: Este es un MVP (Producto Mínimo Viable) diseñado para demostrar la funcionalidad antifraude. Para uso en producción, se requieren medidas adicionales de seguridad.