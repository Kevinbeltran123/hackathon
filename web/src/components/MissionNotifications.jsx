import { useState, useEffect } from 'react';
import { useMissionNotifications } from '../hooks/useMissions.js';

// Componente principal de notificaciones
export default function MissionNotifications() {
  const { notifications, removeNotification } = useMissionNotifications();

  return (
    <div className="missions-notifications fixed top-4 right-4 space-y-3 max-w-sm">
      {notifications.map(notification => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

// Componente individual de notificación
function NotificationCard({ notification, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animar entrada
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onClose, 300); // Esperar animación de salida
  };

  const getNotificationStyle = () => {
    switch (notification.type) {
      case 'mission_completed':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-green-600',
          icon: '🎉',
          title: '¡Misión Completada!'
        };
      case 'badge_earned':
        return {
          bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
          icon: '🏆',
          title: '¡Badge Desbloqueado!'
        };
      case 'mission_unlocked':
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-purple-500',
          icon: '🔓',
          title: '¡Nueva Misión!'
        };
      case 'progress_update':
        return {
          bg: 'bg-gradient-to-r from-blue-400 to-blue-500',
          icon: '📈',
          title: 'Progreso Actualizado'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
          icon: 'ℹ️',
          title: 'Notificación'
        };
    }
  };

  const style = getNotificationStyle();

  return (
    <div
      className={`transform transition-all duration-300 ease-out ${
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <div className={`${style.bg} text-white rounded-lg shadow-lg p-4 min-w-[300px] max-w-sm`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="text-2xl flex-shrink-0">{style.icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm mb-1">{style.title}</h4>
              <p className="text-sm opacity-90 break-words">
                {notification.message || notification.title}
              </p>
              {notification.points && (
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-xs opacity-75">+{notification.points} puntos</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/70 hover:text-white text-lg leading-none flex-shrink-0 ml-2"
          >
            ×
          </button>
        </div>

        {/* Progress bar para auto-close */}
        <div className="mt-3 bg-white/20 rounded-full h-1">
          <div className="bg-white rounded-full h-1 animate-[shrink_5s_linear]" />
        </div>
      </div>
    </div>
  );
}

// Hook para enviar notificaciones desde otros componentes
export function useMissionNotificationSender() {
  const { addNotification } = useMissionNotifications();

  const sendCompletionNotifications = (completedMissions = [], unlockedMissions = []) => {
    // Notificaciones de misiones completadas
    completedMissions.forEach(mission => {
      addNotification({
        type: 'mission_completed',
        title: mission.title,
        message: `¡Has completado "${mission.title}"!`,
        badge: mission.badge,
        points: mission.points,
        icon: mission.icon,
        color: mission.color
      });

      // Si ganó un badge, notificación adicional
      if (mission.badge) {
        setTimeout(() => {
          addNotification({
            type: 'badge_earned',
            title: mission.badge,
            message: `Nuevo badge desbloqueado: ${mission.badge}`,
            points: mission.points,
            icon: mission.icon
          });
        }, 1500);
      }
    });

    // Notificaciones de misiones desbloqueadas
    setTimeout(() => {
      unlockedMissions.forEach((mission, index) => {
        setTimeout(() => {
          addNotification({
            type: 'mission_unlocked',
            title: mission.title,
            message: `Nueva misión disponible: ${mission.title}`,
            icon: mission.icon
          });
        }, index * 800);
      });
    }, completedMissions.length * 2000);
  };

  const sendProgressNotification = (missionTitle, progress, target) => {
    addNotification({
      type: 'progress_update',
      message: `${missionTitle}: ${progress}/${target}`,
      icon: '📈'
    });
  };

  return {
    sendCompletionNotifications,
    sendProgressNotification
  };
}

// CSS personalizado para la animación
const styles = `
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`;

// Inyectar estilos
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}