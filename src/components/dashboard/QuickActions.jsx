import React from 'react';

const QuickActions = () => {
    
  const actions = [
    {
      label: "New Visit",
      color: "bg-blue-600 hover:bg-blue-700",
      onClick: () => console.log("New Visit clicked")
    },
    {
      label: "Add Student", 
      color: "bg-green-600 hover:bg-green-700",
      onClick: () => console.log("Add Student clicked")
    },
    {
      label: "Generate Report",
      color: "bg-gray-600 hover:bg-gray-700", 
      onClick: () => console.log("Generate Report clicked")
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
      </div>
      <div className="p-4 space-y-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`w-full ${action.color} text-white py-2 px-4 rounded-md font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;