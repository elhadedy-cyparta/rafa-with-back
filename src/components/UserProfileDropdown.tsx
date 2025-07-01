import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, Settings, Package, Heart, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserProfileDropdownProps {
  onLogout: () => void;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col items-center text-gray-600 hover:text-red-600 transition-all duration-300 transform hover:scale-105 group"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center text-white font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <span className="text-xs mt-1 transition-all duration-300">Account</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center text-white font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 truncate">
                <p className="font-semibold text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.phone}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              to="/account"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings size={18} className="mr-3 text-gray-500" />
              <span>Account Settings</span>
            </Link>
            
            <Link
              to="/orders"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Package size={18} className="mr-3 text-gray-500" />
              <span>My Orders</span>
            </Link>
            
            <Link
              to="/favorites"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Heart size={18} className="mr-3 text-gray-500" />
              <span>Favorites</span>
            </Link>
            
            <Link
              to="/cart"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <ShoppingBag size={18} className="mr-3 text-gray-500" />
              <span>Shopping Cart</span>
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 mt-2 pt-2">
            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} className="mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;