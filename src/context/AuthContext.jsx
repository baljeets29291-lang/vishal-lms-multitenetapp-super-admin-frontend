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
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const BASE_URL = import.meta.env.VITE_BACKEND_API;

  // Fetch user data on mount if token exists
  useEffect(() => {
    if (token) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserData = async () => {
    try {
      // You might need to adjust this endpoint based on your API
      const response = await axios.get(`${BASE_URL}/admin/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const userData = response.data.admin;
      setUser(userData);
      
     
      
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // If token is invalid, logout
      logout();
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
        withCredentials: true,
      });

      const { token: newToken, ...userData } = response.data;
      
      // Set token
      setToken(newToken);
      localStorage.setItem('token', newToken);
      
      // Set user data
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

  const logout = () => {
    // Clear token
    setToken(null);
    localStorage.removeItem('token');
    
    // Clear user data
    setUser(null);
    
   
  };

  const updateUserProfile = async (updatedData) => {
    try {
      const userId = user?.id || localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found');
      }

      const response = await axios.patch(`${BASE_URL}/admin/${userId}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
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
    token,
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
