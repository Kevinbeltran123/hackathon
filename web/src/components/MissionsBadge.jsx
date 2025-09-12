import { useState, useEffect } from 'react';
import { getMissionsSummary } from '../lib/api.js';

// Componente del badge de misiones para el header
export default function MissionsBadge({ userId, onClick }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadSummary();
      // Actualizar cada 30 segundos
      const interval = setInterval(loadSummary, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  const loadSummary = async () => {
    try {
      const result = await getMissionsSummary(userId);
      if (result.success) {
        setSummary({
          active: result.active || 0,
          completed: result.completed || 0,
          points: result.points || 0,
          badges: result.badges || 0
        });
      }
    } catch (error) {
      console.error('Error loading missions summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <button 
        onClick={onClick}
        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 animate-pulse"
      >
        <span className="text-sm">Cargando...</span>
      </button>
    );
  }

  if (!summary) {
    return (
      <button 
        onClick={onClick}
        className="flex items-center gap-2 px-3 py-2 bg-gray-400 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
      >
        <span className="text-lg">🎯</span>
        <span className="text-sm font-medium">Misiones</span>
      </button>
    );
  }

  const { active, points, badges } = summary;
  const hasActiveMissions = active > 0;
  const hasProgress = points > 0 || badges > 0;

  return (
    <button 
      onClick={onClick}
      className={`missions-badge flex items-center gap-2 px-3 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 ${
        hasActiveMissions 
          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white animate-pulse' 
          : hasProgress
          ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
          : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
      }`}
      title={`${active} misiones activas • ${points} puntos • ${badges} badges`}
    >
      <span className="text-lg">
        {hasActiveMissions ? '🎯' : hasProgress ? '🏆' : '⭐'}
      </span>
      
      <div className="flex items-center gap-1 text-sm font-medium">
        <span className="hidden sm:inline">Misiones:</span>
        <span>{active}</span>
        {hasProgress && (
          <>
            <span className="text-xs opacity-75">•</span>
            <span className="text-xs">{points}pts</span>
          </>
        )}
      </div>

      {hasActiveMissions && (
        <div className="w-2 h-2 bg-yellow-300 rounded-full animate-ping" />
      )}
    </button>
  );
}

// Componente compacto para móvil
export function CompactMissionsBadge({ userId, onClick }) {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (userId) {
      loadSummary();
    }
  }, [userId]);

  const loadSummary = async () => {
    try {
      const result = await getMissionsSummary(userId);
      if (result.success) {
        setSummary({
          active: result.active || 0,
          points: result.points || 0
        });
      }
    } catch (error) {
      console.error('Error loading missions summary:', error);
    }
  };

  const active = summary?.active || 0;
  const points = summary?.points || 0;

  return (
    <button 
      onClick={onClick}
      className={`relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 ${
        active > 0 
          ? 'bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse' 
          : 'bg-gradient-to-br from-gray-400 to-gray-500'
      }`}
    >
      <span className="text-xl text-white">🎯</span>
      
      {active > 0 && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {active > 9 ? '9+' : active}
        </div>
      )}
      
      {points > 0 && (
        <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-white text-xs font-bold rounded-full px-1 min-w-[20px] h-5 flex items-center justify-center">
          {points > 999 ? '999+' : points}
        </div>
      )}
    </button>
  );
}