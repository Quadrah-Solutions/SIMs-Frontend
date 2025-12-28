// hooks/useSettings.js
import { useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService';

export const useSettings = () => {
  const [settingsData, setSettingsData] = useState({
    settings: null,
    loading: true,
    error: null,
    saveLoading: false
  });

  const [localSettings, setLocalSettings] = useState({
    termStart: "",
    termEnd: "",
    lowStock: "",
    expiryDays: "",
    visitReminder: ""
  });

  const fetchSettings = async () => {
    try {
      setSettingsData(prev => ({ ...prev, loading: true, error: null }));
      
      const data = await settingsService.getSettings();
      
      // Update local settings
      setLocalSettings({
        termStart: data.termStart || "",
        termEnd: data.termEnd || "",
        lowStock: data.alertParameters?.lowStock?.toString() || "10",
        expiryDays: data.alertParameters?.expiryDays?.toString() || "30",
        visitReminder: data.alertParameters?.visitReminder?.toString() || "7"
      });
      
      setSettingsData(prev => ({
        ...prev,
        settings: data,
        loading: false
      }));
      
    } catch (error) {
      console.error('Error fetching settings:', error);
      setSettingsData(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
    }
  };

  const saveSettings = async () => {
    try {
      setSettingsData(prev => ({ ...prev, saveLoading: true }));
      
      const settingsData = {
        termStart: localSettings.termStart,
        termEnd: localSettings.termEnd,
        alertParameters: {
          lowStock: parseInt(localSettings.lowStock) || 0,
          expiryDays: parseInt(localSettings.expiryDays) || 0,
          visitReminder: parseInt(localSettings.visitReminder) || 0
        }
      };
      
      const savedData = await settingsService.saveSettings(settingsData);
      
      // Update with saved data
      setSettingsData(prev => ({
        ...prev,
        settings: savedData
      }));
      
      setSettingsData(prev => ({ ...prev, saveLoading: false }));
      return savedData;
    } catch (error) {
      console.error('Error saving settings:', error);
      setSettingsData(prev => ({ ...prev, saveLoading: false }));
      throw error;
    }
  };

  const addHoliday = async (holidayName, holidayDate) => {
    try {
      const holidayData = {
        name: holidayName,
        date: holidayDate
      };
      
      const updatedSettings = await settingsService.addHoliday(holidayData);
      
      setSettingsData(prev => ({
        ...prev,
        settings: updatedSettings
      }));
      
      return updatedSettings;
    } catch (error) {
      console.error('Error adding holiday:', error);
      throw error;
    }
  };

  const deleteHoliday = async (holidayId) => {
    try {
      const updatedSettings = await settingsService.deleteHoliday(holidayId);
      
      setSettingsData(prev => ({
        ...prev,
        settings: updatedSettings
      }));
      
      return updatedSettings;
    } catch (error) {
      console.error('Error deleting holiday:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    ...settingsData,
    localSettings,
    setLocalSettings,
    saveSettings,
    addHoliday,
    deleteHoliday,
    refetch: fetchSettings
  };
};