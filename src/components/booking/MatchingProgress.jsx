// src/components/booking/MatchingProgress.jsx
import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, Search, Users, UserCheck } from 'lucide-react';

const steps = [
  { id: 1, label: 'Searching Providers', icon: Search, description: 'Finding nearby available providers...' },
  { id: 2, label: 'Sending Requests', icon: Users, description: 'Sending booking request to providers...' },
  { id: 3, label: 'Waiting for Acceptance', icon: Loader2, description: 'Provider is reviewing your request...' },
  { id: 4, label: 'Booking Confirmed', icon: CheckCircle, description: 'Provider accepted your booking!' },
];

const MatchingProgress = ({ currentStep, error, onCancel }) => {
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    const percent = (currentStep / steps.length) * 100;
    setProgressPercent(percent);
  }, [currentStep]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-auto">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Finding a Provider</h3>
      
      {/* Progress Bar */}
      <div className="relative pt-1 mb-6">
        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
          <div
            style={{ width: `${progressPercent}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 transition-all duration-500"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 text-right">{Math.round(progressPercent)}%</p>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, idx) => {
          const isActive = idx + 1 === currentStep;
          const isCompleted = idx + 1 < currentStep;
          const Icon = step.icon;
          return (
            <div key={step.id} className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted ? 'bg-emerald-100 text-emerald-600' : isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className={`w-5 h-5 ${isActive && step.id === 3 ? 'animate-spin' : ''}`} />}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>{step.label}</p>
                <p className="text-xs text-gray-400">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <button
        onClick={onCancel}
        className="mt-6 w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
      >
        Cancel Search
      </button>
    </div>
  );
};

export default MatchingProgress;