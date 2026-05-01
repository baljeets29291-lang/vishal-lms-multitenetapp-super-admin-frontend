import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
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
  Building2,
  Shield,
} from "lucide-react";
import {
  getUsers,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from "../services/userApi";
import { getOrganizations } from "../services/organizationApi";

const ViewAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrganization, setSelectedOrganization] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const itemsPerPage = 10;

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    organizationId: "",
    role: "admin",
    status: true,
  });

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAdmin, setDeletingAdmin] = useState(null);

  // Fetch organizations
  const fetchOrganizations = async () => {
    try {
      const orgsData = await getOrganizations();
      setOrganizations(Array.isArray(orgsData) ? orgsData : []);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      setOrganizations([]);
    }
  };

  // Fetch admins based on selected organization
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await getUsers(selectedOrganization);
      console.log(response, "API Response");
      
      // Handle different response structures
      let usersArray = [];
      
      // Check if response has an 'admins' property (as shown in your data)
      if (response && response.admins && Array.isArray(response.admins)) {
        usersArray = response.admins;
      } 
      // Check if response is directly an array
      else if (Array.isArray(response)) {
        usersArray = response;
      }
      // Check if response has a 'users' property
      else if (response && response.users && Array.isArray(response.users)) {
        usersArray = response.users;
      }
      // Check if response has a 'data' property
      else if (response && response.data && Array.isArray(response.data)) {
        usersArray = response.data;
      }
      else {
        console.warn("Unexpected response format:", response);
        usersArray = [];
      }
      
      // Map the response data to match your component's expected structure
      // Based on your data: id, name, email, organizationId, status, roleName, roleId, etc.
      const mappedAdmins = usersArray.map(admin => ({
        id: admin.id,
        name: admin.name || "",
        email: admin.email || "",
        organizationId: admin.organizationId || "",
        status: admin.status === true || admin.status === "active",
        role: admin.roleName || admin.role || "admin", // Use roleName from your data
        roleId: admin.roleId,
        phone: admin.phone,
        image: admin.image,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      }));
      
      // Filter only admin roles (excluding superadmin if needed)
      let adminUsers = mappedAdmins.filter((u) =>
        ["admin", "superadmin", "manager", "tenant_admin"].includes(u.role?.toLowerCase())
      );
      
      // Filter by selected organization if not "all"
      if (selectedOrganization !== "all") {
        adminUsers = adminUsers.filter(
          (u) => u.organizationId === selectedOrganization
        );
      }
      
      console.log("Processed admins:", adminUsers);
      setAdmins(adminUsers);
      
    } catch (error) {
      console.error("Error fetching admins:", error);
      setAdmins([]);
      // Optionally show error toast/notification
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      await fetchOrganizations();
      await fetchAdmins();
    };
    loadData();
  }, []);

  // Fetch admins when selected organization changes
  useEffect(() => {
    if (organizations.length > 0 || selectedOrganization === "all") {
      fetchAdmins();
    }
  }, [selectedOrganization]);

  // Get organization name by ID
  const getOrgName = (orgId) => {
    if (!orgId) return "No Organization";
    const org = organizations.find((o) => o.id === orgId);
    return org ? org.name : "Unknown Organization";
  };

  // Filter admins based on search and status
  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.role?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "active"
        ? admin.status === true
        : admin.status === false;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const paginatedAdmins = filteredAdmins.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, selectedOrganization]);

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
  const openEditModal = (admin) => {
    setEditingAdmin(admin);
    setEditForm({
      name: admin.name || "",
      email: admin.email || "",
      organizationId: admin.organizationId || "",
      role: admin.role || "admin",
      status: admin.status ?? true,
    });
    setIsEditModalOpen(true);
  };

  // Close Edit Modal
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingAdmin(null);
    setEditForm({
      name: "",
      email: "",
      organizationId: "",
      role: "admin",
      status: true,
    });
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
    if (!editingAdmin) return;

    setActionLoading(editingAdmin.id);
    try {
      await updateUser(editingAdmin.id, editForm);
      await fetchAdmins();
      closeEditModal();
    } catch (error) {
      console.error("Error updating admin:", error);
      alert("Failed to update admin. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  // Open Delete Modal
  const openDeleteModal = (admin) => {
    setDeletingAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  // Close Delete Modal
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingAdmin(null);
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!deletingAdmin) return;

    setActionLoading(deletingAdmin.id);
    try {
      await deleteUser(deletingAdmin.id);
      await fetchAdmins();
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting admin:", error);
      alert("Failed to delete admin. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Status Toggle
  const handleStatusToggle = async (admin) => {
    setActionLoading(`status-${admin.id}`);
    try {
      // Convert status to the format expected by API
      const newStatus = admin.status === true ? "inactive" : "active";
      await toggleUserStatus(admin.id, admin.status);
      await fetchAdmins();
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadgeColor = (role) => {
    const roleLower = role?.toLowerCase();
    switch (roleLower) {
      case "superadmin":
        return "bg-purple-100 text-purple-700";
      case "admin":
        return "bg-blue-100 text-blue-700";
      case "manager":
        return "bg-amber-100 text-amber-700";
      case "tenant_admin":
        return "bg-indigo-100 text-indigo-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRoleDisplayName = (role) => {
    const roleLower = role?.toLowerCase();
    switch (roleLower) {
      case "superadmin":
        return "Super Admin";
      case "admin":
        return "Admin";
      case "manager":
        return "Manager";
      case "tenant_admin":
        return "Tenant Admin";
      default:
        return role || "Admin";
    }
  };

  // Calculate stats
  const totalAdmins = admins.length;
  const activeAdmins = admins.filter((a) => a.status === true).length;
  const inactiveAdmins = admins.filter((a) => a.status === false).length;
  const superAdmins = admins.filter((a) => a.role?.toLowerCase() === "superadmin").length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Admins</h1>
        </div>
        <p className="text-gray-500 ml-11">
          Manage admin users and their organization assignments
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Admins</p>
              <p className="text-2xl font-bold text-gray-900">{totalAdmins}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {activeAdmins}
              </p>
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
              <p className="text-2xl font-bold text-red-600">
                {inactiveAdmins}
              </p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Super Admins</p>
              <p className="text-2xl font-bold text-purple-600">
                {superAdmins}
              </p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Organization Selection Dropdown */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-200 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-700">Select Organization:</span>
          </div>
          <select
            value={selectedOrganization}
            onChange={(e) => setSelectedOrganization(e.target.value)}
            className="flex-1 max-w-md px-4 py-2.5 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
          >
            <option value="all">All Organizations</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
          {selectedOrganization !== "all" && (
            <div className="text-sm text-gray-600">
              Showing admins for: <span className="font-semibold text-purple-700">
                {organizations.find(o => o.id === selectedOrganization)?.name || "Selected Organization"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Add Button */}
          <Link
            to="/create-admin"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Admin
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-500">Loading admins...</p>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No admins found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || filterStatus !== "all" || selectedOrganization !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by creating your first admin"}
            </p>
            {!searchQuery && filterStatus === "all" && selectedOrganization === "all" && (
              <Link
                to="/create-admin"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Admin
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedAdmins.map((admin) => (
                    <tr
                      key={admin.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {admin.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {admin.name || "Unnamed"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {admin.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                            admin.role
                          )}`}
                        >
                          <Shield className="w-3 h-3" />
                          {getRoleDisplayName(admin.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {getOrgName(admin.organizationId)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                            admin.status === true
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {admin.status === true ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              Inactive
                            </>
                          )}
                        </span>
                       </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {formatDate(admin.createdAt)}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {formatTime(admin.createdAt)}
                          </div>
                        </div>
                       </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Status Toggle */}
                          <button
                            onClick={() => handleStatusToggle(admin)}
                            disabled={actionLoading === `status-${admin.id}`}
                            className={`p-2 rounded-lg transition-colors ${
                              admin.status === true
                                ? "bg-green-100 text-green-600 hover:bg-green-200"
                                : "bg-red-100 text-red-600 hover:bg-red-200"
                            } disabled:opacity-50`}
                            title={admin.status === true ? "Deactivate" : "Activate"}
                          >
                            {actionLoading === `status-${admin.id}` ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : admin.status === true ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => openEditModal(admin)}
                            disabled={actionLoading === admin.id}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => openDeleteModal(admin)}
                            disabled={actionLoading === admin.id}
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
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredAdmins.length
                  )}{" "}
                  of {filteredAdmins.length} results
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
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
                <h2 className="text-xl font-semibold text-gray-900">Edit Admin</h2>
              </div>
              <button
                onClick={closeEditModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
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
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  required
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Organization <span className="text-red-500">*</span>
                  </span>
                </label>
                <select
                  name="organizationId"
                  value={editForm.organizationId}
                  onChange={handleEditChange}
                  required
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Organization</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Role
                  </span>
                </label>
                <select
                  name="role"
                  value={editForm.role}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                  <option value="manager">Manager</option>
                  <option value="tenant_admin">Tenant Admin</option>
                </select>
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
                <label htmlFor="editStatus" className="text-sm font-medium text-gray-700">
                  Active Account
                </label>
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
                  disabled={actionLoading === editingAdmin?.id}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {actionLoading === editingAdmin?.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Delete Admin
              </h2>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-medium text-gray-700">
                  {deletingAdmin?.name}
                </span>
                ? This action cannot be undone.
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
                  disabled={actionLoading === deletingAdmin?.id}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {actionLoading === deletingAdmin?.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
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

export default ViewAdmins;