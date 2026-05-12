import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_BACKEND_API;

// Configure axios instance with CORS settings
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Enable cookies for authentication
  headers: {
    'Content-Type': 'application/json',
  },
});


// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      console.error('Network/CORS Error:', error);
      toast.error('Network error. Please check your connection or try a different network.');
    }
    return Promise.reject(error);
  }
);

// Remove token-based auth headers - using cookies instead
const getAuthHeaders = () => {
  return {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  };
};

// Get all users/admins
export const getUsers = async (id) => {
  try {
    let response;

    if (id === "all" || !id) {
      // Get all admins across all organizations
      response = await axiosInstance.get(`/admin`);
      console.log("API response for all admins:", response.data);
    } else {
      // Get admins for specific organization
      response = await axiosInstance.get(`/admin/${id}`);
      console.log(`API response for org ${id}:`, response.data);
    }

    const result = response.data.admins || response.data || [];
    console.log("Final result returned:", result);
    return result;
  } catch (error) {
    console.error("Error in getUsers:", error);
    throw error;
  }
};

// Get single user by ID
export const getUserById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/users/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create new admin/user
export const createUser = async (data) => {
  try {
    const response = await axiosInstance.post(`/admin/org-signup`, data);
    toast.success("Admin created successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to create admin");
    throw error;
  }
};

// Update user
export const updateUser = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/api/users/${id}`, data);
    toast.success("Admin updated successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to update admin");
    throw error;
  }
};

// Delete user
export const deleteUser = async (id) => {
  try {
    const response = await axiosInstance.delete(`/admin/${id}`);
    toast.success("Admin deleted successfully");
    return response;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to delete admin");
    throw error;
  }
};

// Toggle user status
export const toggleUserStatus = async (id, currentStatus) => {
  try {
    const response = await axiosInstance.patch(
      `/api/users/${id}/status`,
      { status: !currentStatus }
    );
    toast.success(`Admin ${!currentStatus ? "activated" : "deactivated"} successfully`);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to update status");
    throw error;
  }
};

// Create role with consistent response format
export const handleCreateRole = async (data, subdomain) => {
  try {
    const url = subdomain ? `/roles?subdomain=${subdomain}` : '/roles';
    const res = await axiosInstance.post(url, data);
    toast.success("Role created successfully");
    return res.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to create role");
    throw error;
  }
};

export const getRoles = async (subdomain) => {
  try {
    const url = subdomain ? `/roles?subdomain=${subdomain}` : '/roles';
    const res = await axiosInstance.get(url);
    return res.data;
  } catch (error) {
    throw error;
  }
};
