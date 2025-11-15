import React from 'react';

const AddStudentModal = ({ onClose }) => {
    return (
        // Modal Overlay Structure
<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 relative">
                
                {/* Modal Header */}
                <div className="sticky top-0 p-5 border-b border-green-100 bg-white z-10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-green-700">➕ Student Registration Form</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50" aria-label="Close">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Modal Body: Student Form Content */}
                <div className="p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-700">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Full Name" className="p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"/>
                        <input type="date" placeholder="Date of Birth" className="p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"/>
                        <input type="text" placeholder="Student ID / Index Number" className="p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"/>
                        <input type="text" placeholder="Class / Programme" className="p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"/>
                        <input type="text" placeholder="Guardian Name" className="p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"/>
                        <input type="tel" placeholder="Guardian Phone" className="p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"/>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-700">Medical Information</h3>
                    <textarea placeholder="Pre-existing conditions, Allergies, Medications, Blood group" rows="3" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"></textarea>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-2">
                        <button className="px-5 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">Save Student</button>
                        <button className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition">Clear Form</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddStudentModal;