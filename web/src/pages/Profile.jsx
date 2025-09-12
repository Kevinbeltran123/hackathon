import React, { useState, useEffect } from 'react';
import ProfileHeader from '../components/profile/ProfileHeader';
import StatsStrip from '../components/profile/StatsStrip';
import Tabs from '../components/profile/Tabs';
import CheckInStepper from '../components/profile/CheckInStepper';
import PlacePicker from '../components/profile/PlacePicker';
import PhotoNote from '../components/profile/PhotoNote';
import ConsentModal from '../components/profile/ConsentModal';
import CouponCreator from '../components/profile/CouponCreator';
import CouponCard from '../components/profile/CouponCard';
import WalletList from '../components/profile/WalletList';
import RedeemModal from '../components/profile/RedeemModal';
import Toast from '../components/profile/Toast';

const Profile = () => {
  // State management
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState({
    name: 'Explorador de Ibagué',
    joinDate: 'Enero 2024',
  });
  const [stats, setStats] = useState({
    checkins: 12,
    points: 450,
    coupons: 3,
  });
  const [achievements, setAchievements] = useState(['first_checkin', 'explorer']);
  const [level, setLevel] = useState(2);

  // Check-in flow state
  const [checkInStep, setCheckInStep] = useState(1);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [checkInNote, setCheckInNote] = useState('');
  const [checkInPhoto, setCheckInPhoto] = useState(null);
  const [showConsentModal, setShowConsentModal] = useState(false);

  // Coupons state
  const [coupons, setCoupons] = useState([]);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  // Toast state
  const [toast, setToast] = useState({
    isVisible: false,
    type: 'success',
    title: '',
    message: '',
  });

  // Mock data
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
  ];

  const checkInSteps = [
    { id: 1, title: 'Elegir Lugar', subtitle: 'Selecciona dónde estás' },
    { id: 2, title: 'Validar', subtitle: 'Confirma ubicación' },
    { id: 3, title: 'Nota', subtitle: 'Agrega detalles' },
    { id: 4, title: 'Confirmar', subtitle: 'Finalizar check-in' },
  ];

  // Check-in flow handlers
  const handlePlaceSelect = (place) => {
    setSelectedPlace(place);
    setCheckInStep(2);
  };

  const handleCheckInValidation = () => {
    // Simulate validation
    if (selectedPlace) {
      setCheckInStep(3);
    }
  };

  const handleCheckInNote = (note) => {
    setCheckInNote(note);
  };

  const handleCheckInPhoto = (photo) => {
    setCheckInPhoto(photo);
  };

  const handleCheckInConsent = () => {
    setShowConsentModal(true);
  };

  const handleConsentAccept = () => {
    setShowConsentModal(false);
    setCheckInStep(4);
  };

  const handleConsentDecline = () => {
    setShowConsentModal(false);
  };

  const handleCheckInConfirm = () => {
    // Simulate check-in
    setStats(prev => ({
      ...prev,
      checkins: prev.checkins + 1,
      points: prev.points + 50,
    }));

    // Check for new achievements
    if (stats.checkins + 1 === 5 && !achievements.includes('local_hero')) {
      setAchievements(prev => [...prev, 'local_hero']);
      setLevel(prev => prev + 1);
    }

    // Show success toast
    showToast('success', '¡Check-in exitoso!', 'Has ganado 50 puntos');

    // Reset check-in flow
    setCheckInStep(1);
    setSelectedPlace(null);
    setCheckInNote('');
    setCheckInPhoto(null);
  };

  // Coupon handlers
  const handleCreateCoupon = (coupon) => {
    setCoupons(prev => [...prev, coupon]);
    showToast('success', 'Cupón creado', 'Tu cupón está listo para usar');
  };

  const handleRedeemCoupon = (coupon, code) => {
    // Simulate redemption
    setCoupons(prev => 
      prev.map(c => 
        c.id === coupon.id ? { ...c, status: 'used' } : c
      )
    );
    showToast('success', 'Cupón redimido', '¡Disfruta tu descuento!');
    setShowRedeemModal(false);
  };

  const handleAddToWallet = (coupon) => {
    setCoupons(prev => [...prev, { ...coupon, id: `wallet-${Date.now()}` }]);
    showToast('info', 'Añadido a wallet', 'Cupón guardado en tu billetera');
  };

  // Toast handler
  const showToast = (type, title, message) => {
    setToast({
      isVisible: true,
      type,
      title,
      message,
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <StatsStrip achievements={achievements} level={level} />
            
            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
              <h3 className="text-lg font-semibold text-neutral mb-4">Actividad Reciente</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-forest to-forest2 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">📍</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral">Check-in en Conservatorio del Tolima</p>
                    <p className="text-xs text-gray-500">Hace 2 horas • +50 puntos</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-gold to-ocobo rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🎫</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral">Cupón redimido</p>
                    <p className="text-xs text-gray-500">Restaurante La Pola • Hace 1 día</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'checkin':
        return (
          <div className="space-y-6">
            <CheckInStepper 
              currentStep={checkInStep}
              steps={checkInSteps}
              onStepClick={setCheckInStep}
            />

            {checkInStep === 1 && (
              <PlacePicker
                places={places}
                onPlaceSelect={handlePlaceSelect}
                selectedPlace={selectedPlace}
              />
            )}

            {checkInStep === 2 && selectedPlace && (
              <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
                <h3 className="text-lg font-semibold text-neutral mb-4">Validar Ubicación</h3>
                <div className="bg-gradient-to-r from-forest/10 to-forest2/10 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-forest">{selectedPlace.name}</h4>
                  <p className="text-sm text-gray-600">{selectedPlace.barrio}</p>
                  <p className="text-xs text-gray-500 mt-1">Distancia: {selectedPlace.distance}m</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setCheckInStep(1)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cambiar lugar
                  </button>
                  <button
                    onClick={handleCheckInValidation}
                    className="px-4 py-2 bg-gradient-to-r from-forest to-forest2 text-white rounded-lg hover:shadow-glow-forest transition-all duration-200"
                  >
                    Confirmar ubicación
                  </button>
                </div>
              </div>
            )}

            {checkInStep === 3 && (
              <PhotoNote
                onNoteChange={handleCheckInNote}
                onPhotoChange={handleCheckInPhoto}
                initialNote={checkInNote}
                initialPhoto={checkInPhoto}
              />
            )}

            {checkInStep === 4 && (
              <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
                <h3 className="text-lg font-semibold text-neutral mb-4">Confirmar Check-in</h3>
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
                      onClick={() => setCheckInStep(3)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={handleCheckInConsent}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-ocobo to-gold text-white rounded-lg hover:shadow-glow-ocobo transition-all duration-200"
                    >
                      🎯 Finalizar Check-in
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'coupons':
        return (
          <div className="space-y-6">
            <CouponCreator onCreateCoupon={handleCreateCoupon} />
            <WalletList
              coupons={coupons}
              onRedeem={(coupon) => {
                setSelectedCoupon(coupon);
                setShowRedeemModal(true);
              }}
              onRemove={(couponId) => {
                setCoupons(prev => prev.filter(c => c.id !== couponId));
                showToast('info', 'Cupón eliminado', 'Se ha removido de tu wallet');
              }}
            />
          </div>
        );

      case 'history':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
              <h3 className="text-lg font-semibold text-neutral mb-4">Historial de Actividad</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-forest to-forest2 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">📍</span>
                    </div>
                    <div>
                      <p className="font-medium text-neutral">Check-in en Jardín Botánico</p>
                      <p className="text-sm text-gray-500">Belén • 15 de enero, 2024</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-forest">+50 puntos</p>
                    <p className="text-xs text-gray-500">14:30</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-gold to-ocobo rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🎫</span>
                    </div>
                    <div>
                      <p className="font-medium text-neutral">Cupón redimido</p>
                      <p className="text-sm text-gray-500">Restaurante La Pola • 20% descuento</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gold">-1 cupón</p>
                    <p className="text-xs text-gray-500">12 de enero, 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <ProfileHeader user={user} stats={stats} />

      {/* Tabs */}
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      {renderTabContent()}

      {/* Modals */}
      <ConsentModal
        isOpen={showConsentModal}
        onClose={handleConsentDecline}
        onAccept={handleConsentAccept}
        onDecline={handleConsentDecline}
      />

      <RedeemModal
        isOpen={showRedeemModal}
        onClose={() => setShowRedeemModal(false)}
        onRedeem={handleRedeemCoupon}
        coupon={selectedCoupon}
      />

      {/* Toast */}
      <Toast
        isVisible={toast.isVisible}
        onClose={hideToast}
        type={toast.type}
        title={toast.title}
        message={toast.message}
      />
    </div>
  );
};

export default Profile;