import React from 'react';

const ReportModal = ({ onClose }) => {
    return (
        // Modal Overlay Structure
<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 relative">
                
                {/* Modal Header */}
                <div className="sticky top-0 p-5 border-b border-gray-100 bg-white z-10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-700">📊 Generate Reports Dashboard</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50" aria-label="Close">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Modal Body: Report Filters Content */}
                <div className="p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-700">Report Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="date" placeholder="Date Range Start" className="p-3 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500"/>
                        <select className="p-3 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500">
                            <option>Class Selector</option>
                        </select>
                        <select className="p-3 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500">
                            <option>Condition Selector</option>
                        </select>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-700 pt-4">Report Types</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="font-medium text-gray-600">A. Visit Reports</p>
                            <ul className="list-disc list-inside text-gray-500 space-y-1 mt-1">
                                <li>Total visits</li>
                                <li>Visits by class</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-medium text-gray-600">B. Student Health</p>
                            <ul className="list-disc list-inside text-gray-500 space-y-1 mt-1">
                                <li>Chronic illnesses</li>
                                <li>Students with allergies</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-medium text-gray-600">C. Inventory Reports</p>
                            <ul className="list-disc list-inside text-gray-500 space-y-1 mt-1">
                                <li>Drugs dispensed</li>
                                <li>Stock levels</li>
                            </ul>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button className="px-5 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition">View on screen</button>
                        <button className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition">Download PDF</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;