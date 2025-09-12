import { useState, useEffect, useRef } from 'react';
import { geocodeAddress } from '../lib/api.js';

export default function LocationAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Buscar ubicación en Ibagué...",
  className = "",
  onLocationSelect = null,
  showVerificationStatus = true 
}) {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value || '');
    }
  }, [value]);

  const searchLocations = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await geocodeAddress(query);
      setSuggestions(response.results || []);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Location search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      searchLocations(newValue);
    }, 300);

    // Call onChange prop
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const displayName = suggestion.name || suggestion.address;
    setInputValue(displayName);
    setShowSuggestions(false);
    setSuggestions([]);
    
    if (onChange) {
      onChange(displayName);
    }
    
    if (onLocationSelect) {
      onLocationSelect({
        name: suggestion.name,
        address: suggestion.address,
        lat: suggestion.lat,
        lng: suggestion.lng,
        source: suggestion.source,
        confidence: suggestion.confidence,
        verified: suggestion.source === 'google' || suggestion.confidence > 0.8
      });
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleInputBlur = (e) => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const getVerificationIcon = (suggestion) => {
    if (!showVerificationStatus) return null;

    const isHighConfidence = suggestion.confidence > 0.8;
    const isGoogle = suggestion.source === 'google';
    
    if (isGoogle || isHighConfidence) {
      return (
        <span className="text-green-500 text-sm" title="Ubicación verificada">
          ✓
        </span>
      );
    } else if (suggestion.confidence > 0.5) {
      return (
        <span className="text-yellow-500 text-sm" title="Ubicación probable">
          ~
        </span>
      );
    } else {
      return (
        <span className="text-gray-400 text-sm" title="Ubicación no verificada">
          ?
        </span>
      );
    }
  };

  const formatDistance = (suggestion) => {
    // Simple distance estimation from Ibagué center
    const centerLat = 4.4389;
    const centerLng = -75.2043;
    const distance = Math.sqrt(
      Math.pow((suggestion.lat - centerLat) * 111, 2) + 
      Math.pow((suggestion.lng - centerLng) * 111, 2)
    );
    
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m del centro`;
    } else {
      return `${distance.toFixed(1)}km del centro`;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {!isLoading && inputValue && (
          <button
            type="button"
            onClick={() => {
              setInputValue('');
              setSuggestions([]);
              setShowSuggestions(false);
              if (onChange) onChange('');
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-blue-50 ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 truncate">
                      {suggestion.name}
                    </span>
                    {getVerificationIcon(suggestion)}
                  </div>
                  
                  {suggestion.address && suggestion.address !== suggestion.name && (
                    <div className="text-sm text-gray-600 truncate mt-1">
                      {suggestion.address}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">
                      {formatDistance(suggestion)}
                    </span>
                    
                    <span className="text-xs text-gray-400">
                      {suggestion.source}
                    </span>
                    
                    {suggestion.confidence && (
                      <span className="text-xs text-gray-400">
                        {Math.round(suggestion.confidence * 100)}% confianza
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showSuggestions && suggestions.length === 0 && !isLoading && inputValue.length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-gray-500 text-center">
            No se encontraron ubicaciones en Ibagué
          </div>
        </div>
      )}
    </div>
  );
}