import { useState } from 'react';
import useMissions from '../hooks/useMissions.js';
import '../styles/missions.css';

// Componente principal del panel de misiones
export default function MissionsPanel({ userId, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('missions');
  const { missions, badges, stats, loading, error, activeMissions } = useMissions(userId);

  if (!isOpen) return null;

  return (
    <div className="missions-modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="missions-modal bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">🎯 Centro de Misiones</h2>
              <p className="text-blue-100">Tu progreso en Ibagué, Capital Musical</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Stats Summary */}
          {stats && (
            <div className="flex gap-6 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.total_points || 0}</div>
                <div className="text-sm text-blue-100">Puntos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.total_badges || 0}</div>
                <div className="text-sm text-blue-100">Badges</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.unique_places_visited || 0}</div>
                <div className="text-sm text-blue-100">Lugares</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.missions_completed || 0}</div>
                <div className="text-sm text-blue-100">Completadas</div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('missions')}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              activeTab === 'missions'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Misiones Activas ({activeMissions.length})
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              activeTab === 'badges'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Mis Badges ({badges.length})
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              activeTab === 'progress'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Mi Progreso
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando misiones...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'missions' && <MissionsTab missions={activeMissions} />}
              {activeTab === 'badges' && <BadgesTab badges={badges} />}
              {activeTab === 'progress' && <ProgressTab stats={stats} missions={missions} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Tab de misiones activas
function MissionsTab({ missions }) {
  const groupedMissions = missions.reduce((acc, mission) => {
    const category = mission.category || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(mission);
    return acc;
  }, {});

  const categoryNames = {
    'onboarding': '🚀 Primeros Pasos',
    'exploration': '🗺️ Exploración',
    'cultural': '🏛️ Cultura',
    'food': '🍽️ Gastronomía',
    'nature': '🌿 Naturaleza',
    'social': '📱 Social',
    'special': '⭐ Especiales',
    'challenge': '⚡ Desafíos'
  };

  if (missions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">¡Todas las misiones completadas!</h3>
        <p className="text-gray-600">Explora más lugares para desbloquear nuevas misiones.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedMissions).map(([category, categoryMissions]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            {categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1)}
          </h3>
          <div className="space-y-3">
            {categoryMissions.map(mission => (
              <MissionCard key={mission.user_mission_id} mission={mission} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Componente individual de misión
function MissionCard({ mission }) {
  const progress = Math.min(mission.progress, mission.target_progress);
  const percentage = (progress / mission.target_progress) * 100;
  
  const difficultyColors = {
    'easy': 'bg-green-100 text-green-800 border-green-200',
    'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'hard': 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{mission.badge_icon}</span>
            <div>
              <h4 className="font-semibold text-gray-800">{mission.title}</h4>
              <p className="text-sm text-gray-600">{mission.description}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${difficultyColors[mission.difficulty] || difficultyColors.easy}`}>
            {mission.difficulty === 'easy' ? 'Fácil' : mission.difficulty === 'medium' ? 'Medio' : 'Difícil'}
          </span>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-800">{mission.points} pts</div>
            {mission.estimated_time && (
              <div className="text-xs text-gray-500">{mission.estimated_time}</div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progreso</span>
          <span>{progress}/{mission.target_progress}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${percentage}%`,
              backgroundColor: mission.badge_color || '#3B82F6'
            }}
          />
        </div>
      </div>

      {percentage === 100 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
          <span className="text-green-800 font-medium text-sm">🎉 ¡Misión completada! Badge desbloqueado</span>
        </div>
      )}
    </div>
  );
}

// Tab de badges
function BadgesTab({ badges }) {
  if (badges.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏆</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Sin badges aún</h3>
        <p className="text-gray-600">Completa misiones para obtener tus primeros badges.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {badges.map(badge => (
        <div
          key={badge.id}
          className="border border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow"
        >
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl"
            style={{ backgroundColor: `${badge.badge_color}20`, color: badge.badge_color }}
          >
            {badge.badge_icon}
          </div>
          <h4 className="font-semibold text-gray-800 mb-1">{badge.badge_name}</h4>
          <p className="text-sm text-gray-600 mb-2">{badge.badge_description}</p>
          <div className="text-xs text-gray-500">
            {badge.points_earned} pts • {new Date(badge.earned_at).toLocaleDateString('es-CO')}
          </div>
        </div>
      ))}
    </div>
  );
}

// Tab de progreso
function ProgressTab({ stats, missions }) {
  if (!stats) {
    return <div className="text-center py-12">Cargando estadísticas...</div>;
  }

  const completedMissions = missions.filter(m => m.status === 'completed');
  const activeMissions = missions.filter(m => m.status === 'active');

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.total_points}</div>
          <div className="text-sm text-blue-800">Puntos Totales</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-purple-600">{stats.total_badges}</div>
          <div className="text-sm text-purple-800">Badges Obtenidos</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{stats.unique_places_visited}</div>
          <div className="text-sm text-green-800">Lugares Visitados</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-orange-600">{stats.total_checkins}</div>
          <div className="text-sm text-orange-800">Check-ins Totales</div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Resumen de Actividad</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Misiones completadas:</span>
            <span className="font-medium">{completedMissions.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Misiones activas:</span>
            <span className="font-medium">{activeMissions.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Última actividad:</span>
            <span className="font-medium">
              {stats.last_activity 
                ? new Date(stats.last_activity).toLocaleDateString('es-CO')
                : 'Nunca'
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Racha actual:</span>
            <span className="font-medium">{stats.current_streak || 0} días</span>
          </div>
        </div>
      </div>
    </div>
  );
}