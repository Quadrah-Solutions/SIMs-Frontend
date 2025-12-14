import React, { useState, useEffect } from "react";
import UsersTable from '../components/settings/UsersTable';
import AddUserModal from '../components/settings/AddUserModal';
import useAuth from '../hooks/useAuth';

const initialLocalSettings = {
  termStart: "",
  termEnd: "",
  lowStock: "",
  expiryDays: "",
  visitReminder: ""
};

export default function Management() {
  const { keycloak, hasRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState(initialLocalSettings);
  const [saveLoading, setSaveLoading] = useState(false);

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const usersData = await api.get('/api/users');
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch system settings
  const fetchSettings = async () => {
    try {
      const settingsData = await api.get('/api/settings');
      setSettings(settingsData);
    } catch (error) {
      if (error.message.includes('404')) {
        // Settings not found, use defaults
        setSettings({
          termStart: "",
          termEnd: "",
          holidays: [],
          alertParameters: {
            lowStock: 10,
            expiryDays: 30,
            visitReminder: 7
          }
        });
      } else {
        console.error('Failed to fetch settings:', error);
      }
    }
  };

  useEffect(() => {
    if (keycloak.authenticated) {
      fetchUsers();
      fetchSettings();
    }
  }, [keycloak.authenticated]);

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        termStart: settings.termStart || "",
        termEnd: settings.termEnd || "",
        lowStock: settings.alertParameters?.lowStock?.toString() || "10",
        expiryDays: settings.alertParameters?.expiryDays?.toString() || "30",
        visitReminder: settings.alertParameters?.visitReminder?.toString() || "7"
      });
    }
  }, [settings]);

  const handleAddUser = () => {
    if (!hasRole('ADMIN')) {
      alert('You need ADMIN role to create users');
      return;
    }
    setIsAddUserModalOpen(true);
  };

  const handleUserCreated = (newUser) => {
    setUsers(prev => [...prev, newUser]);
    fetchUsers(); // Refresh the list
  };

  const handleSaveSettings = async () => {
    setSaveLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${keycloak.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          termStart: localSettings.termStart,
          termEnd: localSettings.termEnd,
          alertParameters: {
            lowStock: parseInt(localSettings.lowStock) || 0,
            expiryDays: parseInt(localSettings.expiryDays) || 0,
            visitReminder: parseInt(localSettings.visitReminder) || 0
          }
        })
      });

      if (response.ok) {
        const savedSettings = await response.json();
        setSettings(savedSettings);
        console.log('Settings saved successfully');
      } else {
        console.error('Failed to save settings:', response.status);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAddHoliday = async () => {
    const holidayName = prompt('Enter holiday name:');
    const holidayDate = prompt('Enter holiday date (YYYY-MM-DD):');
    
    if (holidayName && holidayDate) {
      try {
        const response = await fetch('http://localhost:8080/api/settings/holidays', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${keycloak.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: holidayName,
            date: holidayDate
          })
        });

        if (response.ok) {
          const updatedSettings = await response.json();
          setSettings(updatedSettings);
        } else {
          console.error('Failed to add holiday:', response.status);
        }
      } catch (error) {
        console.error('Failed to add holiday:', error);
      }
    }
  };

  const handleDeleteHoliday = async (holidayId) => {
    if (window.confirm('Are you sure you want to delete this holiday?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/settings/holidays/${holidayId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${keycloak.token}`
          }
        });

        if (response.ok) {
          const updatedSettings = await response.json();
          setSettings(updatedSettings);
        } else {
          console.error('Failed to delete holiday:', response.status);
        }
      } catch (error) {
        console.error('Failed to delete holiday:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* User Management Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage system users and their permissions</p>
            </div>
            <button
              onClick={handleAddUser}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-semibold">Add User</span>
            </button>
          </div>

          <UsersTable
            users={users}
            loading={loading}
          />
        </div>

        {/* System Settings Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">System Settings</h2>
          
          {/* School Terms and Holidays Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* School Terms */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">School Terms</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Term Start
                  </label>
                  <input
                    type="date"
                    value={localSettings.termStart}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, termStart: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Term End
                  </label>
                  <input
                    type="date"
                    value={localSettings.termEnd}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, termEnd: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Holidays */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Holidays</h3>
              <div className="space-y-3">
                {settings?.holidays?.map((holiday) => (
                  <div key={holiday.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-800">{holiday.name}</span>
                      <span className="text-gray-600 ml-2">({holiday.date})</span>
                    </div>
                    <button
                      onClick={() => handleDeleteHoliday(holiday.id)}
                      className="text-red-600 hover:text-red-800 transition duration-200 p-1 rounded hover:bg-red-50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                {(!settings?.holidays || settings.holidays.length === 0) && (
                  <div className="text-center text-gray-500 py-4">
                    No holidays configured
                  </div>
                )}
                <button
                  onClick={handleAddHoliday}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="font-medium">Add Holiday</span>
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-8"></div>

          {/* Alert Parameters Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Alert Parameters</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Low Stock Alert */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Low Stock Alert
                </label>
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2 whitespace-nowrap">Less than</span>
                  <input
                    type="number"
                    value={localSettings.lowStock}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, lowStock: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-gray-50 hover:bg-white"
                    min="0"
                  />
                  <span className="text-gray-600 ml-2 whitespace-nowrap">items</span>
                </div>
              </div>

              {/* Expired Items Alert */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expired Items Alert
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={localSettings.expiryDays}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, expiryDays: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-gray-50 hover:bg-white"
                    min="0"
                  />
                  <span className="text-gray-600 ml-2 whitespace-nowrap">days before expiry</span>
                </div>
              </div>

              {/* Visit Reminder */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visit Reminder
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={localSettings.visitReminder}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, visitReminder: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-gray-50 hover:bg-white"
                    min="0"
                  />
                  <span className="text-gray-600 ml-2 whitespace-nowrap">days overdue</span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Settings Button */}
          <div className="flex justify-end mt-8">
            <button
              onClick={handleSaveSettings}
              disabled={saveLoading}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saveLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className="font-semibold">Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-semibold">Save Settings</span>
                </>
              )}
            </button>
          </div>
        </div>

        <AddUserModal
          isOpen={isAddUserModalOpen}
          onClose={() => setIsAddUserModalOpen(false)}
          onUserCreated={handleUserCreated}
        />
      </div>
    </div>
  );
}