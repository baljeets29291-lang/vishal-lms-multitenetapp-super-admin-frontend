import React from "react";
import { Bell, Search, User } from "lucide-react";

const Header = () => {
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
        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg transition">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
            V
          </div>
          <span className="hidden sm:block text-sm text-gray-700">
            Vishal
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;