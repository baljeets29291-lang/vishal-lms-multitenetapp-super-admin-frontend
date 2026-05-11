import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./auth/Login";
import HomeLayout from "./layout/HomeLayout";
import HomePage from "./pages/HomePage";
import Profile from "./pages/Profile";
import ProtectRoutes from "./auth/ProtectRoutes";
import CreateOrganization from "./pages/CreateOrganization";
import ViewOrganization from "./pages/ViewOrganization";
import CreateAdmin from "./pages/CreateAdmin";
import ViewAdmins from "./pages/ViewAdmins";
import CreateRole from "./pages/CreateRole";
import SplashScreen from "./components/SplashScreen";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  const handleSplashComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route element={<ProtectRoutes />}>
        <Route element={<HomeLayout />}>

          {/* Dashboard */}
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<Profile />} />

          {/* Organization Routes */}
          <Route path="/create-org" element={<CreateOrganization />} />
          <Route path="/organizations" element={<ViewOrganization />} />
          <Route path="/create-role" element={<CreateRole />} />

          {/* Admin Routes */}
          <Route path="/create-admin" element={<CreateAdmin />} />
          <Route path="/admins" element={<ViewAdmins />} />

        </Route>
      </Route>
    </Routes>
  );
};

export default App;