import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const ThemeSelector = () => {
  const { themes, currentTheme, changeTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const currentThemeData = themes.find(t => 
    t.primary_color === currentTheme.primary_color
  );

  const handleThemeSelect = async (themeId) => {
    await changeTheme(themeId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
      >
        <div className="flex items-center">
          <div className="flex space-x-1 mr-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: currentTheme.primary_color }}
            />
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: currentTheme.secondary_color }}
            />
          </div>
          <span>{currentThemeData?.name || 'Theme'}</span>
        </div>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-gray-700 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {themes.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-400">
              No themes available
            </div>
          ) : (
            themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeSelect(theme.id)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: theme.primary_color }}
                    />
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: theme.secondary_color }}
                    />
                  </div>
                  <span>{theme.name}</span>
                </div>
                {currentTheme.primary_color === theme.primary_color && (
                  <CheckIcon className="h-4 w-4 text-green-400" />
                )}
              </button>
            ))
          )}
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)} 
        />
      )}
    </div>
  );
};

export default ThemeSelector;