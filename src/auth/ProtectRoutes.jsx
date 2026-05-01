import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectRoutes = () => {
  // ✅ Get token (you stored in login)
  const token = localStorage.getItem("token");

  // ❌ Not logged in → redirect
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Logged in → allow access
  return <Outlet />;
};

export default ProtectRoutes;