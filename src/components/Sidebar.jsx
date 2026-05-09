import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  PlusSquare,
  User,
  LogOut,
  Users,
  UserPlus,
  Shield,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard", section: "main" },
    { to: "/organizations", icon: Building2, label: "Organizations", section: "main" },
    { to: "/create-org", icon: PlusSquare, label: "Create Org", section: "main" },
    { to: "/admins", icon: Users, label: "View Admins", section: "admins" },
    { to: "/create-role", icon: Shield, label: "Create Role", section: "admins" },
    { to: "/create-admin", icon: UserPlus, label: "Create Admin", section: "admins" },
    { to: "/profile", icon: User, label: "Profile", section: "main" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 bg-gradient-to-b from-gray-900 to-gray-800
          text-white flex flex-col shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">LMS Organization</h1>
              <p className="text-xs text-gray-400">Management Portal</p>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-4 lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto  p-4 space-y-6">
          {/* Main Section */}
          <div>
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Main Menu
            </p>
            <div className="space-y-1">
              {menuItems
                .filter(item => item.section === "main")
                .map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => onClose()}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive(item.to)
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                      }
                    `}
                  >
                    <item.icon size={20} className={isActive(item.to) ? 'text-white' : 'text-gray-400'} />
                    <span className="font-medium">{item.label}</span>
                    {isActive(item.to) && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full shadow-glow" />
                    )}
                  </Link>
                ))}
            </div>
          </div>

          {/* Admin Section */}
          <div>
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Admin Management
            </p>
            <div className="space-y-1">
              {menuItems
                .filter(item => item.section === "admins")
                .map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => onClose()}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive(item.to)
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                      }
                    `}
                  >
                    <item.icon size={20} className={isActive(item.to) ? 'text-white' : 'text-gray-400'} />
                    <span className="font-medium">{item.label}</span>
                    {isActive(item.to) && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full shadow-glow" />
                    )}
                  </Link>
                ))}
            </div>
          </div>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-700/50">
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 group"
          >
            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;