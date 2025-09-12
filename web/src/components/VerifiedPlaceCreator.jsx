import { useState } from 'react';
import LocationAutocomplete from './LocationAutocomplete.jsx';
import { createVerifiedPlace, validateLocation } from '../lib/api.js';

export default function VerifiedPlaceCreator({ onPlaceCreated, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    lat: null,
    lng: null,
    address: '',
    barrio: '',
    tags: '',
    base_duration: 30,
    price_level: 1,
    rating: 4.3
  });
  
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!formData.lat || !formData.lng) {
      newErrors.location = 'Debe seleccionar una ubicación válida';
    }
    
    if (!formData.tags.trim()) {
      newErrors.tags = 'Las etiquetas son requeridas';
    }

    if (formData.base_duration < 5 || formData.base_duration > 300) {
      newErrors.base_duration = 'La duración debe estar entre 5 y 300 minutos';
    }

    if (formData.price_level < 1 || formData.price_level > 4) {
      newErrors.price_level = 'El nivel de precios debe estar entre 1 y 4';
    }

    if (formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'La calificación debe estar entre 1 y 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLocationSelect = async (location) => {
    setSelectedLocation(location);
    setFormData(prev => ({
      ...prev,
      name: location.name || prev.name,
      lat: location.lat,
      lng: location.lng,
      address: location.address
    }));

    // Validate the selected location
    setIsValidating(true);
    try {
      const validation = await validateLocation(location.name, location.lat, location.lng);
      setValidationResult(validation);
    } catch (error) {
      console.error('Location validation error:', error);
      setValidationResult({ 
        valid: false, 
        reason: 'Error al validar la ubicación',
        error: error.message 
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!validationResult?.valid) {
      setErrors({ location: 'La ubicación debe ser validada antes de crear el lugar' });
      return;
    }

    setIsCreating(true);
    try {
      const result = await createVerifiedPlace(formData);
      
      if (result.error) {
        setErrors({ submit: result.error });
      } else {
        if (onPlaceCreated) {
          onPlaceCreated({
            ...formData,
            id: result.id,
            verified: result.verified,
            verification_source: result.verification_source
          });
        }
        
        // Reset form
        setFormData({
          name: '',
          lat: null,
          lng: null,
          address: '',
          barrio: '',
          tags: '',
          base_duration: 30,
          price_level: 1,
          rating: 4.3
        });
        setSelectedLocation(null);
        setValidationResult(null);
        
        if (onClose) {
          onClose();
        }
      }
    } catch (error) {
      console.error('Place creation error:', error);
      setErrors({ submit: 'Error al crear el lugar. Inténtelo de nuevo.' });
    } finally {
      setIsCreating(false);
    }
  };

  const getValidationStatusDisplay = () => {
    if (isValidating) {
      return (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="text-blue-700">Validando ubicación...</span>
        </div>
      );
    }

    if (!validationResult) return null;

    if (validationResult.valid) {
      return (
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-green-500 text-lg">✓</span>
            <span className="text-green-800 font-medium">Ubicación verificada</span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            Fuente: {validationResult.verificationSource}
          </p>
          {validationResult.address && (
            <p className="text-green-600 text-sm">
              Dirección: {validationResult.address}
            </p>
          )}
        </div>
      );
    } else {
      return (
        <div className="p-3 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-red-500 text-lg">✗</span>
            <span className="text-red-800 font-medium">Ubicación no válida</span>
          </div>
          <p className="text-red-700 text-sm mt-1">
            {validationResult.reason}
          </p>
          {validationResult.suggestions && validationResult.suggestions.length > 0 && (
            <div className="mt-2">
              <p className="text-red-600 text-sm font-medium">Sugerencias:</p>
              <ul className="text-red-600 text-sm list-disc list-inside">
                {validationResult.suggestions.slice(0, 3).map((suggestion, index) => (
                  <li key={index}>{suggestion.name || suggestion.address}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }
  };

  const tagSuggestions = [
    'restaurant', 'cafe', 'museo', 'parque', 'iglesia', 'cultura', 'historia',
    'arte', 'comida', 'shopping', 'hotel', 'turismo', 'naturaleza', 'deportes'
  ];

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Crear Lugar Verificado
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar Ubicación *
          </label>
          <LocationAutocomplete
            value=""
            placeholder="Buscar lugar en Ibagué (ej: Conservatorio del Tolima, Plaza de Bolívar...)"
            onLocationSelect={handleLocationSelect}
            showVerificationStatus={true}
            className="w-full"
          />
          {errors.location && (
            <p className="text-red-600 text-sm mt-1">{errors.location}</p>
          )}
        </div>

        {/* Validation Status */}
        {getValidationStatusDisplay()}

        {/* Selected Location Info */}
        {selectedLocation && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">Ubicación Seleccionada:</h4>
            <p className="text-gray-700">{selectedLocation.name}</p>
            <p className="text-gray-600 text-sm">{selectedLocation.address}</p>
            <p className="text-gray-500 text-xs">
              Coordenadas: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
            </p>
          </div>
        )}

        {/* Place Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Lugar *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: Conservatorio del Tolima"
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Barrio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Barrio
          </label>
          <input
            type="text"
            value={formData.barrio}
            onChange={(e) => handleInputChange('barrio', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: Centro Musical, Centro"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Etiquetas * (separadas por comas)
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => handleInputChange('tags', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: cultura, musica, arte"
          />
          <div className="mt-2 flex flex-wrap gap-1">
            {tagSuggestions.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  const currentTags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
                  if (!currentTags.includes(tag)) {
                    const newTags = [...currentTags, tag].join(', ');
                    handleInputChange('tags', newTags);
                  }
                }}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md text-gray-600"
              >
                +{tag}
              </button>
            ))}
          </div>
          {errors.tags && (
            <p className="text-red-600 text-sm mt-1">{errors.tags}</p>
          )}
        </div>

        {/* Duration, Price Level, Rating */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duración Base (min) *
            </label>
            <input
              type="number"
              min="5"
              max="300"
              value={formData.base_duration}
              onChange={(e) => handleInputChange('base_duration', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.base_duration && (
              <p className="text-red-600 text-sm mt-1">{errors.base_duration}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nivel de Precios *
            </label>
            <select
              value={formData.price_level}
              onChange={(e) => handleInputChange('price_level', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={1}>$ - Económico</option>
              <option value={2}>$$ - Moderado</option>
              <option value={3}>$$$ - Caro</option>
              <option value={4}>$$$$ - Muy Caro</option>
            </select>
            {errors.price_level && (
              <p className="text-red-600 text-sm mt-1">{errors.price_level}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calificación *
            </label>
            <input
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={(e) => handleInputChange('rating', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.rating && (
              <p className="text-red-600 text-sm mt-1">{errors.rating}</p>
            )}
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-red-700">{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isCreating || !validationResult?.valid}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCreating && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isCreating ? 'Creando...' : 'Crear Lugar Verificado'}
          </button>
          
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}