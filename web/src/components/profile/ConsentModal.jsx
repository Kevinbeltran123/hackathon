import React from 'react';

const ConsentModal = ({ isOpen, onClose, onAccept, onDecline }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-forest to-forest2 rounded-full flex items-center justify-center mr-4">
            <span className="text-white text-xl">🔒</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral">Consentimiento de Datos</h3>
            <p className="text-sm text-gray-600">Términos y condiciones</p>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 max-h-48 overflow-y-auto">
            <h4 className="font-semibold mb-2">Uso de Datos de Ubicación</h4>
            <p className="mb-3">
              Al hacer check-in, autorizas el uso de tu ubicación para:
            </p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li>Verificar que estás en el lugar correcto</li>
              <li>Calcular distancias y tiempos de viaje</li>
              <li>Mejorar las recomendaciones de rutas</li>
              <li>Generar estadísticas anónimas de turismo</li>
            </ul>
            
            <h4 className="font-semibold mb-2">Términos de Uso</h4>
            <p className="mb-3">
              Al continuar, aceptas nuestros términos de servicio y política de privacidad.
            </p>
            
            <div className="text-xs text-gray-500">
              <p>• Tus datos se almacenan de forma segura</p>
              <p>• Puedes revocar el consentimiento en cualquier momento</p>
              <p>• No compartimos tu ubicación con terceros</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onDecline}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500/50"
          >
            Cancelar
          </button>
          <button
            onClick={onAccept}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-forest to-forest2 text-white rounded-lg hover:shadow-glow-forest transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-forest/50"
          >
            Aceptar y Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentModal;
