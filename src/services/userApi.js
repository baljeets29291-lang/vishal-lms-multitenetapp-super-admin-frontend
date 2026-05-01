import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_BACKEND_API;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// Get all users/admins
export const getUsers = async (id) => {
  try {
    let response;

    if (id === "all" || !id) {
      // Get all admins across all organizations
      response = await axios.get(`${API_URL}/admin`, getAuthHeaders());
      console.log("API response for all admins:", response.data);
    } else {
      // Get admins for specific organization
      response = await axios.get(`${API_URL}/admin/${id}`, getAuthHeaders());
      console.log(`API response for org ${id}:`, response.data);
    }

    const result = response.data.admins || response.data || [];
    console.log("Final result returned:", result);
    return result;
  } catch (error) {
    console.error("Error in getUsers:", error);
    toast.error(error.response?.data?.message || "Failed to fetch users");
    throw error;
  }
};

// Get single user by ID
export const getUserById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/users/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to fetch user");
    throw error;
  }
};

// Create new admin/user
export const createUser = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/admin/org-signup`, data, getAuthHeaders());
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
    const response = await axios.put(`${API_URL}/api/users/${id}`, data, getAuthHeaders());
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
    await axios.delete(`${API_URL}/admin/${id}`, getAuthHeaders());
    toast.success("Admin deleted successfully");
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to delete admin");
    throw error;
  }
};

// Toggle user status
export const toggleUserStatus = async (id, currentStatus) => {
  try {
    const response = await axios.patch(
      `${API_URL}/api/users/${id}/status`,
      { status: !currentStatus },
      getAuthHeaders()
    );
    toast.success(`Admin ${!currentStatus ? "activated" : "deactivated"} successfully`);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to update status");
    throw error;
  }
};

// Create role with consistent response format
export const handleCreateRole = async (data) => {
  try {
    const res = await axios.post(`${API_URL}/roles`, data,{
      headers :{
        "Content-Type": "application/json",
      }
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const getRoles = async () => {
  try {
    const res = await axios.get(`${API_URL}/roles`, getAuthHeaders());
    return res.data;
  } catch (error) {
    throw error;
  }
};
