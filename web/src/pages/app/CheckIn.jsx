// User check-in page with stepper
import React, { useState } from 'react'
import CheckInStepper from '../../components/profile/CheckInStepper'
import PlacePicker from '../../components/profile/PlacePicker'
import PhotoNote from '../../components/profile/PhotoNote'
import ConsentModal from '../../components/profile/ConsentModal'
import Toast from '../../components/profile/Toast'

const CheckIn = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [checkInNote, setCheckInNote] = useState('')
  const [checkInPhoto, setCheckInPhoto] = useState(null)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [toast, setToast] = useState({
    isVisible: false,
    type: 'success',
    title: '',
    message: '',
  })

  const steps = [
    { id: 1, title: 'Elegir Lugar', subtitle: 'Selecciona dónde estás' },
    { id: 2, title: 'Validar', subtitle: 'Confirma ubicación' },
    { id: 3, title: 'Nota', subtitle: 'Agrega detalles' },
    { id: 4, title: 'Confirmar', subtitle: 'Finalizar check-in' },
  ]

  const places = [
    {
      id: 1,
      name: 'Conservatorio del Tolima',
      barrio: 'Centro',
      tags: ['cultura', 'música'],
      distance: 250,
      verified: true,
    },
    {
      id: 2,
      name: 'Jardín Botánico San Jorge',
      barrio: 'Belén',
      tags: ['naturaleza', 'jardín'],
      distance: 1200,
      verified: true,
    },
    {
      id: 3,
      name: 'Restaurante La Pola',
      barrio: 'La Pola',
      tags: ['gastro', 'restaurante'],
      distance: 800,
      verified: true,
    },
  ]

  const handlePlaceSelect = (place) => {
    setSelectedPlace(place)
    setCurrentStep(2)
  }

  const handleValidation = () => {
    if (selectedPlace) {
      setCurrentStep(3)
    }
  }

  const handleNoteChange = (note) => {
    setCheckInNote(note)
  }

  const handlePhotoChange = (photo) => {
    setCheckInPhoto(photo)
  }

  const handleConsent = () => {
    setShowConsentModal(true)
  }

  const handleConsentAccept = () => {
    setShowConsentModal(false)
    setCurrentStep(4)
  }

  const handleConsentDecline = () => {
    setShowConsentModal(false)
  }

  const handleConfirmCheckIn = () => {
    // Simulate check-in
    setToast({
      isVisible: true,
      type: 'success',
      title: '¡Check-in exitoso!',
      message: 'Has ganado 50 puntos por tu visita'
    })

    // Reset form
    setTimeout(() => {
      setCurrentStep(1)
      setSelectedPlace(null)
      setCheckInNote('')
      setCheckInPhoto(null)
    }, 2000)
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-forest mb-2">Check-in</h1>
        <p className="text-gray-600">
          Comparte tu experiencia y gana puntos por explorar Ibagué
        </p>
      </div>

      {/* Stepper */}
      <CheckInStepper 
        currentStep={currentStep}
        steps={steps}
        onStepClick={setCurrentStep}
      />

      {/* Step Content */}
      {currentStep === 1 && (
        <PlacePicker
          places={places}
          onPlaceSelect={handlePlaceSelect}
          selectedPlace={selectedPlace}
        />
      )}

      {currentStep === 2 && selectedPlace && (
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <h3 className="text-lg font-semibold text-forest mb-4">Validar Ubicación</h3>
          <div className="bg-gradient-to-r from-forest/10 to-forest2/10 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-forest">{selectedPlace.name}</h4>
            <p className="text-sm text-gray-600">{selectedPlace.barrio}</p>
            <p className="text-xs text-gray-500 mt-1">Distancia: {selectedPlace.distance}m</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cambiar lugar
            </button>
            <button
              onClick={handleValidation}
              className="px-4 py-2 bg-gradient-to-r from-forest to-forest2 text-white rounded-lg hover:shadow-glow-forest transition-all duration-200"
            >
              Confirmar ubicación
            </button>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <PhotoNote
          onNoteChange={handleNoteChange}
          onPhotoChange={handlePhotoChange}
          initialNote={checkInNote}
          initialPhoto={checkInPhoto}
        />
      )}

      {currentStep === 4 && (
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <h3 className="text-lg font-semibold text-forest mb-4">Confirmar Check-in</h3>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-forest/10 to-forest2/10 rounded-lg p-4">
              <h4 className="font-semibold text-forest">{selectedPlace?.name}</h4>
              <p className="text-sm text-gray-600">{selectedPlace?.barrio}</p>
            </div>
            
            {checkInNote && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700">{checkInNote}</p>
              </div>
            )}

            {checkInPhoto && (
              <div className="relative">
                <img
                  src={checkInPhoto}
                  alt="Foto del check-in"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Editar
              </button>
              <button
                onClick={handleConsent}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-ocobo to-gold text-white rounded-lg hover:shadow-glow-ocobo transition-all duration-200"
              >
                🎯 Finalizar Check-in
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ConsentModal
        isOpen={showConsentModal}
        onClose={handleConsentDecline}
        onAccept={handleConsentAccept}
        onDecline={handleConsentDecline}
      />

      <Toast
        isVisible={toast.isVisible}
        onClose={hideToast}
        type={toast.type}
        title={toast.title}
        message={toast.message}
      />
    </div>
  )
}

export default CheckIn
