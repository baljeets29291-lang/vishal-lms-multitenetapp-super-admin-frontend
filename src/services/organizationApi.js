import axios from "axios";
import { toast } from "react-toastify";
import { createUser } from "./userApi";

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
    console.error("API Error:", error);

    if (error.response?.status === 401) {
      toast.error("Session expired. Please log in again.");
    } else {
      toast.error(error.response?.data?.message || "Failed to fetch organizations");
    }
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

// Create superadmin for organization
export const createSuperAdminForOrganization = async (organizationData, adminData) => {
  try {
    // Create organization first
    const orgResponse = await createOrganization(organizationData);
    const organizationId = orgResponse.data?.id || orgResponse.id;

    if (!organizationId) {
      throw new Error('Organization ID not found in response');
    }

    // Create superadmin for the organization
    const superAdminData = {
      ...adminData,
      organizationId: organizationId,
      role: 'superadmin',
      status: true
    };

    const adminResponse = await createUser(superAdminData);

    toast.success('Organization and Super Admin created successfully');
    return {
      organization: orgResponse,
      superAdmin: adminResponse
    };
  } catch (error) {
    console.error('Error creating organization and superadmin:', error);
    toast.error(error.response?.data?.message || 'Failed to create organization and superadmin');
    throw error;
  }
};

export const handleImportDataBase = async (data) => {
  console.log("Importing database for:", data);
  console.log("API URL:", API_URL);
  console.log("Full endpoint:", `${API_URL}/database/seed-permissions`);

  try {
    const res = await axios.post(`${API_URL}/database/seed-permissions`, data, getAuthHeaders());

    console.log("Database import response:", res.data);

    // Show success message
    toast.success("Database permissions imported successfully");
    return res.data;
  } catch (error) {
    console.error("Error importing database:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);

    const errorMessage = error.response?.data?.message || error.message || "Failed to import database permissions";
    toast.error(errorMessage);
    throw error;
  }
};
