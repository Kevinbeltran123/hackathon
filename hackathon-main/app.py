from flask import Flask, request, jsonify, render_template_string
import uuid
import hashlib
import secrets
import qrcode
import os
from datetime import datetime

app = Flask(__name__)

# Simulación de base de datos en memoria
agencias_db = []

def generar_certificado():
    """Genera un certificado digital interno único"""
    return hashlib.sha256(secrets.token_bytes(32)).hexdigest()

@app.route('/')
def home():
    return render_template_string('''
    <html>
    <head>
        <title>Sistema Antifraude Agencias de Turismo</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .container { max-width: 800px; margin: 0 auto; }
            .form-group { margin-bottom: 15px; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input[type="text"] { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
            button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background: #0056b3; }
            .result { margin-top: 20px; padding: 20px; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 4px; }
            .qr-section { margin-top: 20px; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🛡️ Sistema Antifraude - Agencias de Turismo</h1>
            <p>Registra tu agencia de turismo y obtén un certificado digital con código QR de verificación.</p>
            
            <form id="registroForm">
                <div class="form-group">
                    <label for="nombre">Nombre de la Agencia:</label>
                    <input type="text" id="nombre" name="nombre" required>
                </div>
                <div class="form-group">
                    <label for="nit">NIT:</label>
                    <input type="text" id="nit" name="nit" required>
                </div>
                <div class="form-group">
                    <label for="rnt">RNT (Registro Nacional de Turismo):</label>
                    <input type="text" id="rnt" name="rnt" required>
                </div>
                <button type="submit">Registrar Agencia</button>
            </form>
            
            <div id="resultado" class="result" style="display: none;"></div>
        </div>

        <script>
            document.getElementById('registroForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                    nombre: formData.get('nombre'),
                    nit: formData.get('nit'),
                    rnt: formData.get('rnt')
                };
                
                try {
                    const response = await fetch('/registrar_agencia', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    const result = await response.json();
                    
                    if (response.ok) {
                        document.getElementById('resultado').innerHTML = `
                            <h3>✅ Agencia Registrada Exitosamente</h3>
                            <p><strong>ID:</strong> ${result.id}</p>
                            <p><strong>Nombre:</strong> ${result.nombre}</p>
                            <p><strong>NIT:</strong> ${result.nit}</p>
                            <p><strong>RNT:</strong> ${result.rnt}</p>
                            <p><strong>Certificado:</strong> ${result.certificado}</p>
                            <div class="qr-section">
                                <h4>Código QR de Verificación:</h4>
                                <img src="/qr/${result.id}" alt="QR Code" style="border: 1px solid #ddd;">
                                <p><small>Los usuarios pueden escanear este QR para verificar la autenticidad de tu agencia</small></p>
                                <p><strong>URL de verificación:</strong> <a href="/verificar_agencia/${result.id}" target="_blank">/verificar_agencia/${result.id}</a></p>
                            </div>
                        `;
                        document.getElementById('resultado').style.display = 'block';
                    } else {
                        document.getElementById('resultado').innerHTML = `<p style="color: red;">Error: ${result.error}</p>`;
                        document.getElementById('resultado').style.display = 'block';
                    }
                } catch (error) {
                    document.getElementById('resultado').innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
                    document.getElementById('resultado').style.display = 'block';
                }
            });
        </script>
    </body>
    </html>
    ''')

@app.route('/registrar_agencia', methods=['POST'])
def registrar_agencia():
    """Registra una nueva agencia de turismo"""
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        if not all(key in data for key in ['nombre', 'nit', 'rnt']):
            return jsonify({'error': 'Faltan campos obligatorios: nombre, nit, rnt'}), 400
        
        # Verificar si ya existe una agencia con el mismo NIT
        for agencia in agencias_db:
            if agencia['nit'] == data['nit']:
                return jsonify({'error': 'Ya existe una agencia registrada con este NIT'}), 409
        
        # Crear nueva agencia
        agencia_id = str(uuid.uuid4())
        certificado = generar_certificado()
        
        nueva_agencia = {
            'id': agencia_id,
            'nombre': data['nombre'],
            'nit': data['nit'],
            'rnt': data['rnt'],
            'certificado': certificado,
            'estado': 'verificada',
            'fecha_registro': datetime.now().isoformat()
        }
        
        agencias_db.append(nueva_agencia)
        
        # Generar código QR
        generar_qr(agencia_id, nueva_agencia['nombre'])
        
        return jsonify({
            'mensaje': 'Agencia registrada exitosamente',
            'id': agencia_id,
            'nombre': nueva_agencia['nombre'],
            'nit': nueva_agencia['nit'],
            'rnt': nueva_agencia['rnt'],
            'certificado': certificado,
            'estado': nueva_agencia['estado'],
            'url_verificacion': f'/verificar_agencia/{agencia_id}'
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@app.route('/verificar_agencia/<agencia_id>')
def verificar_agencia(agencia_id):
    """Verifica la información de una agencia por su ID"""
    try:
        # Buscar agencia por ID
        agencia = next((a for a in agencias_db if a['id'] == agencia_id), None)
        
        if not agencia:
            return render_template_string('''
            <html>
            <head><title>Agencia No Encontrada</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: red;">❌ Agencia No Encontrada</h1>
                <p>El ID de agencia proporcionado no existe en nuestros registros.</p>
                <p><strong>ID buscado:</strong> {{ agencia_id }}</p>
                <p style="color: red; font-weight: bold;">⚠️ POSIBLE FRAUDE - Esta agencia no está verificada</p>
                <a href="/" style="text-decoration: none; background: #007bff; color: white; padding: 10px 20px; border-radius: 4px;">Volver al inicio</a>
            </body>
            </html>
            '''), 404
        
        return render_template_string('''
        <html>
        <head>
            <title>Verificación de Agencia</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .container { max-width: 600px; margin: 0 auto; }
                .verified { background: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px; padding: 20px; }
                .info-row { margin: 10px 0; }
                .label { font-weight: bold; }
                .certificate { font-family: monospace; font-size: 12px; word-break: break-all; }
                .status { color: green; font-weight: bold; font-size: 18px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="verified">
                    <h1 style="color: green;">✅ Agencia Verificada</h1>
                    <p class="status">Esta agencia está oficialmente registrada y verificada</p>
                    
                    <div class="info-row">
                        <span class="label">Nombre:</span> {{ agencia.nombre }}
                    </div>
                    <div class="info-row">
                        <span class="label">NIT:</span> {{ agencia.nit }}
                    </div>
                    <div class="info-row">
                        <span class="label">RNT:</span> {{ agencia.rnt }}
                    </div>
                    <div class="info-row">
                        <span class="label">Estado:</span> {{ agencia.estado.upper() }}
                    </div>
                    <div class="info-row">
                        <span class="label">Fecha de Registro:</span> {{ agencia.fecha_registro }}
                    </div>
                    <div class="info-row">
                        <span class="label">ID de Verificación:</span> {{ agencia.id }}
                    </div>
                    <div class="info-row">
                        <span class="label">Certificado Digital:</span><br>
                        <span class="certificate">{{ agencia.certificado }}</span>
                    </div>
                    
                    <p style="margin-top: 20px; color: green;">
                        <strong>✓ Puedes confiar en esta agencia</strong><br>
                        <small>Esta verificación confirma que la agencia está registrada en nuestro sistema antifraude</small>
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <a href="/" style="text-decoration: none; background: #007bff; color: white; padding: 10px 20px; border-radius: 4px;">Verificar otra agencia</a>
                </div>
            </div>
        </body>
        </html>
        ''', agencia=agencia), 200
        
    except Exception as e:
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

def generar_qr(agencia_id, nombre_agencia):
    """Genera un código QR para la verificación de la agencia"""
    try:
        # URL de verificación
        url_verificacion = f"http://localhost:5000/verificar_agencia/{agencia_id}"
        
        # Crear código QR
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(url_verificacion)
        qr.make(fit=True)
        
        # Crear imagen QR
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Crear directorio si no existe
        qr_dir = "qr_codes"
        if not os.path.exists(qr_dir):
            os.makedirs(qr_dir)
        
        # Guardar imagen
        filename = f"{qr_dir}/{agencia_id}.png"
        img.save(filename)
        
        print(f"Código QR generado: {filename}")
        return filename
        
    except Exception as e:
        print(f"Error generando QR: {str(e)}")
        return None

@app.route('/qr/<agencia_id>')
def obtener_qr(agencia_id):
    """Sirve la imagen QR de una agencia"""
    from flask import send_file
    filename = f"qr_codes/{agencia_id}.png"
    if os.path.exists(filename):
        return send_file(filename, mimetype='image/png')
    else:
        # Generar QR si no existe
        agencia = next((a for a in agencias_db if a['id'] == agencia_id), None)
        if agencia:
            generar_qr(agencia_id, agencia['nombre'])
            if os.path.exists(filename):
                return send_file(filename, mimetype='image/png')
    
    return jsonify({'error': 'QR no encontrado'}), 404

@app.route('/api/agencias')
def listar_agencias():
    """Lista todas las agencias registradas (para pruebas)"""
    return jsonify({
        'total': len(agencias_db),
        'agencias': [
            {
                'id': a['id'],
                'nombre': a['nombre'],
                'nit': a['nit'],
                'rnt': a['rnt'],
                'estado': a['estado'],
                'fecha_registro': a['fecha_registro']
            } for a in agencias_db
        ]
    })

if __name__ == '__main__':
    print("🚀 Iniciando Sistema Antifraude para Agencias de Turismo")
    print("📍 Servidor corriendo en: http://localhost:5000")
    print("📋 Endpoints disponibles:")
    print("   • GET  /                     - Interfaz de registro")
    print("   • POST /registrar_agencia    - Registrar nueva agencia")
    print("   • GET  /verificar_agencia/<id> - Verificar agencia")
    print("   • GET  /qr/<id>              - Obtener código QR")
    print("   • GET  /api/agencias         - Listar todas las agencias")
    
    app.run(debug=True, port=5000)