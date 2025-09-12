import React from 'react';

const CheckInStepper = ({ currentStep, steps, onStepClick }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral">Proceso de Check-in</h3>
        <div className="text-sm text-gray-600">
          Paso {currentStep} de {steps.length}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;
          
          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <button
                onClick={() => onStepClick && onStepClick(stepNumber)}
                disabled={isUpcoming}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ocobo/50 ${
                  isCompleted
                    ? 'bg-gradient-to-r from-forest to-forest2 text-white shadow-glow-forest'
                    : isCurrent
                    ? 'bg-gradient-to-r from-ocobo to-gold text-white shadow-glow-ocobo'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                aria-label={`Paso ${stepNumber}: ${step.title}`}
              >
                {isCompleted ? '✓' : stepNumber}
              </button>
              
              <div className="mt-2 text-center">
                <div className={`text-xs font-medium ${
                  isCompleted || isCurrent ? 'text-neutral' : 'text-gray-400'
                }`}>
                  {step.title}
                </div>
                <div className={`text-xs mt-1 ${
                  isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {step.subtitle}
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`absolute w-full h-0.5 top-5 left-1/2 transform -translate-y-1/2 ${
                  isCompleted ? 'bg-gradient-to-r from-forest to-forest2' : 'bg-gray-200'
                }`} style={{ width: 'calc(100% - 2.5rem)', left: 'calc(50% + 1.25rem)' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckInStepper;
