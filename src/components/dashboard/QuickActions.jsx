import React, { useState } from 'react';
import NewVisitModal from './NewVisitModal';
import AddStudentModal from './AddStudentModal';
import ReportModal from './ReportModal';
// Import the three separate modal components


const QuickActions = () => {
    // State to track which modal is currently open ('newVisit', 'addStudent', 'generateReport', or null)
    const [activeModal, setActiveModal] = useState(null);

    // Function to close any active modal
    const handleCloseModal = () => setActiveModal(null);
    
    // Actions array with button details and their corresponding modal state value
    const actions = [
        {
            label: "New Visit",
            color: "bg-blue-600 hover:bg-blue-700",
            modal: "newVisit",
            // The onClick now sets the state to open the correct modal
            onClick: () => setActiveModal("newVisit") 
        },
        {
            label: "Add Student", 
            color: "bg-green-600 hover:bg-green-700",
            modal: "addStudent",
            onClick: () => setActiveModal("addStudent")
        },
        {
            label: "Generate Report",
            color: "bg-gray-600 hover:bg-gray-700", 
            modal: "generateReport",
            onClick: () => setActiveModal("generateReport")
        }
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            {/* Quick Actions Header - Based on your original design */}
            <div className="border-b border-gray-200 pb-4 mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
            </div>
            
            {/* Quick Actions Buttons - Preserving your exact button style */}
            <div className="space-y-3">
                {actions.map((action, index) => (
                    <button
                        key={index}
                        onClick={action.onClick}
                        // Note: I updated focus ring to match color better for a modern look
                        className={`w-full ${action.color} text-white py-2 px-4 rounded-md font-medium transition duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-opacity-50 
                            ${action.modal === 'newVisit' ? 'focus:ring-blue-500' : 
                              action.modal === 'addStudent' ? 'focus:ring-green-500' : 
                              'focus:ring-gray-500'} text-sm`}
                    >
                        {action.label}
                    </button>
                ))}
            </div>

            {/* --- Conditional Modal Rendering --- */}
            {activeModal === 'newVisit' && <NewVisitModal onClose={handleCloseModal} />}
            {activeModal === 'addStudent' && <AddStudentModal onClose={handleCloseModal} />}
            {activeModal === 'generateReport' && <ReportModal onClose={handleCloseModal} />}

        </div>
    );
};

export default QuickActions;