import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function AgencyVerify() {
  const { id } = useParams();
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchAgency(id);
    }
  }, [id]);

  const fetchAgency = async (agencyId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/agencies/verify/${agencyId}`);
      setAgency(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Agencia no encontrada');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando agencia...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="bg-red-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-800 mb-2">❌ Agencia No Verificada</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-700 font-semibold">⚠️ POSIBLE FRAUDE</p>
              <p className="text-red-600 text-sm">Esta agencia no está registrada en nuestro sistema de verificación</p>
            </div>
            {id && (
              <div className="mt-4 p-3 bg-gray-100 rounded-md">
                <p className="text-sm text-gray-600">ID buscado:</p>
                <p className="font-mono text-xs text-gray-800">{id}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-green-50 border-b border-green-200 p-6 text-center">
            <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-green-800">✅ Agencia Verificada</h1>
            <p className="text-green-700 mt-2">Esta agencia está oficialmente registrada y verificada</p>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900">{agency.nombre}</h2>
                <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium mt-2">
                  {agency.estado?.toUpperCase() || 'VERIFICADA'}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">NIT</span>
                    <p className="text-lg font-semibold">{agency.nit}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">RNT</span>
                    <p className="text-lg font-semibold">{agency.rnt}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Fecha de Registro</span>
                    <p className="text-sm text-gray-700">
                      {agency.fecha_registro ? formatDate(agency.fecha_registro) : 'No disponible'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">ID de Verificación</span>
                    <p className="font-mono text-xs text-gray-600 break-all">{agency.id}</p>
                  </div>
                </div>
              </div>

              {agency.certificado && (
                <div className="border-t pt-4">
                  <span className="text-sm font-medium text-gray-500">Certificado Digital</span>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="font-mono text-xs text-gray-600 break-all">{agency.certificado}</p>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-green-800">✓ Puedes confiar en esta agencia</h3>
                      <p className="text-green-700 text-sm mt-1">
                        Esta verificación confirma que la agencia está registrada en nuestro sistema antifraude 
                        y cumple con los requisitos de identificación tributaria y turística.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Verificación segura
              </div>
              <div className="text-sm text-gray-500">
                Sistema Rutas VIVAS Tolima
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a 
            href="/agencies" 
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Verificar otra agencia
          </a>
        </div>
      </div>
    </div>
  );
}