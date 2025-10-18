import React from 'react';

const AlertItem = ({ alert }) => {
  const typeStyles = {
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800", 
    urgent: "bg-red-50 border-red-200 text-red-800"
  };

  return (
    <div className={`p-2 rounded border ${typeStyles[alert.type]} mb-1 last:mb-0`}>
      <p className="text-xs">{alert.message}</p>
    </div>
  );
};

const Alerts = ({ alerts, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="h-5 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        </div>
        <div className="p-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Alerts</h2>
      </div>
      <div className="p-4">
        <div className="space-y-2">
          {alerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} />
          ))}
          {alerts.length === 0 && (
            <p className="text-gray-500 text-center py-2 text-sm">No alerts at this time</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alerts;