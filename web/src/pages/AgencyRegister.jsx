import React, { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function AgencyRegister() {
  const [formData, setFormData] = useState({
    nombre: '',
    nit: '',
    rnt: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post(`${API_URL}/api/agencies/register`, formData);
      setResult(response.data);
      setFormData({ nombre: '', nit: '', rnt: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar la agencia');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-ocobo-light/5 via-white to-brand-forest-green/5 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-glow-ocobo p-8 border border-brand-ocobo-pink/20">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-brand-ocobo-pink to-brand-forest-green rounded-full flex items-center justify-center shadow-glow-ocobo">
                <span className="text-3xl">🌸</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-brand-ocobo-dark mb-3">
              🛡️ Verificación de Agencias
            </h1>
            <p className="text-lg text-brand-ocobo-dark/70 mb-2">Sistema antifraude para agencias de turismo</p>
            <p className="text-sm text-brand-forest-green font-medium">🌿 Protegiendo el turismo de Ibagué</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Formulario de Registro */}
            <div className="bg-gradient-to-br from-brand-ocobo-light/10 to-brand-forest-green/10 rounded-2xl p-6 border border-brand-ocobo-pink/20">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-brand-ocobo-pink to-brand-forest-green rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl">🏢</span>
                </div>
                <h2 className="text-2xl font-bold text-brand-ocobo-dark">Registrar Agencia</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-brand-ocobo-dark mb-2">
                    🏛️ Nombre de la Agencia
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-brand-ocobo-pink/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-ocobo-pink/50 focus:border-brand-ocobo-pink transition-all duration-200 bg-white/80"
                    placeholder="Ej: Aventuras Colombia Ltda"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-brand-ocobo-dark mb-2">
                    📋 NIT
                  </label>
                  <input
                    type="text"
                    name="nit"
                    value={formData.nit}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-brand-ocobo-pink/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-ocobo-pink/50 focus:border-brand-ocobo-pink transition-all duration-200 bg-white/80"
                    placeholder="Ej: 900123456-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-brand-ocobo-dark mb-2">
                    🎯 RNT (Registro Nacional de Turismo)
                  </label>
                  <input
                    type="text"
                    name="rnt"
                    value={formData.rnt}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-brand-ocobo-pink/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-ocobo-pink/50 focus:border-brand-ocobo-pink transition-all duration-200 bg-white/80"
                    placeholder="Ej: RNT-12345"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-ocobo text-lg py-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '🔄 Registrando...' : '🌟 Registrar Agencia'}
                </button>
              </form>

              {error && (
                <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl">
                  <div className="flex items-center">
                    <span className="text-red-500 text-xl mr-3">⚠️</span>
                    <p className="text-red-700 font-semibold">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Resultado */}
            <div>
              {result && (
                <div className="bg-gradient-to-br from-brand-forest-green/10 to-brand-ocobo-light/10 border-2 border-brand-forest-green/30 rounded-2xl p-6 shadow-glow-forest">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-brand-forest-green to-brand-hills-green rounded-full flex items-center justify-center mr-4">
                      <span className="text-2xl">✅</span>
                    </div>
                    <h3 className="text-2xl font-bold text-brand-forest-green">¡Agencia Registrada!</h3>
                  </div>
                  
                  <div className="space-y-4 text-sm bg-white/60 rounded-xl p-4 border border-brand-forest-green/20">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-brand-ocobo-dark">🏛️ Nombre:</span>
                      <span className="text-brand-forest-green font-medium">{result.nombre}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-brand-ocobo-dark">📋 NIT:</span>
                      <span className="text-brand-forest-green font-medium">{result.nit}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-brand-ocobo-dark">🎯 RNT:</span>
                      <span className="text-brand-forest-green font-medium">{result.rnt}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-brand-ocobo-dark">🆔 ID:</span>
                      <span className="font-mono text-xs text-brand-ocobo-dark bg-brand-ocobo-light/20 px-2 py-1 rounded">{result.id}</span>
                    </div>
                  </div>

                  {result.qr_url && (
                    <div className="mt-6 text-center bg-white/60 rounded-xl p-4 border border-brand-forest-green/20">
                      <h4 className="font-semibold text-brand-ocobo-dark mb-3">📱 Código QR de Verificación:</h4>
                      <img 
                        src={result.qr_url} 
                        alt="QR Code" 
                        className="mx-auto border-2 border-brand-forest-green/30 rounded-xl shadow-soft"
                        style={{ maxWidth: '200px' }}
                      />
                      <p className="text-sm text-brand-ocobo-dark/70 mt-3">
                        Los usuarios pueden escanear este QR para verificar tu agencia
                      </p>
                      <div className="mt-4">
                        <a 
                          href={result.verification_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-forest text-sm py-2 px-4 inline-flex items-center"
                        >
                          <span className="mr-2">🔗</span>
                          Ver página de verificación
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!result && (
                <div className="bg-gradient-to-br from-brand-ocobo-light/10 to-brand-forest-green/10 border-2 border-brand-ocobo-pink/20 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-brand-ocobo-pink to-brand-forest-green rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📄</span>
                  </div>
                  <p className="text-brand-ocobo-dark font-medium">Completa el formulario para registrar tu agencia</p>
                  <p className="text-sm text-brand-ocobo-dark/60 mt-2">🌿 Únete a la red de turismo confiable de Ibagué</p>
                </div>
              )}
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-8 pt-8 border-t border-brand-ocobo-pink/20">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-brand-ocobo-dark mb-2">¿Cómo funciona?</h3>
              <p className="text-brand-ocobo-dark/70">Proceso simple y seguro para agencias de turismo</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-brand-ocobo-light/10 to-brand-forest-green/10 rounded-2xl p-6 border border-brand-ocobo-pink/20 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-brand-ocobo-pink to-brand-ocobo-light rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow-ocobo">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h4 className="text-lg font-bold text-brand-ocobo-dark mb-3">📝 Registro</h4>
                <p className="text-brand-ocobo-dark/70 text-sm">Registra tu agencia con datos oficiales y verifica tu identidad tributaria</p>
              </div>
              
              <div className="bg-gradient-to-br from-brand-forest-green/10 to-brand-hills-green/10 rounded-2xl p-6 border border-brand-forest-green/20 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-brand-forest-green to-brand-hills-green rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow-forest">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h4 className="text-lg font-bold text-brand-forest-green mb-3">🔐 Verificación</h4>
                <p className="text-brand-ocobo-dark/70 text-sm">Recibe un certificado digital y QR único para tu agencia</p>
              </div>
              
              <div className="bg-gradient-to-br from-brand-amber-gold/10 to-brand-sunset-orange/10 rounded-2xl p-6 border border-brand-amber-gold/20 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-brand-amber-gold to-brand-sunset-orange rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow-gold">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h4 className="text-lg font-bold text-brand-amber-gold mb-3">🤝 Confianza</h4>
                <p className="text-brand-ocobo-dark/70 text-sm">Los usuarios verifican tu autenticidad y confían en tu agencia</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}