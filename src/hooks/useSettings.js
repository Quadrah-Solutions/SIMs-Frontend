import { useState, useEffect } from 'react';
import { userService, mockUserData } from '../services/userService';

export const useSettings = () => {
  const [usersData, setUsersData] = useState({
    users: [],
    loading: true,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });

  const [settingsData, setSettingsData] = useState({
    settings: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    console.log('useSettings hook is running');
    
    // Simulate API call for users
    setTimeout(() => {
      setUsersData({
        users: mockUserData.users,
        loading: false,
        error: null,
        currentPage: 1,
        totalPages: 2,
        totalCount: 8
      });
    }, 1000);

    // Simulate API call for settings
    setTimeout(() => {
      setSettingsData({
        settings: mockUserData.settings,
        loading: false,
        error: null
      });
    }, 1200);

  }, []);

  const refetchUsers = (page = 1) => {
    console.log('Refetch users called with page:', page);
  };

  const updateSettings = async (newSettings) => {
    console.log('Updating settings:', newSettings);
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        setSettingsData(prev => ({
          ...prev,
          settings: newSettings
        }));
        resolve();
      }, 500);
    });
  };

  const addHoliday = async (holiday) => {
    console.log('Adding holiday:', holiday);
    // Simulate API call
  };

  const deleteHoliday = async (id) => {
    console.log('Deleting holiday:', id);
    // Simulate API call
  };

  return {
    // Users data
    ...usersData,
    
    // Settings data
    settings: settingsData.settings,
    settingsLoading: settingsData.loading,
    settingsError: settingsData.error,
    
    // Methods
    refetchUsers,
    updateSettings,
    addHoliday,
    deleteHoliday
  };
};