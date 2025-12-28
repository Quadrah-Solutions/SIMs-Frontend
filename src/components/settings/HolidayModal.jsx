// components/settings/HolidayModal.js - SIMPLIFIED
import React, { useState, useEffect } from 'react';

const HolidayModal = ({ isOpen, onClose, onSave, isEditing, holiday = null }) => {
  const [holidayName, setHolidayName] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (holiday) {
        setHolidayName(holiday.name || '');
        setSelectedDate(holiday.date || '');
      } else {
        setHolidayName('');
        setSelectedDate('');
      }
    }
  }, [isOpen, holiday]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!holidayName.trim()) {
        alert('Please enter a holiday name');
        return;
    }
    
    if (!selectedDate) {
        alert('Please select a date');
        return;
    }
    
    setLoading(true);
    try {
        // Simple object - just name and date
        const holidayData = {
        name: holidayName.trim(),
        date: selectedDate
        };
        await onSave(holidayData);
        onClose();
    } catch (error) {
        console.error('Error saving holiday:', error);
    } finally {
        setLoading(false);
    }
    };

  if (!isOpen) return null;

  // Get today's date for the min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-xl bg-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Holiday' : 'Add New Holiday'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition duration-200"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Holiday Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Holiday Name
            </label>
            <input
              type="text"
              value={holidayName}
              onChange={(e) => setHolidayName(e.target.value)}
              placeholder="e.g., Christmas Day, Mid-Term Break"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={today}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                disabled={loading}
              />
              <div className="absolute right-3 top-3 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Click the calendar icon or use the date picker
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Holiday'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HolidayModal;