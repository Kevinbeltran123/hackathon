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
      <div className="min-h-screen bg-gradient-to-br from-brand-ocobo-light/5 via-white to-brand-forest-green/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-brand-ocobo-pink to-brand-forest-green rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-ocobo">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
          <p className="text-brand-ocobo-dark font-semibold text-lg">Verificando agencia...</p>
          <p className="text-brand-ocobo-dark/60 text-sm mt-2">🌿 Validando datos de turismo</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50/50 via-white to-orange-50/50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-glow-ocobo p-8 text-center border border-red-200">
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-ocobo">
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-3xl font-bold text-red-800 mb-3">❌ Agencia No Verificada</h1>
            <p className="text-red-600 mb-6 text-lg">{error}</p>
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6">
              <div className="flex items-center justify-center mb-3">
                <span className="text-red-500 text-2xl mr-3">🚨</span>
                <p className="text-red-700 font-bold text-lg">POSIBLE FRAUDE</p>
              </div>
              <p className="text-red-600 text-sm">Esta agencia no está registrada en nuestro sistema de verificación</p>
            </div>
            {id && (
              <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-600 font-semibold mb-2">ID buscado:</p>
                <p className="font-mono text-xs text-gray-800 bg-white px-3 py-2 rounded-lg border">{id}</p>
              </div>
            )}
            <div className="mt-6">
              <a 
                href="/agencies" 
                className="btn-ocobo text-sm py-3 px-6 inline-flex items-center"
              >
                <span className="mr-2">🔍</span>
                Verificar otra agencia
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-forest-green/5 via-white to-brand-ocobo-light/5 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-glow-forest overflow-hidden border border-brand-forest-green/20">
          <div className="bg-gradient-to-r from-brand-forest-green/10 to-brand-hills-green/10 border-b border-brand-forest-green/20 p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-brand-forest-green to-brand-hills-green rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-forest">
              <span className="text-3xl">✅</span>
            </div>
            <h1 className="text-4xl font-bold text-brand-forest-green mb-3">Agencia Verificada</h1>
            <p className="text-brand-forest-green text-lg font-medium">Esta agencia está oficialmente registrada y verificada</p>
            <p className="text-brand-ocobo-dark/60 text-sm mt-2">🌿 Confiable para el turismo de Ibagué</p>
          </div>

          <div className="p-8">
            <div className="space-y-6">
              <div className="border-b border-brand-forest-green/20 pb-6">
                <h2 className="text-3xl font-bold text-brand-ocobo-dark mb-4">{agency.nombre}</h2>
                <span className="inline-block bg-gradient-to-r from-brand-forest-green to-brand-hills-green text-white px-4 py-2 rounded-full text-sm font-bold shadow-soft">
                  {agency.estado?.toUpperCase() || 'VERIFICADA'}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-brand-ocobo-light/10 to-brand-forest-green/10 rounded-xl p-4 border border-brand-ocobo-pink/20">
                    <span className="text-sm font-semibold text-brand-ocobo-dark">📋 NIT</span>
                    <p className="text-lg font-bold text-brand-forest-green mt-1">{agency.nit}</p>
                  </div>
                  <div className="bg-gradient-to-r from-brand-forest-green/10 to-brand-hills-green/10 rounded-xl p-4 border border-brand-forest-green/20">
                    <span className="text-sm font-semibold text-brand-ocobo-dark">🎯 RNT</span>
                    <p className="text-lg font-bold text-brand-forest-green mt-1">{agency.rnt}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-brand-amber-gold/10 to-brand-sunset-orange/10 rounded-xl p-4 border border-brand-amber-gold/20">
                    <span className="text-sm font-semibold text-brand-ocobo-dark">📅 Fecha de Registro</span>
                    <p className="text-sm text-brand-ocobo-dark font-medium mt-1">
                      {agency.fecha_registro ? formatDate(agency.fecha_registro) : 'No disponible'}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-brand-ocobo-pink/10 to-brand-ocobo-light/10 rounded-xl p-4 border border-brand-ocobo-pink/20">
                    <span className="text-sm font-semibold text-brand-ocobo-dark">🆔 ID de Verificación</span>
                    <p className="font-mono text-xs text-brand-ocobo-dark break-all mt-1 bg-white/60 px-2 py-1 rounded">{agency.id}</p>
                  </div>
                </div>
              </div>

              {agency.certificado && (
                <div className="border-t border-brand-forest-green/20 pt-6">
                  <span className="text-sm font-semibold text-brand-ocobo-dark">🔐 Certificado Digital</span>
                  <div className="mt-3 p-4 bg-gradient-to-r from-brand-forest-green/5 to-brand-hills-green/5 rounded-xl border border-brand-forest-green/20">
                    <p className="font-mono text-xs text-brand-ocobo-dark break-all bg-white/60 px-3 py-2 rounded">{agency.certificado}</p>
                  </div>
                </div>
              )}

              <div className="border-t border-brand-forest-green/20 pt-6">
                <div className="bg-gradient-to-r from-brand-forest-green/10 to-brand-hills-green/10 border-2 border-brand-forest-green/30 rounded-2xl p-6">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-gradient-to-r from-brand-forest-green to-brand-hills-green rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-white text-lg">✓</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-forest-green text-lg mb-2">Puedes confiar en esta agencia</h3>
                      <p className="text-brand-ocobo-dark/80 text-sm">
                        Esta verificación confirma que la agencia está registrada en nuestro sistema antifraude 
                        y cumple con los requisitos de identificación tributaria y turística.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-brand-forest-green/5 to-brand-hills-green/5 px-8 py-6 border-t border-brand-forest-green/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-brand-ocobo-dark/70">
                <div className="w-6 h-6 bg-gradient-to-r from-brand-forest-green to-brand-hills-green rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-xs">🔒</span>
                </div>
                <span className="font-semibold">Verificación segura</span>
              </div>
              <div className="text-sm text-brand-ocobo-dark/70 font-medium">
                Sistema Rutas VIVAS Tolima
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/agencies" 
            className="btn-forest text-sm py-3 px-6 inline-flex items-center"
          >
            <span className="mr-2">🔍</span>
            Verificar otra agencia
          </a>
        </div>
      </div>
    </div>
  );
}