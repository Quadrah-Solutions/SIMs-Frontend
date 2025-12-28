// services/settingsService.js
import config from '../config/config';
import keycloak from '../config/keycloak';

const API_BASE_URL = config.API_BASE_URL;

// Helper function to get the authorization header
const getAuthHeader = () => {
  if (keycloak && keycloak.token) {
    return { 
      'Authorization': `Bearer ${keycloak.token}`,
      'Content-Type': 'application/json'
    };
  }
  return { 'Content-Type': 'application/json' };
};

// Helper function to format date to YYYY-MM-DD
const formatDate = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

export const settingsService = {
  async getSettings() {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        headers: getAuthHeader()
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // Return default settings if not found
          return {
            termStart: "",
            termEnd: "",
            holidays: [],
            alertParameters: {
              lowStock: 10,
              expiryDays: 30,
              visitReminder: 7
            }
          };
        }
        throw new Error(`Failed to fetch settings: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched settings:', data);
      
      // Transform to match frontend structure
      return {
        id: data.id,
        termStart: data.termStart || "",
        termEnd: data.termEnd || "",
        holidays: data.holidays || [],
        alertParameters: data.alertParameters || {
          lowStock: 10,
          expiryDays: 30,
          visitReminder: 7
        }
      };
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Return default settings
      return {
        termStart: "",
        termEnd: "",
        holidays: [],
        alertParameters: {
          lowStock: 10,
          expiryDays: 30,
          visitReminder: 7
        }
      };
    }
  },

  async saveSettings(settingsData) {
    try {
      // Transform frontend data to match DTO structure
      const payload = {
        termStart: formatDate(settingsData.termStart),
        termEnd: formatDate(settingsData.termEnd),
        alertParameters: {
          lowStock: parseInt(settingsData.alertParameters?.lowStock) || 10,
          expiryDays: parseInt(settingsData.alertParameters?.expiryDays) || 30,
          visitReminder: parseInt(settingsData.alertParameters?.visitReminder) || 7
        }
      };
      
      console.log('Saving settings payload:', JSON.stringify(payload, null, 2));
      
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Save settings error response:', errorText);
        throw new Error(`Failed to save settings: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Save settings response:', data);
      
      // Transform to match frontend structure
      return {
        termStart: data.termStart || "",
        termEnd: data.termEnd || "",
        holidays: data.holidays || [],
        alertParameters: data.alertParameters || {
          lowStock: 10,
          expiryDays: 30,
          visitReminder: 7
        }
      };
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  },

  async addHoliday(holidayData) {
    try {

        // Clean data - ALWAYS ensure we send proper structure
        const dataToSend = {
        name: typeof holidayData?.name === 'string' ? holidayData.name : 
                (holidayData?.name?.name || ''),
        date: holidayData?.date || holidayData?.name?.date || ''
        };
                
        const response = await fetch(`${API_BASE_URL}/settings/holidays`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(dataToSend)
        });
        
        if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add holiday: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        throw error;
    }
    },

  async deleteHoliday(holidayId) {
    try {
      console.log('Deleting holiday ID:', holidayId);
      
      const response = await fetch(`${API_BASE_URL}/settings/holidays/${holidayId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete holiday error response:', errorText);
        throw new Error(`Failed to delete holiday: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Delete holiday response:', data);
      
      // Transform to match frontend structure
      return {
        termStart: data.termStart || "",
        termEnd: data.termEnd || "",
        holidays: data.holidays || [],
        alertParameters: data.alertParameters || {
          lowStock: 10,
          expiryDays: 30,
          visitReminder: 7
        }
      };
    } catch (error) {
      console.error('Error deleting holiday:', error);
      throw error;
    }
  }
};

// Mock data for development
export const mockSettingsData = {
  settings: {
    termStart: "2024-09-01",
    termEnd: "2024-12-20",
    holidays: [
      { id: 1, name: "Mid-Term Break", date: "2024-10-14" },
      { id: 2, name: "Christmas Day", date: "2024-12-25" }
    ],
    alertParameters: {
      lowStock: 10,
      expiryDays: 30,
      visitReminder: 7
    }
  }
};