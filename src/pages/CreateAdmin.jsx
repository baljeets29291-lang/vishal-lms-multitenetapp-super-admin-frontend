import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../services/userApi";
import { getOrganizations } from "../services/organizationApi";
import { UserPlus, ArrowLeft, Loader2, Building2, Shield } from "lucide-react";

const CreateAdmin = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingOrgs, setFetchingOrgs] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationId: "",
    role: "admin",
    status: true,
  });

  const [errors, setErrors] = useState({});

  // Fetch organizations for dropdown
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const data = await getOrganizations();

        // Ensure data is always an array - matching ViewOrganization logic
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
            organizationsArray = [];
          }
        }

        setOrganizations(organizationsArray);

        // Set first organization as default if available
        if (organizationsArray.length > 0) {
          setForm((prev) => ({ ...prev, organizationId: organizationsArray[0].id }));
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
        setOrganizations([]);
      } finally {
        setFetchingOrgs(false);
      }
    };
    fetchOrgs();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!form.organizationId) {
      newErrors.organizationId = "Please select an organization";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { confirmPassword, ...submitData } = form;
      await createUser(submitData);
      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        organizationId: organizations[0]?.id || "",
        role: "admin",
        status: true,
      });
      navigate("/");
    } catch (err) {
      console.error("Error creating admin:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/admins")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admins
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <UserPlus className="w-6 h-6 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Admin</h1>
        </div>
        <p className="text-gray-500 ml-11">
          Add a new admin user and assign to an organization
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6"
      >
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            placeholder="Enter admin name"
            value={form.name}
            onChange={handleChange}
            className={`w-full border px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.name ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            placeholder="Enter email address"
            value={form.email}
            onChange={handleChange}
            className={`w-full border px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.email ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              className={`w-full border px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.password ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={handleChange}
              className={`w-full border px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>
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
                  {org.name} ({org.code})
                </option>
              ))
            )}
          </select>
         
          {!fetchingOrgs && organizations.length === 0 && (
            <p className="mt-2 text-sm text-amber-600">
              Please create an organization first before adding admins.
            </p>
          )}
        </div>

       
        {/* Status */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="status"
            name="status"
            checked={form.status}
            onChange={handleChange}
            className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="status" className="text-sm font-medium text-gray-700">
            Active Account
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate("/admins")}
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
              "Create Admin"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAdmin;
