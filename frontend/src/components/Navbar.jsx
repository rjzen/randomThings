import React, { useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  UserCircleIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  Bars3Icon 
} from '@heroicons/react/24/outline';

const Navbar = ({ onMenuClick }) => {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { currentTheme } = useTheme();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (authAPI.isAuthenticated()) {
        try {
          const userData = await authAPI.getUserProfile();
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b" style={{ borderBottomColor: currentTheme.primary_color }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Left side - Logo and Menu Button */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 md:hidden"
              style={{ '--tw-ring-color': currentTheme.primary_color }}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="flex-shrink-0 ml-4 md:ml-0">
              <h1 className="text-xl font-bold" style={{ color: currentTheme.primary_color }}>Hobby Hub</h1>
            </div>
          </div>

          {/* Right side - User dropdown */}
          <div className="relative">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="hidden sm:block text-sm" style={{ color: currentTheme.text_color }}>
                  Welcome, {user.username}
                </span>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDropdownOpen(!dropdownOpen);
                    }}
                    className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{ '--tw-ring-color': currentTheme.primary_color }}
                  >
                    <div 
                      className="h-8 w-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: currentTheme.primary_color }}
                    >
                      <UserCircleIcon className="h-6 w-6 text-white" />
                    </div>
                  </button>

                  {/* Dropdown menu */}
                  {dropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[60]">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            navigate('/profile');
                            setDropdownOpen(false);
                          }}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <UserCircleIcon className="h-5 w-5 mr-3 text-gray-400" />
                          Profile
                        </button>
                        <button
                          onClick={() => {
                            navigate('/settings');
                            setDropdownOpen(false);
                          }}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <Cog6ToothIcon className="h-5 w-5 mr-3 text-gray-400" />
                          Settings
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 text-gray-400" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-300 animate-pulse"></div>
            )}
          </div>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-[50]"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;