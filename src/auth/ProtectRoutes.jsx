import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";

const ProtectRoutes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_BACKEND_API;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check authentication by fetching user profile with cookies
        const response = await axios.get(`${BASE_URL}/admin/profile`, {
          withCredentials: true,
        });

        // If profile fetch succeeds, user is authenticated
        setIsAuthenticated(true);
      } catch (error) {
        // If profile fetch fails, user is not authenticated
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // ❌ Not authenticated → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Authenticated → allow access
  return <Outlet />;
};

export default ProtectRoutes;