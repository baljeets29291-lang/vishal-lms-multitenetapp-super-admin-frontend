import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
  Globe,
  Database,
  Shield,
} from "lucide-react";
import {
  getOrganizations,
  updateOrganization,
  deleteOrganization,
  toggleOrganizationStatus,
} from "../services/organizationApi";


const ViewOrganization = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const itemsPerPage = 10;

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    subdomain: "",
    db_name: "",
    db_url: "",
    status: true,
  });

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingOrg, setDeletingOrg] = useState(null);

  // Fetch organizations
  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrganizations();

      // Ensure data is always an array
      let organizationsArray = [];
      if (Array.isArray(data)) {
        organizationsArray = data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.data)) {
          organizationsArray = data.data;
        } else if (Array.isArray(data.organizations)) {
          organizationsArray = data.organizations;
        } else if (data.id || data.name) {
          organizationsArray = [data];
        } else {
          console.error("Unexpected API response format:", data);
          setError("Invalid data format received from server");
          organizationsArray = [];
        }
      }

      // Normalize status to boolean
      organizationsArray = organizationsArray.map(org => ({
        ...org,
        status: org.status === "active" || org.status === true
      }));

      setOrganizations(organizationsArray);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      setError(error.message || "Failed to load organizations");
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Safely filter organizations
  const filteredOrganizations = Array.isArray(organizations) ? organizations.filter((org) => {
    const matchesSearch =
      org.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.subdomain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.db_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.db_url?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "active"
          ? org.status === true
          : org.status === false;

    return matchesSearch && matchesStatus;
  }) : [];

  // Pagination
  const totalPages = Math.ceil(filteredOrganizations.length / itemsPerPage);
  const paginatedOrganizations = filteredOrganizations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "-";
    }
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "";
    }
  };

  // Open Edit Modal
  const openEditModal = (org) => {
    setEditingOrg(org);
    setEditForm({
      name: org.name || "",
      subdomain: org.subdomain || "",
      db_name: org.db_name || "",
      db_url: org.db_url || "",
      status: org.status ?? true,
    });
    setIsEditModalOpen(true);
  };

  // Close Edit Modal
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingOrg(null);
    setEditForm({ name: "", subdomain: "", db_name: "", db_url: "", status: true });
  };

  // Handle Edit Form Change
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle Update
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingOrg) return;

    setActionLoading(editingOrg.id);
    try {
      const payload = {
        name: editForm.name,
        status: editForm.status ? "active" : "inactive",
      };

      if (editForm.subdomain?.trim()) payload.subdomain = editForm.subdomain;
      if (editForm.db_name?.trim()) payload.db_name = editForm.db_name;
      if (editForm.db_url?.trim()) payload.db_url = editForm.db_url;

      await updateOrganization(editingOrg.id, payload);
      await fetchOrganizations();
      closeEditModal();
    } catch (error) {
      console.error("Error updating organization:", error);
      alert("Failed to update organization. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  // Open Delete Modal
  const openDeleteModal = (org) => {
    setDeletingOrg(org);
    setIsDeleteModalOpen(true);
  };

  // Close Delete Modal
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingOrg(null);
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!deletingOrg) return;

    setActionLoading(deletingOrg.id);
    try {
      await deleteOrganization(deletingOrg.id);
      await fetchOrganizations();
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting organization:", error);
      alert("Failed to delete organization. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Status Toggle - FIXED: Send the NEW status, not the current one
  const handleStatusToggle = async (org) => {
    setActionLoading(`status-${org.id}`);
    try {
      // Calculate the NEW status (opposite of current)
      const newStatusValue = !org.status;
      // Convert to string format that API expects
      const newStatusString = newStatusValue ? "active" : "inactive";

      console.log(`Toggling status for ${org.name}:`, {
        currentStatus: org.status,
        newStatus: newStatusValue,
        sendingToAPI: newStatusString
      });

      // Send the NEW status to the API
      await toggleOrganizationStatus(org.id, newStatusString);

      // Refresh the list to show updated status
      await fetchOrganizations();
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  // Calculate stats safely
  const totalOrganizations = Array.isArray(organizations) ? organizations.length : 0;
  const activeOrganizations = Array.isArray(organizations) ? organizations.filter((o) => o.status === true).length : 0;
  const inactiveOrganizations = Array.isArray(organizations) ? organizations.filter((o) => o.status === false).length : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
        </div>
        <p className="text-gray-500 ml-11">
          Manage your organizations, view details, and configure settings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Organizations</p>
              <p className="text-2xl font-bold text-gray-900">{totalOrganizations}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-green-600">{activeOrganizations}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Inactive</p>
              <p className="text-2xl font-bold text-red-600">{inactiveOrganizations}</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, subdomain, or database..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {/* Add Button */}
          <Link
            to="/create-org"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Organization
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-500">Loading organizations...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Organizations</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchOrganizations}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Loader2 className="w-4 h-4" />
              Try Again
            </button>
          </div>
        ) : filteredOrganizations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No organizations found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by creating your first organization"}
            </p>
            {(!searchQuery && filterStatus === "all") && (
              <Link
                to="/create-org"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Organization
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Organization</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subdomain</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Database</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedOrganizations.map((org) => (
                    <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {org.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{org.name || "Unnamed"}</p>
                            <p className="text-xs text-gray-500">ID: {org.id?.slice(0, 8) || "N/A"}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {org.subdomain ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <Globe className="w-3 h-3" />
                            {org.subdomain}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {org.db_name && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <Database className="w-3 h-3" />
                              <span>{org.db_name}</span>
                            </div>
                          )}
                          {org.db_url && (
                            <div className="text-xs text-gray-400 truncate max-w-[200px]">{org.db_url}</div>
                          )}
                          {!org.db_name && !org.db_url && <span className="text-gray-400 text-sm">-</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${org.status === true ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                          {org.status === true ? (
                            <><CheckCircle2 className="w-3.5 h-3.5" /> Active</>
                          ) : (
                            <><XCircle className="w-3.5 h-3.5" /> Inactive</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {formatDate(org.createdAt)}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {formatTime(org.createdAt)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Status Toggle Button */}
                          <button
                            onClick={() => handleStatusToggle(org)}
                            disabled={actionLoading === `status-${org.id}`}
                            className={`p-2 rounded-lg transition-colors ${org.status === true
                              ? "bg-green-100 text-green-600 hover:bg-green-200"
                              : "bg-red-100 text-red-600 hover:bg-red-200"
                              } disabled:opacity-50`}
                            title={org.status === true ? "Deactivate" : "Activate"}
                          >
                            {actionLoading === `status-${org.id}` ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : org.status === true ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => openEditModal(org)}
                            disabled={actionLoading === org.id}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => openDeleteModal(org)}
                            disabled={actionLoading === org.id}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredOrganizations.length)} of {filteredOrganizations.length} results
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Edit2 className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Edit Organization</h2>
              </div>
              <button onClick={closeEditModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  required
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    Subdomain
                  </span>
                  <span className="text-gray-400 font-normal ml-6 text-xs">(Optional - unique identifier)</span>
                </label>
                <input
                  type="text"
                  name="subdomain"
                  placeholder="e.g., acme-corp"
                  value={editForm.subdomain}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-gray-500" />
                    Database Name
                  </span>
                  <span className="text-gray-400 font-normal ml-6 text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="db_name"
                  placeholder="e.g., org_acme_db"
                  value={editForm.db_name}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-gray-500" />
                    Database URL
                  </span>
                  <span className="text-gray-400 font-normal ml-6 text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="db_url"
                  placeholder="postgresql://localhost:5432/org_acme_db"
                  value={editForm.db_url}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="editStatus"
                  name="status"
                  checked={editForm.status}
                  onChange={handleEditChange}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="editStatus" className="text-sm font-medium text-gray-700">Active Organization</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === editingOrg?.id}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {actionLoading === editingOrg?.id ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Delete Organization</h2>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-medium text-gray-700">{deletingOrg?.name}</span>? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading === deletingOrg?.id}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {actionLoading === deletingOrg?.id ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewOrganization;