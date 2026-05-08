import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrganization, handleImportDataBase } from "../services/organizationApi";
import { Building2, ArrowLeft, Loader2, Database, Globe } from "lucide-react";

const CreateOrganization = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    subdomain: "", // optional - replaces 'code'
    db_name: "",   // optional
    db_url: "",    // optional
    status: true,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Only send fields that have values
      const payload = {
        name: form.name,
        status: form.status,
      };

      // Add optional fields only if they have values
      if (form.subdomain.trim()) payload.subdomain = form.subdomain;
      if (form.db_name.trim()) payload.db_name = form.db_name;
      if (form.db_url.trim()) payload.db_url = form.db_url;

      
      // Create organization first
      const orgResponse = await createOrganization(payload);

      // Wait for a brief moment before calling handleImportDataBase
      setTimeout(async () => {
        try {
          const subdomain = orgResponse?.data?.subdomain || form.subdomain;
          console.log("Starting database import for subdomain:", subdomain);
          await handleImportDataBase({ subdomain });
          console.log("Database import completed successfully");
        } catch (importError) {
          console.error("Error importing database:", importError);



        }
      }, 2000); // Wait 2 seconds before calling the import function

      setForm({
        name: "",
        subdomain: "",
        db_name: "",
        db_url: "",
        status: true,
      });
      navigate("/organizations");
    } catch (err) {
      console.error("Error creating organization:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/organizations")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Organizations
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Organization</h1>
        </div>
        <p className="text-gray-500 ml-11">
          Add a new organization to your multi-tenant LMS
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6"
      >
        {/* Name - Required */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            placeholder="Enter organization name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Subdomain - Optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-500" />
              Subdomain
            </span>
            <span className="text-gray-400 font-normal ml-6 text-xs">
              (Optional - used for subdomain/unique identifier)
            </span>
          </label>
          <input
            type="text"
            name="subdomain"
            placeholder="e.g., acme-corp"
            value={form.subdomain}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Database Name - Optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="flex items-center gap-2">
              <Database className="w-4 h-4 text-gray-500" />
              Database Name
            </span>
            <span className="text-gray-400 font-normal ml-6 text-xs">
              (Optional - custom database name for this organization)
            </span>
          </label>
          <input
            type="text"
            name="db_name"
            placeholder="e.g., org_acme_db"
            value={form.db_name}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Database URL - Optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="flex items-center gap-2">
              <Database className="w-4 h-4 text-gray-500" />
              Database URL
            </span>
            <span className="text-gray-400 font-normal ml-6 text-xs">
              (Optional - custom database connection URL)
            </span>
          </label>
          <input
            type="text"
            name="db_url"
            placeholder="e.g., postgresql://localhost:5432/org_acme_db"
            value={form.db_url}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">
            Format: postgresql://username:password@host:port/database
          </p>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="status"
            name="status"
            checked={form.status}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="status" className="text-sm font-medium text-gray-700">
            Active Organization
          </label>
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
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Organization"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrganization;