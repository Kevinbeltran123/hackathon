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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">🛡️ Verificación de Agencias</h1>
            <p className="text-gray-600 mt-2">Sistema antifraude para agencias de turismo</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Formulario de Registro */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Registrar Agencia</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Agencia
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Aventuras Colombia Ltda"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NIT
                  </label>
                  <input
                    type="text"
                    name="nit"
                    value={formData.nit}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 900123456-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RNT (Registro Nacional de Turismo)
                  </label>
                  <input
                    type="text"
                    name="rnt"
                    value={formData.rnt}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: RNT-12345"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Registrando...' : 'Registrar Agencia'}
                </button>
              </form>

              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Resultado */}
            <div>
              {result && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex items-center mb-3">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <h3 className="text-lg font-semibold text-green-800">¡Agencia Registrada!</h3>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p><strong>Nombre:</strong> {result.nombre}</p>
                    <p><strong>NIT:</strong> {result.nit}</p>
                    <p><strong>RNT:</strong> {result.rnt}</p>
                    <p><strong>ID:</strong> <span className="font-mono text-xs">{result.id}</span></p>
                  </div>

                  {result.qr_url && (
                    <div className="mt-4 text-center">
                      <h4 className="font-medium mb-2">Código QR de Verificación:</h4>
                      <img 
                        src={result.qr_url} 
                        alt="QR Code" 
                        className="mx-auto border border-gray-200 rounded"
                        style={{ maxWidth: '200px' }}
                      />
                      <p className="text-xs text-gray-600 mt-2">
                        Los usuarios pueden escanear este QR para verificar tu agencia
                      </p>
                      <div className="mt-3">
                        <a 
                          href={result.verification_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm underline"
                        >
                          Ver página de verificación
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!result && (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-6 text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600">Completa el formulario para registrar tu agencia</p>
                </div>
              )}
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-3">¿Cómo funciona?</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">1</span>
                <div>
                  <p className="font-medium">Registro</p>
                  <p className="text-gray-600">Registra tu agencia with datos oficiales</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">2</span>
                <div>
                  <p className="font-medium">Verificación</p>
                  <p className="text-gray-600">Recibe un certificado digital y QR único</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">3</span>
                <div>
                  <p className="font-medium">Confianza</p>
                  <p className="text-gray-600">Los usuarios verifican tu autenticidad</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}