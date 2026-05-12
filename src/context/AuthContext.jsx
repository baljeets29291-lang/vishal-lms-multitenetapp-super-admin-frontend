import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_BACKEND_API;

  // Fetch user data on mount - remove token dependency
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Use cookies for authentication - no token needed
      const response = await axios.get(`${BASE_URL}/admin/profile`, {
        withCredentials: true
      });

      const userData = response.data.admin;
      setUser(userData);

    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // If not authenticated, set loading to false
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await axios.post(`${BASE_URL}/admin/normal-login`, credentials, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true, // Enable cookies for login
      });

      const userData = response.data.admin || response.data;

      // Set user data - no token needed with cookies
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to clear server-side cookies
      await axios.post(`${BASE_URL}/admin/logout`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }

    // Clear user data
    setUser(null);
  };

  const updateUserProfile = async (updatedData) => {
    try {
      const userId = user?.id;
      if (!userId) {
        throw new Error('User ID not found');
      }

      const response = await axios.patch(`${BASE_URL}/admin/${userId}`, updatedData, {
        withCredentials: true
      });

      // Update user state
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);

      return { success: true };
    } catch (error) {
      console.error('Profile update failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update profile'
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUserProfile,
    fetchUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
