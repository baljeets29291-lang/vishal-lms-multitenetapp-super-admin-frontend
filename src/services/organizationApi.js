import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_BACKEND_API;
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Get all organizations
export const getOrganizations = async () => {
  try {
    const response = await axios.get(`${API_URL}/organizations`, getAuthHeaders());
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to fetch organizations");
    throw error;
  }
};

// Get single organization by ID
export const getOrganizationById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/organizations/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to fetch organization");
    throw error;
  }
};

// Create new organization
export const createOrganization = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/organizations`, data, getAuthHeaders());
    toast.success("Organization created successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to create organization");
    throw error;
  }
};

// Update organization
export const updateOrganization = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/organizations/${id}`, data, getAuthHeaders());
    toast.success("Organization updated successfully");
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to update organization");
    throw error;
  }
};

// Delete organization
export const deleteOrganization = async (id) => {
  try {
    await axios.delete(`${API_URL}/organizations/${id}`, getAuthHeaders());
    toast.success("Organization deleted successfully");
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to delete organization");
    throw error;
  }
};

// Toggle organization status
export const toggleOrganizationStatus = async (id, currentStatus) => {
  try {
    const response = await axios.put(
      `${API_URL}/organizations/${id}/status`,
      { status: !currentStatus },
      getAuthHeaders()
    );
    toast.success(`Organization ${!currentStatus ? "activated" : "deactivated"} successfully`);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to update status");
    throw error;
  }
};


export const handleImportDataBase = async (data) => {
  console.log("Importing database for:", data);

  try {
    const res = await axios.post(`${API_URL}/database/seed/permissions`, data, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    return res.data;
  } catch (error) {
    console.error("Error importing database:", error);
    throw error;
  }
}
