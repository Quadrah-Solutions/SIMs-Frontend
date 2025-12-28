// services/userService.js
import config from '../config/config';
import keycloak from '../config/keycloak';

const API_BASE_URL = config.API_BASE_URL;

const getAuthHeader = () => {
  if (keycloak && keycloak.token) {
    return { 
      'Authorization': `Bearer ${keycloak.token}`,
      'Content-Type': 'application/json'
    };
  }
  return { 'Content-Type': 'application/json' };
};

export const userService = {
  async getUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: getAuthHeader()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      
      const users = await response.json();
      // Transform the data if needed
      return users.map(user => ({
        ...user,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role || 'USER',
        status: user.isActive ? 'Active' : 'Inactive'
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async createUser(userData) {
    try {
      console.log('Creating user with data:', userData);
      
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        // Try to get more detailed error
        const errorText = await response.text();
        console.error('Create user error response:', errorText);
        console.error('Response status:', response.status);
        console.error('Response headers:', Object.fromEntries(response.headers.entries()));
        
        let errorMessage = `Failed to create user: ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage += ` - ${JSON.stringify(errorJson)}`;
        } catch (e) {
          errorMessage += ` - ${errorText}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Create user response:', data);
      
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async updateUser(userId, userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update user: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async deleteUser(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete user: ${response.status} - ${errorText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  async deactivateUser(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/deactivate`, {
        method: 'PUT',
        headers: getAuthHeader()
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to deactivate user: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  },

  async activateUser(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/activate`, {
        method: 'PUT',
        headers: getAuthHeader()
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to activate user: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  }
};

// Mock data for development
export const mockUserData = {
  users: [
    {
      id: 1,
      keycloakId: "mock-1",
      username: "admin",
      firstName: "System",
      lastName: "Administrator",
      email: "admin@school.edu",
      role: "ADMIN",
      isActive: true,
      lastLogin: "2025-12-28T10:30:00.000Z",
      createdAt: "2025-01-01T00:00:00.000Z"
    },
    {
      id: 2,
      keycloakId: "mock-2",
      username: "nurse",
      firstName: "School",
      lastName: "Nurse",
      email: "nurse@school.edu",
      role: "NURSE",
      isActive: true,
      lastLogin: "2025-12-27T15:45:00.000Z",
      createdAt: "2025-01-02T00:00:00.000Z"
    }
  ]
};