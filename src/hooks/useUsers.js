// hooks/useUsers.js
import { useState, useEffect } from 'react';
import { userService, mockUserData } from '../services/userService';

export const useUsers = () => {
  const [usersData, setUsersData] = useState({
    users: [],
    loading: true,
    error: null,
    actionLoading: false
  });

  const fetchUsers = async () => {
    try {
      setUsersData(prev => ({ ...prev, loading: true, error: null }));
      
      const data = await userService.getUsers();
      
      setUsersData(prev => ({
        ...prev,
        users: data,
        loading: false
      }));
      
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to mock data
      setUsersData(prev => ({
        ...prev,
        error: error.message,
        loading: false,
        users: mockUserData.users
      }));
    }
  };

  const createUser = async (userData) => {
    try {
      setUsersData(prev => ({ ...prev, actionLoading: true }));
      const newUser = await userService.createUser(userData);
      
      // Add the new user to the list
      setUsersData(prev => ({
        ...prev,
        users: [...prev.users, newUser],
        actionLoading: false
      }));
      
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      setUsersData(prev => ({ ...prev, actionLoading: false }));
      throw error;
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      setUsersData(prev => ({ ...prev, actionLoading: true }));
      const updatedUser = await userService.updateUser(userId, userData);
      
      // Update the user in the list
      setUsersData(prev => ({
        ...prev,
        users: prev.users.map(user => 
          user.id === userId ? { ...user, ...updatedUser } : user
        ),
        actionLoading: false
      }));
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      setUsersData(prev => ({ ...prev, actionLoading: false }));
      throw error;
    }
  };

  const deleteUser = async (userId) => {
    try {
      setUsersData(prev => ({ ...prev, actionLoading: true }));
      await userService.deleteUser(userId);
      
      // Remove the user from the list
      setUsersData(prev => ({
        ...prev,
        users: prev.users.filter(user => user.id !== userId),
        actionLoading: false
      }));
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      setUsersData(prev => ({ ...prev, actionLoading: false }));
      throw error;
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      setUsersData(prev => ({ ...prev, actionLoading: true }));
      
      let updatedUser;
      if (currentStatus) {
        updatedUser = await userService.deactivateUser(userId);
      } else {
        updatedUser = await userService.activateUser(userId);
      }
      
      // Update the user status in the list
      setUsersData(prev => ({
        ...prev,
        users: prev.users.map(user => 
          user.id === userId ? { ...user, isActive: !currentStatus } : user
        ),
        actionLoading: false
      }));
      
      return updatedUser;
    } catch (error) {
      console.error('Error toggling user status:', error);
      setUsersData(prev => ({ ...prev, actionLoading: false }));
      throw error;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    ...usersData,
    refetch: fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus
  };
};