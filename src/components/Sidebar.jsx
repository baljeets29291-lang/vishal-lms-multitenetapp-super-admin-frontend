import React from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  PlusSquare,
  User,
  LogOut,
  Users,
  UserPlus,
} from "lucide-react";

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-gray-900 text-gray-200 flex flex-col shadow-xl">

      {/* Logo / Title */}
      <div className="p-6 text-2xl font-bold border-b border-gray-800">
        LMS Panel
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">

        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        <Link
          to="/organizations"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <Building2 size={18} />
          Organizations
        </Link>

        <Link
          to="/create-org"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <PlusSquare size={18} />
          Create Org
        </Link>

        <div className="pt-4 border-t border-gray-800 mt-4">
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Admins
          </p>
          <Link
            to="/admins"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            <Users size={18} />
            View Admins
          </Link>
          <Link
            to="/create-role"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            <Users size={18} />
            Create Role
          </Link>
          <Link
            to="/create-admin"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            <UserPlus size={18} />
            Create Admin
          </Link>
        </div>

        <Link
          to="/profile"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <User size={18} />
          Profile
        </Link>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button className="flex items-center gap-3 w-full px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;