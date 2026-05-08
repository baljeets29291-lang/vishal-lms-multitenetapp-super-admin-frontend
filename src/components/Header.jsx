import React, { useState, useEffect, useRef } from "react";
import { Bell, Search, User, LogOut, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    // Clear all localStorage data
    localStorage.clear();

    // Redirect to login page
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="h-16 bg-white border-b shadow-sm flex items-center justify-between px-6">

      {/* Left - Title */}
      <div className="text-lg font-semibold text-gray-800">
        Dashboard
      </div>

      {/* Center - Search */}
      <div className="hidden md:flex items-center bg-gray-100 px-3 py-2 rounded-lg w-1/3">
        <Search size={18} className="text-gray-500" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none ml-2 w-full text-sm"
        />
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-4">

        {/* Notification */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg transition"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
              V
            </div>
            <span className="hidden sm:block text-sm text-gray-700">
              Vishal
            </span>
            <ChevronDown size={16} className="text-gray-500" />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/profile');
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <User size={16} />
                Profile
              </button>
              <hr className="my-1 border-gray-200" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;