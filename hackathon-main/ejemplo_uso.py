#!/usr/bin/env python3
"""
Ejemplo de uso del Sistema Antifraude para Agencias de Turismo
Este script demuestra cómo usar la API programáticamente
"""

import requests
import json
import time

# Configuración
BASE_URL = "http://localhost:5000"

def registrar_agencia_ejemplo():
    """Registra algunas agencias de ejemplo"""
    
    agencias_ejemplo = [
        {
            "nombre": "Aventuras Colombia Ltda",
            "nit": "900123456-1",
            "rnt": "RNT-12345"
        },
        {
            "nombre": "Turismo del Café S.A.S",
            "nit": "800987654-2",
            "rnt": "RNT-67890"
        },
        {
            "nombre": "Expediciones Amazónicas",
            "nit": "700555444-3",
            "rnt": "RNT-11111"
        }
    ]
    
    print("🚀 Registrando agencias de ejemplo...")
    print("=" * 50)
    
    agencias_registradas = []
    
    for i, agencia in enumerate(agencias_ejemplo, 1):
        try:
            print(f"\n{i}. Registrando: {agencia['nombre']}")
            
            response = requests.post(
                f"{BASE_URL}/registrar_agencia",
                headers={"Content-Type": "application/json"},
                json=agencia
            )
            
            if response.status_code == 201:
                data = response.json()
                print(f"   ✅ Registrada exitosamente")
                print(f"   📋 ID: {data['id']}")
                print(f"   🔐 Certificado: {data['certificado'][:20]}...")
                print(f"   🔗 Verificación: {BASE_URL}{data['url_verificacion']}")
                
                agencias_registradas.append(data)
                
            else:
                print(f"   ❌ Error: {response.status_code}")
                print(f"   📄 Respuesta: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print("   ❌ Error: No se puede conectar al servidor")
            print("   💡 Asegúrate de que el servidor esté ejecutándose en http://localhost:5000")
            return []
        except Exception as e:
            print(f"   ❌ Error inesperado: {str(e)}")
    
    return agencias_registradas

def verificar_agencia_ejemplo(agencia_id):
    """Verifica una agencia específica"""
    try:
        print(f"\n🔍 Verificando agencia: {agencia_id}")
        
        response = requests.get(f"{BASE_URL}/verificar_agencia/{agencia_id}")
        
        if response.status_code == 200:
            print(f"   ✅ Agencia verificada correctamente")
            print(f"   🌐 URL: {BASE_URL}/verificar_agencia/{agencia_id}")
        else:
            print(f"   ❌ Error al verificar: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")

def listar_todas_las_agencias():
    """Lista todas las agencias registradas"""
    try:
        print("\n📋 Listando todas las agencias registradas...")
        
        response = requests.get(f"{BASE_URL}/api/agencias")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   📊 Total de agencias: {data['total']}")
            
            if data['total'] > 0:
                print("\n   Agencias registradas:")
                for agencia in data['agencias']:
                    print(f"   • {agencia['nombre']}")
                    print(f"     NIT: {agencia['nit']} | RNT: {agencia['rnt']}")
                    print(f"     Estado: {agencia['estado']} | ID: {agencia['id'][:8]}...")
                    print()
        else:
            print(f"   ❌ Error: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")

def main():
    """Función principal del ejemplo"""
    print("🛡️ Sistema Antifraude - Agencias de Turismo")
    print("📋 Ejemplo de Uso Programático")
    print("=" * 60)
    
    # Verificar que el servidor esté ejecutándose
    try:
        response = requests.get(BASE_URL)
        if response.status_code != 200:
            print("❌ Error: El servidor no está respondiendo correctamente")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Error: No se puede conectar al servidor")
        print("💡 Ejecuta 'python app.py' en otra terminal para iniciar el servidor")
        return
    
    print("✅ Servidor conectado correctamente")
    
    # Registrar agencias de ejemplo
    agencias = registrar_agencia_ejemplo()
    
    if agencias:
        print("\n" + "=" * 50)
        
        # Verificar la primera agencia registrada
        if len(agencias) > 0:
            verificar_agencia_ejemplo(agencias[0]['id'])
        
        # Listar todas las agencias
        listar_todas_las_agencias()
        
        print("\n🎉 ¡Ejemplo completado!")
        print("\n📱 Próximos pasos:")
        print(f"   1. Abre tu navegador en: {BASE_URL}")
        print("   2. Registra más agencias usando la interfaz web")
        print("   3. Escanea los códigos QR generados con tu móvil")
        print("   4. Verifica que las URLs de verificación funcionen correctamente")
    
    else:
        print("\n❌ No se pudieron registrar agencias de ejemplo")
        print("💡 Verifica que el servidor esté ejecutándose correctamente")

if __name__ == "__main__":
    main()