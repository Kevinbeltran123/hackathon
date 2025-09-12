import React, { useState, useRef } from 'react';

const PhotoNote = ({ onNoteChange, onPhotoChange, initialNote = '', initialPhoto = null }) => {
  const [note, setNote] = useState(initialNote);
  const [photo, setPhoto] = useState(initialPhoto);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleNoteChange = (value) => {
    setNote(value);
    onNoteChange && onNoteChange(value);
  };

  const handlePhotoChange = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoData = e.target.result;
        setPhoto(photoData);
        onPhotoChange && onPhotoChange(photoData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      handlePhotoChange(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handlePhotoChange(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removePhoto = () => {
    setPhoto(null);
    onPhotoChange && onPhotoChange(null);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
      <h3 className="text-lg font-semibold text-neutral mb-4">Agrega una nota y foto</h3>
      
      {/* Note Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nota personal (opcional)
        </label>
        <textarea
          value={note}
          onChange={(e) => handleNoteChange(e.target.value)}
          placeholder="Comparte tu experiencia en este lugar..."
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocobo/50 focus:border-ocobo resize-none"
          rows={3}
          maxLength={200}
        />
        <div className="text-right text-xs text-gray-500 mt-1">
          {note.length}/200 caracteres
        </div>
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Foto del lugar (opcional)
        </label>
        
        {photo ? (
          <div className="relative">
            <img
              src={photo}
              alt="Foto del lugar"
              className="w-full h-48 object-cover rounded-lg border border-gray-200"
            />
            <button
              onClick={removePhoto}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
              aria-label="Eliminar foto"
            >
              ✕
            </button>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? 'border-ocobo bg-ocobo/5'
                : 'border-gray-300 hover:border-ocobo/50'
            }`}
          >
            <div className="text-4xl mb-2">📸</div>
            <p className="text-gray-600 mb-2">Arrastra una foto aquí o</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-ocobo font-medium hover:text-ocobo/80 transition-colors"
            >
              selecciona un archivo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoNote;
