import React, { useState, useEffect } from 'react';

const NewVisitModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    student: '',
    reason: '',
    notes: '',
    diagnosis: '',
    treatment: '',
    medication: '',
    dosage: '',
    time: '',
    outcome: ''
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay to trigger animation
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting visit:', formData);
    onSave(formData);
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Modal positioned under the New Visit button */}
      <div 
        className={`absolute top-30 right-6 bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 transition-all duration-300 transform ${
          isVisible 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-4 opacity-0 scale-95'
        }`}
        style={{ maxHeight: 'calc(100vh - 140px)' }}
      >
        {/* Header - with rounded top corners */}
        <div className="p-6 border-b border-gray-200 bg-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Record New Visit</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition duration-200 p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Content - Scrollable with hidden scrollbar */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
          <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-gray-50 scrollbar-hide">
            {/* Reason for Visit */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Reason for Visit</h3>
              </div>
              <div className="relative">
                <select
                  value={formData.reason}
                  onChange={(e) => handleChange('reason', e.target.value)}
                  className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none bg-white hover:bg-gray-50 cursor-pointer"
                  required
                >
                  <option value="">Select reason for visit</option>
                  <option value="Headache">Headache</option>
                  <option value="Fever">Fever</option>
                  <option value="Stomach Pain">Stomach Pain</option>
                  <option value="Injury">Injury</option>
                  <option value="Allergy">Allergy</option>
                  <option value="Cold/Flu">Cold/Flu</option>
                  <option value="Skin Rash">Skin Rash</option>
                  <option value="Other">Other</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
              </div>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Enter detailed notes about the visit..."
                rows="4"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50 resize-none"
              />
            </div>

            {/* Diagnosis */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Diagnosis</h3>
              </div>
              <input
                type="text"
                value={formData.diagnosis}
                onChange={(e) => handleChange('diagnosis', e.target.value)}
                placeholder="Enter diagnosis..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50"
              />
            </div>

            {/* Treatment Given */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Treatment Given</h3>
              </div>
              <textarea
                value={formData.treatment}
                onChange={(e) => handleChange('treatment', e.target.value)}
                placeholder="Describe treatment provided..."
                rows="3"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50 resize-none"
              />
            </div>

            {/* Medications */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 rounded-lg">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Medications</h3>
                </div>
                <div className="flex flex-col lg:flex-row gap-4 items-end">
                    <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medication</label>
                    <input
                        type="text"
                        value={formData.medication}
                        onChange={(e) => handleChange('medication', e.target.value)}
                        placeholder="Medication name"
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50"
                    />
                    </div>
                    <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dosage</label>
                    <input
                        type="number"
                        value={formData.dosage}
                        onChange={(e) => handleChange('dosage', e.target.value)}
                        placeholder="mg"
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50"
                    />
                    </div>
                    <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => handleChange('time', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:bg-gray-50"
                    />
                    </div>
                </div>
                </div>

            {/* Outcome */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Outcome</h3>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="outcome"
                    value="Return to Class"
                    checked={formData.outcome === 'Return to Class'}
                    onChange={(e) => handleChange('outcome', e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Return to Class</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="outcome"
                    value="Sent Home"
                    checked={formData.outcome === 'Sent Home'}
                    onChange={(e) => handleChange('outcome', e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Sent Home</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="outcome"
                    value="Emergency Referral"
                    checked={formData.outcome === 'Emergency Referral'}
                    onChange={(e) => handleChange('outcome', e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Emergency Referral</span>
                </label>
              </div>
            </div>

            {/* Submit Button - with rounded bottom corners */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Submit Visit Record
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewVisitModal;