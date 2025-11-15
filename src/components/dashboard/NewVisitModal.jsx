import React from 'react';

const NewVisitModal = ({ onClose }) => {
    return (
        // Modal Overlay Structure
<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 relative">
                
                {/* Modal Header */}
                <div className="sticky top-0 p-5 border-b border-blue-100 bg-white z-10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-blue-700">🩺 New Visit Intake Form</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50" aria-label="Close">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Modal Body: Visit Form Content */}
                <div className="p-6 space-y-4">
                    <input type="text" placeholder="Student ID / Search Student" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"/>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" readOnly value="Name: John Doe" className="p-3 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-500"/>
                        <input type="text" readOnly value="Class: 7A" className="p-3 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-500"/>
                    </div>
                    
                    <textarea placeholder="Reason for visit / Symptoms, Vitals, Diagnosis, Treatment..." rows="6" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"></textarea>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-2">
                        <button className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">Save Visit</button>
                        <button className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition">Print Summary</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewVisitModal;