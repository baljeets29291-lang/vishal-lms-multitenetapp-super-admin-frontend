import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const HomeLayout = () => {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      
      {/* Header (Top) */}
      <Header />

      {/* Main Layout */}
      <div className="flex h-full flex-1 overflow-hidden">
        
        {/* Sidebar (Left) */}
        <Sidebar />

        {/* Content Area */}
        <main className="flex-1  overflow-y-auto">
          <div className=" min-h-full">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default HomeLayout;