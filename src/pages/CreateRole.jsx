import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ArrowLeft, Loader2, Building2, ChevronDown, ChevronUp, Users, BookOpen, Video, FileText, HelpCircle, DollarSign, Bell, Settings, Eye, List } from "lucide-react";
import { getRoles, handleCreateRole } from "../services/userApi";
import { getOrganizations } from "../services/organizationApi";

// Permission groups (same as in CreateAdmin)
const permissionGroups = [
    {
        name: 'Admin',
        icon: Shield,
        permissions: [
            { id: 1, name: 'admin-menu' },
            { id: 71, name: 'create-role' },
            { id: 72, name: 'edit-role' },
            { id: 73, name: 'delete-role' },
            { id: 74, name: 'create-admin' },
            { id: 75, name: 'edit-admin' },
            { id: 76, name: 'delete-admin' }
        ]
    },
    {
        name: 'Content',
        icon: BookOpen,
        permissions: [
            { id: 2, name: 'content-menu' },
            { id: 3, name: 'create-folder' },
            { id: 4, name: 'import-video' },
            { id: 5, name: 'import-pdf' },
            { id: 6, name: 'import-test' },
            { id: 175, name: 'add-category' }
        ]
    },
    {
        name: 'User Management',
        icon: Users,
        permissions: [
            { id: 7, name: 'users-menu' },
            { id: 8, name: 'users-list' },
            { id: 9, name: 'login-analytics' },
            { id: 10, name: 'send-notification' },
            { id: 11, name: 'course-notifications' },
            { id: 135, name: 'in-app-notifications' },
            { id: 139, name: 'notification-history' },
            { id: 171, name: 'add-in-app-notification' },
            { id: 172, name: 'edit-in-app-notification' },
            { id: 173, name: 'delete-in-app-notification' },
            { id: 174, name: 'view-in-app-notification' },
            { id: 191, name: 'edit-user' }
        ]
    },
    {
        name: 'Banner',
        icon: Settings,
        permissions: [
            { id: 18, name: 'banner-menu' },
            { id: 19, name: 'banner-list' },
            { id: 20, name: 'add-banner' },
            { id: 21, name: 'delete-banner' },
            { id: 22, name: 'publish-unpublish-banner' },
            { id: 121, name: 'news-banner' },
            { id: 176, name: 'view-banner' }
        ]
    },
    {
        name: 'Stream',
        icon: Video,
        permissions: [
            { id: 23, name: 'stream-menu' },
            { id: 24, name: 'add-stream' },
            { id: 25, name: 'view-stream' },
            { id: 26, name: 'edit-stream' },
            { id: 27, name: 'delete-stream' }
        ]
    },
    {
        name: 'Course',
        icon: BookOpen,
        permissions: [
            { id: 34, name: 'course-menu' },
            { id: 35, name: 'add-course' },
            { id: 36, name: 'view-course' },
            { id: 37, name: 'edit-course' },
            { id: 38, name: 'publish-unpublish-course' },
            { id: 39, name: 'delete-course' }
        ]
    },
    {
        name: 'Payment',
        icon: DollarSign,
        permissions: [
            { id: 160, name: 'payment-menu' },
            { id: 163, name: 'export-payment-data' },
            { id: 197, name: 'payment-analytics-view' }
        ]
    },
    {
        name: 'Notifications',
        icon: Bell,
        permissions: [
            { id: 10, name: 'send-notification' },
            { id: 11, name: 'course-notifications' },
            { id: 135, name: 'in-app-notifications' }
        ]
    },
    {
        name: 'Support',
        icon: HelpCircle,
        permissions: [
            { id: 77, name: 'other-menu' },
            { id: 108, name: 'ticket' },
            { id: 109, name: 'ticket-status' },
            { id: 110, name: 'view-ticket' },
            { id: 190, name: 'course-doubt' }
        ]
    }
];

const CreateRole = () => {
    const navigate = useNavigate();
    const [organizations, setOrganizations] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingOrgs, setFetchingOrgs] = useState(true);
    const [fetchingRoles, setFetchingRoles] = useState(false);
    const [showRoleCount, setShowRoleCount] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState(new Set(['Admin', 'Content']));

    const [form, setForm] = useState({
        name: "",
        description: "",
        organizationId: "",
    });

    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [errors, setErrors] = useState({});

    // Fetch roles for the selected organization
    const fetchRoles = async (organizationId) => {
        if (!organizationId || organizationId === "") return;
        
        setFetchingRoles(true);
        try {
            // Get the selected organization
            const selectedOrg = organizations.find(org => org.id === organizationId);
            
            if (!selectedOrg) {
                console.error("Selected organization not found");
                return;
            }
            
            // Check if organization has subdomain
            if (!selectedOrg.subdomain || selectedOrg.subdomain.trim() === "") {
                console.warn(`Organization "${selectedOrg.name}" does not have a subdomain configured`);
                return;
            }
            
            const data = await getRoles(selectedOrg.subdomain);
            console.log("Fetched roles:", data);
            
            // Handle different response formats
            let rolesArray = [];
            if (data && data.roles && Array.isArray(data.roles)) {
                rolesArray = data.roles;
            } else if (Array.isArray(data)) {
                rolesArray = data;
            } else if (data && data.data && Array.isArray(data.data)) {
                rolesArray = data.data;
            }
            
            setRoles(rolesArray);
            return rolesArray;
        } catch (error) {
            console.error("Error fetching roles:", error);
            setRoles([]);
            return [];
        } finally {
            setFetchingRoles(false);
        }
    };

    // Fetch organizations for dropdown
    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                const data = await getOrganizations();
                setOrganizations(data);
                // Set first organization as default if available
                if (data && data.length > 0) {
                    setForm((prev) => ({ ...prev, organizationId: data[0].id }));
                    // Fetch roles for the default organization
                    await fetchRoles(data[0].id);
                }
            } catch (error) {
                console.error("Error fetching organizations:", error);
            } finally {
                setFetchingOrgs(false);
            }
        };
        fetchOrgs();
    }, []);

    // Fetch roles when organization changes
    useEffect(() => {
        if (form.organizationId && organizations.length > 0) {
            fetchRoles(form.organizationId);
        }
    }, [form.organizationId, organizations]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: value,
        });
        // Clear error when field is edited
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    const handlePermissionToggle = (permissionId) => {
        setSelectedPermissions(prev =>
            prev.includes(permissionId)
                ? prev.filter(id => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const handleGroupToggle = (groupId) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(groupId)) {
                newSet.delete(groupId);
            } else {
                newSet.add(groupId);
            }
            return newSet;
        });
    };

    const handleSelectAllInGroup = (group) => {
        const groupPermissionIds = group.permissions.map(p => p.id);
        setSelectedPermissions(prev => {
            const allSelected = groupPermissionIds.every(id => prev.includes(id));
            if (allSelected) {
                return prev.filter(id => !groupPermissionIds.includes(id));
            } else {
                return [...new Set([...prev, ...groupPermissionIds])];
            }
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!form.name.trim()) {
            newErrors.name = "Role name is required";
        }

        if (!form.organizationId) {
            newErrors.organizationId = "Please select an organization";
        }

        if (selectedPermissions.length === 0) {
            newErrors.permissions = "At least one permission must be selected";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            // Get the selected organization
            const selectedOrg = organizations.find(org => org.id === form.organizationId);

            if (!selectedOrg) {
                throw new Error("Selected organization not found");
            }

            // Check if organization has subdomain
            if (!selectedOrg.subdomain || selectedOrg.subdomain.trim() === "") {
                throw new Error(`Organization "${selectedOrg.name}" does not have a subdomain configured. Please set a subdomain for this organization before creating roles.`);
            }

            const roleData = {
                name: form.name,
                description: form.description,
                organizationId: form.organizationId,
                permissionIds: selectedPermissions
            };

            const response = await handleCreateRole(roleData, selectedOrg.subdomain);

            if (response.success) {
                // Show success message with role count
                const updatedRoles = await fetchRoles(form.organizationId);
                const roleCount = updatedRoles ? updatedRoles.length : roles.length + 1;
                
                alert(`✅ Role "${form.name}" created successfully!\n\nYou now have ${roleCount} role${roleCount !== 1 ? 's' : ''} in ${selectedOrg.name}.`);
                
                // Reset form
                setForm({
                    name: "",
                    description: "",
                    organizationId: form.organizationId,
                });
                setSelectedPermissions([]);
                
                // Optional: Navigate back after 2 seconds
                setTimeout(() => {
                    navigate("/organizations");
                }, 2000);
            } else {
                throw new Error(response.message || "Failed to create role");
            }
        } catch (err) {
            setErrors({ submit: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleShowRoles = async () => {
        if (!form.organizationId) {
            alert("Please select an organization first");
            return;
        }
        
        setShowRoleCount(true);
        const fetchedRoles = await fetchRoles(form.organizationId);
        const selectedOrg = organizations.find(org => org.id === form.organizationId);
        
        setTimeout(() => {
            setShowRoleCount(false);
        }, 5000);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate("/organizations")}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Organizations
                </button>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Shield className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Create Role</h1>
                            <p className="text-gray-500">
                                Create a new role with specific permissions for an organization
                            </p>
                        </div>
                    </div>
                    
                    {/* Show Roles Button */}
                    <button
                        type="button"
                        onClick={handleShowRoles}
                        disabled={fetchingRoles || !form.organizationId}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        <List className="w-4 h-4" />
                        {fetchingRoles ? "Loading..." : "View Roles"}
                    </button>
                </div>
            </div>

            {/* Role Count Display Modal */}
            {showRoleCount && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-in fade-in zoom-in duration-200">
                        <div className="p-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Shield className="w-8 h-8 text-purple-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Roles Overview
                                </h2>
                                <div className="mb-6">
                                    <div className="text-5xl font-bold text-purple-600 mb-2">
                                        {roles.length}
                                    </div>
                                    <p className="text-gray-600">
                                        Role{roles.length !== 1 ? 's' : ''} in {organizations.find(o => o.id === form.organizationId)?.name || "this organization"}
                                    </p>
                                </div>
                                
                                {roles.length > 0 && (
                                    <div className="border-t border-gray-200 pt-4 mt-4">
                                        <p className="text-sm font-medium text-gray-700 mb-2">
                                            Role List:
                                        </p>
                                        <div className="max-h-48 overflow-y-auto space-y-2">
                                            {roles.map((role, index) => (
                                                <div key={role.id || index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                                    <span className="font-medium">• {role.name || role.roleName}</span>
                                                    {role.description && (
                                                        <p className="text-xs text-gray-500 mt-1 ml-4">{role.description}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setShowRoleCount(false)}
                                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Display submit error */}
            {errors.submit && (
                <div className={`mb-6 p-4 border rounded-lg ${errors.submit.includes("Super admin cannot access")
                        ? "bg-amber-50 border-amber-200 text-amber-800"
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}>
                    <div className="flex items-start gap-3">
                        <div className={`mt-0.5 ${errors.submit.includes("Super admin cannot access") ? "text-amber-600" : "text-red-600"
                            }`}>
                            {errors.submit.includes("Super admin cannot access") ? "⚠️" : "❌"}
                        </div>
                        <div>
                            <p className="font-medium">{errors.submit}</p>
                            {errors.submit.includes("Super admin cannot access") && (
                                <p className="text-sm mt-2 opacity-90">
                                    To resolve this issue, either:
                                    <br />• Login with an organization admin account, or
                                    <br />• Access the system through the organization's subdomain
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6"
            >
                {/* Role Details */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Role Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter role name"
                            value={form.name}
                            onChange={handleChange}
                            className={`w-full border px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.name ? "border-red-500" : "border-gray-300"
                                }`}
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            placeholder="Describe the role's responsibilities and access level"
                            value={form.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full border px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent border-gray-300"
                        />
                    </div>

                    {/* Organization Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <span className="flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                Organization <span className="text-red-500">*</span>
                            </span>
                        </label>
                        <select
                            name="organizationId"
                            value={form.organizationId}
                            onChange={handleChange}
                            disabled={fetchingOrgs}
                            className={`w-full border px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.organizationId ? "border-red-500" : "border-gray-300"
                                } ${fetchingOrgs ? "bg-gray-100" : ""}`}
                        >
                            {fetchingOrgs ? (
                                <option>Loading organizations...</option>
                            ) : organizations.length === 0 ? (
                                <option value="">No organizations available</option>
                            ) : (
                                organizations.map((org) => (
                                    <option key={org.id} value={org.id}>
                                        {org.name} ({org.subdomain || org.code})
                                    </option>
                                ))
                            )}
                        </select>
                        {errors.organizationId && (
                            <p className="mt-1 text-sm text-red-500">{errors.organizationId}</p>
                        )}
                        {!fetchingOrgs && organizations.length === 0 && (
                            <p className="mt-2 text-sm text-amber-600">
                                Please create an organization first before adding roles.
                            </p>
                        )}
                    </div>

                    {/* Display current role count */}
                    {!fetchingRoles && roles.length > 0 && form.organizationId && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm text-blue-700">
                                        Current roles in this organization:
                                    </span>
                                </div>
                                <span className="font-bold text-blue-800">{roles.length}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Permissions */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Permissions <span className="text-red-500">*</span>
                            <span className="text-xs text-gray-500 ml-2">
                                ({selectedPermissions.length} selected)
                            </span>
                        </label>
                        <button
                            type="button"
                            onClick={() => setSelectedPermissions([])}
                            className="text-xs text-gray-500 hover:text-gray-700"
                        >
                            Clear All
                        </button>
                    </div>

                    {errors.permissions && (
                        <p className="mb-3 text-sm text-red-500">{errors.permissions}</p>
                    )}

                    <div className="space-y-3">
                        {permissionGroups.map((group) => {
                            const Icon = group.icon;
                            const isExpanded = expandedGroups.has(group.name);
                            const groupPermissionIds = group.permissions.map(p => p.id);
                            const allSelected = groupPermissionIds.every(id => selectedPermissions.includes(id));
                            const someSelected = groupPermissionIds.some(id => selectedPermissions.includes(id));

                            return (
                                <div key={group.name} className="border border-gray-200 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => handleGroupToggle(group.name)}
                                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="w-5 h-5 text-gray-600" />
                                            <span className="font-medium text-gray-900">{group.name}</span>
                                            <span className="text-xs text-gray-500">({group.permissions.length})</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelectAllInGroup(group);
                                                }}
                                                className={`text-xs px-2 py-1 rounded ${allSelected
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : someSelected
                                                            ? 'bg-purple-50 text-purple-600'
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}
                                            >
                                                {allSelected ? 'All' : someSelected ? 'Some' : 'None'}
                                            </button>
                                            {isExpanded ? (
                                                <ChevronUp className="w-4 h-4 text-gray-500" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-gray-500" />
                                            )}
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <div className="px-4 pb-3 border-t border-gray-100">
                                            <div className="grid grid-cols-2 gap-2 mt-3">
                                                {group.permissions.map((permission) => (
                                                    <label
                                                        key={permission.id}
                                                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedPermissions.includes(permission.id)}
                                                            onChange={() => handlePermissionToggle(permission.id)}
                                                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                        />
                                                        <span className="text-sm text-gray-700">{permission.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate("/organizations")}
                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || fetchingOrgs || organizations.length === 0}
                        className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Shield className="w-4 h-4" />
                                Create Role
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateRole;