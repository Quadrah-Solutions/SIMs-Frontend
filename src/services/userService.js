// Remove process.env usage and use direct API base URL
const API_BASE_URL = '/api';

export const userService = {
  async getUsers(page = 1, pageSize = 10, filters = {}) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...filters
    });
    
    const response = await fetch(`${API_BASE_URL}/users?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  },

  async getSettings() {
    const response = await fetch(`${API_BASE_URL}/settings`);
    if (!response.ok) throw new Error('Failed to fetch settings');
    return await response.json();
  },

  async updateSettings(settings) {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings)
    });
    if (!response.ok) throw new Error('Failed to update settings');
    return await response.json();
  },

  async addHoliday(holiday) {
    const response = await fetch(`${API_BASE_URL}/holidays`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(holiday)
    });
    if (!response.ok) throw new Error('Failed to add holiday');
    return await response.json();
  },

  async deleteHoliday(id) {
    const response = await fetch(`${API_BASE_URL}/holidays/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete holiday');
    return await response.json();
  }
};

// Mock data for development
export const mockUserData = {
  users: [
    { 
      id: 1, 
      username: "admin.john", 
      role: "Administrator", 
      status: "Active", 
      lastLogin: "2024-01-15 14:30:22" 
    },
    { 
      id: 2, 
      username: "nurse.mary", 
      role: "Nurse", 
      status: "Active", 
      lastLogin: "2024-01-14 09:15:45" 
    },
    { 
      id: 3, 
      username: "teacher.kwame", 
      role: "Teacher", 
      status: "Inactive", 
      lastLogin: "2024-01-10 16:20:33" 
    },
    { 
      id: 4, 
      username: "staff.esi", 
      role: "Staff", 
      status: "Active", 
      lastLogin: "2024-01-15 11:05:18" 
    }
  ],
  settings: {
    termStart: "2024-01-08",
    termEnd: "2024-04-05",
    holidays: [
      { id: 1, name: "Mid-term Break", date: "2024-02-12" },
      { id: 2, name: "Independence Day", date: "2024-03-06" }
    ],
    alertParameters: {
      lowStock: 10,
      expiryDays: 30,
      visitReminder: 7
    }
  }
};