import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  Squares2X2Icon,
  FolderIcon,
  PhotoIcon,
  DocumentTextIcon,
  CalendarIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const sidebarItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    current: (pathname) => pathname === '/dashboard',
  },
  {
    name: 'Collections',
    href: '/collections',
    icon: Squares2X2Icon,
    current: (pathname) => pathname === '/collections',
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: FolderIcon,
    current: (pathname) => pathname === '/projects',
  },
  {
    name: 'Gallery',
    href: '/gallery',
    icon: PhotoIcon,
    current: (pathname) => pathname === '/gallery',
  },
  {
    name: 'Notes',
    href: '/notes',
    icon: DocumentTextIcon,
    current: (pathname) => pathname === '/notes',
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: CalendarIcon,
    current: (pathname) => pathname === '/calendar',
  },
  {
    name: 'Themes',
    href: '/themes',
    icon: Squares2X2Icon,
    current: (pathname) => pathname === '/themes',
  },
];

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (href) => {
    navigate(href);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:fixed lg:top-4 lg:left-4 z-40 flex flex-col
        bg-gray-800 text-white
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
        w-64 h-[calc(100vh-2rem)]
        lg:h-[calc(100vh-2rem)]
        rounded-lg shadow-2xl
        lg:rounded-lg lg:shadow-2xl
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold">Menu</h2>
          )}
          <div className="flex items-center space-x-2">
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-700 lg:hidden"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            {/* Desktop collapse toggle */}
            <button
              onClick={onToggleCollapse}
              className="hidden p-1 rounded-md hover:bg-gray-700 lg:block"
            >
              {isCollapsed ? (
                <ChevronRightIcon className="h-5 w-5" />
              ) : (
                <ChevronLeftIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = item.current(location.pathname);
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={`
                  w-full flex items-center px-2 py-3 text-sm font-medium rounded-md transition-colors
                  ${isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
              >
                <Icon className="h-6 w-6 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="ml-3">{item.name}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          {!isCollapsed && (
            <div className="text-xs text-gray-400">
              Hobby Hub v1.0
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;