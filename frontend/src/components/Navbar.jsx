import React, { useState, useEffect } from 'react';
import { authAPI, calendarAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  UserCircleIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  BellIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const Navbar = ({ onMenuClick }) => {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [todayTasks, setTodayTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [pastTasks, setPastTasks] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const navigate = useNavigate();
  const { currentTheme } = useTheme();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (authAPI.isAuthenticated()) {
        try {
          const userData = await authAPI.getUserProfile();
          setUser(userData);
          fetchNotifications();
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [notificationOpen]);

  const formatDate = (dateStr) => {
    try {
      if (!dateStr) return '';
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getTodayDateStr = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isToday = (dateStr) => {
    return dateStr === getTodayDateStr();
  };

  const categorizeTasks = (tasks) => {
    const todayStr = getTodayDateStr();
    const today = [];
    const upcoming = [];
    const past = [];

    tasks.forEach(task => {
      if (task.date === todayStr) {
        today.push(task);
      } else if (task.date > todayStr) {
        upcoming.push(task);
      } else {
        past.push(task);
      }
    });

    return { today, upcoming, past };
  };

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const allTasks = await calendarAPI.getTasks();
      if (!allTasks || !Array.isArray(allTasks)) {
        throw new Error('Invalid response');
      }
      const categorized = categorizeTasks(allTasks);
      setTodayTasks(categorized.today || []);
      setUpcomingTasks(categorized.upcoming || []);
      setPastTasks(categorized.past || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error.message || error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return;
      }
      setTodayTasks([]);
      setUpcomingTasks([]);
      setPastTasks([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await authAPI.logout();
      }
    } catch (error) {
      console.log('Logout API error (ignoring):', error.message);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      navigate('/login', { replace: true });
    }
  };

  const totalUnread = todayTasks.filter(t => !t.completed).length + upcomingTasks.filter(t => !t.completed).length;

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

          {/* Right side - Notifications and User dropdown */}
          <div className="relative">
            {user ? (
              <div className="flex items-center space-x-2">
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setNotificationOpen(!notificationOpen);
                      setDropdownOpen(false);
                    }}
                    className="p-2 rounded-full hover:bg-gray-100 focus:outline-none relative"
                    style={{ color: currentTheme.text_color }}
                  >
                    <BellIcon className="h-6 w-6" />
                    {totalUnread > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                        {totalUnread}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {notificationOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-[60] max-h-96 overflow-hidden">
                      <div className="p-3 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        <p className="text-xs text-gray-500">{totalUnread} pending tasks</p>
                      </div>
                      
                      <div className="overflow-y-auto max-h-80">
                        {loadingNotifications ? (
                          <div className="p-4 text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 mx-auto" style={{ borderColor: currentTheme.primary_color }}></div>
                          </div>
                        ) : (
                          <>
                            {/* Today's Tasks */}
                            {todayTasks.length > 0 && (
                              <div className="p-2">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1 flex items-center">
                                  <ClockIcon className="h-3 w-3 mr-1" />
                                  Today
                                </h4>
                                {todayTasks.map((task) => (
                                  <div key={task.id} className={`p-2 rounded-md mb-1 ${task.completed ? 'bg-gray-50' : 'bg-blue-50'}`}>
                                    <div className="flex items-start">
                                      {task.completed ? (
                                        <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                                      ) : (
                                        <ClockIcon className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                          {task.title}
                                        </p>
                                        {task.start_time && (
                                          <p className="text-xs text-gray-500">{formatTime(task.start_time)}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Upcoming Tasks */}
                            {upcomingTasks.length > 0 && (
                              <div className="p-2 border-t border-gray-100">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1 flex items-center">
                                  <ClockIcon className="h-3 w-3 mr-1" />
                                  Upcoming
                                </h4>
                                {upcomingTasks.slice(0, 5).map((task) => (
                                  <div key={task.id} className={`p-2 rounded-md mb-1 ${task.completed ? 'bg-gray-50' : 'bg-yellow-50'}`}>
                                    <div className="flex items-start">
                                      {task.completed ? (
                                        <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                                      ) : (
                                        <ClockIcon className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                          {task.title}
                                        </p>
                                        <p className="text-xs text-gray-500">{formatDate(task.date)}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Past Tasks */}
                            {pastTasks.length > 0 && (
                              <div className="p-2 border-t border-gray-100">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1 flex items-center">
                                  <XCircleIcon className="h-3 w-3 mr-1" />
                                  Past
                                </h4>
                                {pastTasks.slice(0, 3).map((task) => (
                                  <div key={task.id} className="p-2 rounded-md mb-1 bg-gray-50">
                                    <div className="flex items-start">
                                      {task.completed ? (
                                        <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                                      ) : (
                                        <XCircleIcon className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                                          {task.title}
                                        </p>
                                        <p className="text-xs text-gray-400">{formatDate(task.date)}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {todayTasks.length === 0 && upcomingTasks.length === 0 && pastTasks.length === 0 && (
                              <div className="p-4 text-center text-gray-500">
                                <BellIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">No tasks yet</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      
                      <div className="p-2 border-t border-gray-200">
                        <button
                          onClick={() => {
                            navigate('/calendar');
                            setNotificationOpen(false);
                          }}
                          className="w-full text-center text-sm font-medium"
                          style={{ color: currentTheme.primary_color }}
                        >
                          View All Tasks
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <span className="hidden sm:block text-sm" style={{ color: currentTheme.text_color }}>
                  {user.username}
                </span>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDropdownOpen(!dropdownOpen);
                      setNotificationOpen(false);
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

                  {/* User Dropdown menu */}
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

      {/* Close dropdowns when clicking outside */}
      {(dropdownOpen || notificationOpen) && (
        <div
          className="fixed inset-0 z-[50]"
          onClick={() => {
            setDropdownOpen(false);
            setNotificationOpen(false);
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;
