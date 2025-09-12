import React, { useEffect } from 'react';

const Toast = ({ 
  isVisible, 
  onClose, 
  type = 'success', 
  title, 
  message, 
  duration = 5000 
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-forest to-forest2',
          icon: '✅',
          text: 'text-white'
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-red-600',
          icon: '❌',
          text: 'text-white'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-gold to-ocobo',
          icon: '⚠️',
          text: 'text-white'
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-ocobo to-gold',
          icon: 'ℹ️',
          text: 'text-white'
        };
      default:
        return {
          bg: 'bg-gray-800',
          icon: 'ℹ️',
          text: 'text-white'
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${styles.bg} ${styles.text} rounded-xl shadow-2xl p-4 max-w-sm`}>
        <div className="flex items-start space-x-3">
          <div className="text-2xl flex-shrink-0">{styles.icon}</div>
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="font-semibold text-sm mb-1">{title}</h4>
            )}
            <p className="text-sm opacity-90">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
            aria-label="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
