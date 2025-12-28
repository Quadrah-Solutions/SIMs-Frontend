// pages/Management.js
import React, { useState } from 'react';
import UsersTable from '../components/settings/UsersTable';
import AddUserModal from '../components/settings/AddUserModal';
import EditUserModal from '../components/settings/EditUserModal';
import HolidayModal from '../components/settings/HolidayModal';
import { useUsers } from '../hooks/useUsers';
import { useSettings } from '../hooks/useSettings';
import { useNotification } from '../components/common/NotificationProvider';
import useAuth from '../hooks/useAuth';

export default function Management() {
  const { hasRole } = useAuth();
  const { 
    users, 
    loading: usersLoading, 
    error: usersError, 
    actionLoading: userActionLoading,
    refetch: refetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus
  } = useUsers();

  const {
    settings,
    loading: settingsLoading,
    error: settingsError,
    localSettings,
    setLocalSettings,
    saveSettings,
    addHoliday,
    deleteHoliday,
    saveLoading,
    refetch: refetchSettings
  } = useSettings();

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);

  
  const { success, error: showError } = useNotification();

  const handleAddUser = () => {
    if (!hasRole('ADMIN')) {
      showError('You need ADMIN role to create users');
      return;
    }
    setIsAddUserModalOpen(true);
  };

  const handleEditUser = (user) => {
    if (!hasRole('ADMIN')) {
      showError('You need ADMIN role to edit users');
      return;
    }
    setSelectedUser(user);
    setIsEditUserModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!hasRole('ADMIN')) {
      showError('You need ADMIN role to delete users');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(userId);
        success('User deleted successfully!');
        await refetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
        showError(`Failed to delete user: ${error.message}`);
      }
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    if (!hasRole('ADMIN')) {
      showError('You need ADMIN role to change user status');
      return;
    }

    const action = currentStatus ? 'deactivate' : 'activate';
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      try {
        await toggleUserStatus(userId, currentStatus);
        success(`User ${action}d successfully!`);
        await refetchUsers();
      } catch (error) {
        console.error(`Failed to ${action} user:`, error);
        showError(`Failed to ${action} user: ${error.message}`);
      }
    }
  };

  const handleUserCreated = async (userData) => {
    try {
      await createUser(userData);
      setIsAddUserModalOpen(false);
      success('User created successfully!');
      await refetchUsers();
    } catch (error) {
      console.error('Failed to create user:', error);
      showError(`Failed to create user: ${error.message}`);
    }
  };

  const handleUserUpdated = async (userId, userData) => {
    try {
      await updateUser(userId, userData);
      setIsEditUserModalOpen(false);
      setSelectedUser(null);
      success('User updated successfully!');
      await refetchUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      showError(`Failed to update user: ${error.message}`);
    }
  };

  const handleSaveSettings = async () => {
    if (!hasRole('ADMIN')) {
      showError('You need ADMIN role to save settings');
      return;
    }

    try {
      // Prepare the data in the correct structure
      const settingsData = {
        termStart: localSettings.termStart || null,
        termEnd: localSettings.termEnd || null,
        alertParameters: {
          lowStock: parseInt(localSettings.lowStock) || 10,
          expiryDays: parseInt(localSettings.expiryDays) || 30,
          visitReminder: parseInt(localSettings.visitReminder) || 7
        }
      };
      
      console.log('Saving settings:', settingsData);
      
      await saveSettings(settingsData);
      success('Settings saved successfully!');
      await refetchSettings();
    } catch (error) {
      console.error('Failed to save settings:', error);
      showError(`Failed to save settings: ${error.message}`);
    }
  };

  const formatHolidayDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleAddHoliday = () => {
    if (!hasRole('ADMIN')) {
      showError('You need ADMIN role to manage holidays');
      return;
    }
    setIsHolidayModalOpen(true);
  };

  const handleSaveHoliday = async (holidayData) => {
    try {      
      await addHoliday(holidayData);
      
      success('Holiday added successfully!');
      await refetchSettings();
    } catch (error) {
      showError(`Failed to add holiday: ${error.message}`);
    }
  };

  const handleDeleteHoliday = async (holidayId) => {
    if (!hasRole('ADMIN')) {
      showError('You need ADMIN role to manage holidays');
      return;
    }

    if (window.confirm('Are you sure you want to delete this holiday?')) {
      try {
        await deleteHoliday(holidayId);
        success('Holiday deleted successfully!');
        await refetchSettings();
      } catch (error) {
        console.error('Failed to delete holiday:', error);
        showError(`Failed to delete holiday: ${error.message}`);
      }
    }
  };


  // Loading state
  if ((usersLoading || settingsLoading) && (!users || !settings)) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading management data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (usersError || settingsError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-red-800 font-medium">Error loading data</h3>
                <p className="text-red-600 text-sm mt-1">
                  {usersError || settingsError}
                </p>
              </div>
              <button
                onClick={() => {
                  if (usersError) refetchUsers();
                  if (settingsError) refetchSettings();
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isModalOpen = isAddUserModalOpen || isEditUserModalOpen || isHolidayModalOpen;


  return (
    <div className="min-h-screen bg-gray-50 p-6">
       <div className={`max-w-7xl mx-auto transition-all duration-300 ${
        isModalOpen ? 'blur-sm opacity-70' : 'blur-0 opacity-100'
      }`}>
        {/* User Management Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage system users and their permissions</p>
            </div>
            {hasRole('ADMIN') && (
              <button
                onClick={handleAddUser}
                disabled={userActionLoading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-semibold">Add User</span>
              </button>
            )}
          </div>

          <UsersTable
            users={users || []}
            loading={usersLoading}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onToggleStatus={handleToggleUserStatus}
          />
        </div>

        {/* System Settings Card - Only for ADMINs */}
        {hasRole('ADMIN') && (
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
                    <div key={holiday.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-gray-300 transition duration-200">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 p-2 rounded-lg">
                          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{holiday.name}</div>
                          <div className="text-sm text-gray-600">
                            {formatHolidayDate(holiday.date)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteHoliday(holiday.id)}
                        className="text-red-500 hover:text-red-700 transition duration-200 p-2 rounded-lg hover:bg-red-50"
                        title="Delete Holiday"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {(!settings?.holidays || settings.holidays.length === 0) && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                      <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No holidays</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by adding a holiday.</p>
                    </div>
                  )}
                  <button
                    onClick={handleAddHoliday}
                    className="w-full bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 px-6 py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border border-blue-200 hover:border-blue-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="font-semibold">Add Holiday</span>
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
        )}
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onUserCreated={handleUserCreated}
      />

      <HolidayModal
        isOpen={isHolidayModalOpen}
        onClose={() => setIsHolidayModalOpen(false)}
        onSave={handleSaveHoliday}
        isEditing={false}
      />

      {/* Edit User Modal */}
      {selectedUser && (
        <EditUserModal
          isOpen={isEditUserModalOpen}
          onClose={() => {
            setIsEditUserModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onUserUpdated={(userData) => handleUserUpdated(selectedUser.id, userData)}
        />
      )}
    </div>
  );
}