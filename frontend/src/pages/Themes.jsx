import React, { useState, useEffect } from 'react';
import { themeAPI } from '../utils/api';

const Themes = () => {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTheme, setNewTheme] = useState({
    name: '',
    primary_color: '#6366f1',
    secondary_color: '#8b5cf6',
    background_color: '#f9fafb',
    text_color: '#111827',
  });

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      const data = await themeAPI.getThemes();
      setThemes(data);
    } catch (error) {
      console.error('Failed to fetch themes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTheme = async (e) => {
    e.preventDefault();
    try {
      await themeAPI.createTheme(newTheme);
      setNewTheme({
        name: '',
        primary_color: '#6366f1',
        secondary_color: '#8b5cf6',
        background_color: '#f9fafb',
        text_color: '#111827',
      });
      setShowAddForm(false);
      fetchThemes();
    } catch (error) {
      console.error('Failed to create theme:', error);
    }
  };

  const handleDeleteTheme = async (id) => {
    if (window.confirm('Are you sure you want to delete this theme?')) {
      try {
        await themeAPI.deleteTheme(id);
        fetchThemes();
      } catch (error) {
        console.error('Failed to delete theme:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Themes</h1>
          <p className="text-gray-600 mt-2">Manage your custom themes and color schemes.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Add Theme
        </button>
      </div>

      {/* Add Theme Form */}
      {showAddForm && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Create New Theme</h3>
          </div>
          <form onSubmit={handleAddTheme} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme Name</label>
                <input
                  type="text"
                  value={newTheme.name}
                  onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={newTheme.primary_color}
                    onChange={(e) => setNewTheme({ ...newTheme, primary_color: e.target.value })}
                    className="h-10 w-20"
                  />
                  <input
                    type="text"
                    value={newTheme.primary_color}
                    onChange={(e) => setNewTheme({ ...newTheme, primary_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={newTheme.secondary_color}
                    onChange={(e) => setNewTheme({ ...newTheme, secondary_color: e.target.value })}
                    className="h-10 w-20"
                  />
                  <input
                    type="text"
                    value={newTheme.secondary_color}
                    onChange={(e) => setNewTheme({ ...newTheme, secondary_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={newTheme.background_color}
                    onChange={(e) => setNewTheme({ ...newTheme, background_color: e.target.value })}
                    className="h-10 w-20"
                  />
                  <input
                    type="text"
                    value={newTheme.background_color}
                    onChange={(e) => setNewTheme({ ...newTheme, background_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={newTheme.text_color}
                    onChange={(e) => setNewTheme({ ...newTheme, text_color: e.target.value })}
                    className="h-10 w-20"
                  />
                  <input
                    type="text"
                    value={newTheme.text_color}
                    onChange={(e) => setNewTheme({ ...newTheme, text_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Create Theme
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Themes */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Existing Themes</h3>
        </div>
        <div className="p-6">
          {themes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No themes created yet. Create your first theme!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {themes.map((theme) => (
                <div key={theme.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-900">{theme.name}</h4>
                      <button
                        onClick={() => handleDeleteTheme(theme.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Color Preview */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-8 h-8 rounded border border-gray-300"
                          style={{ backgroundColor: theme.primary_color }}
                        />
                        <span className="text-sm text-gray-600">Primary</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-8 h-8 rounded border border-gray-300"
                          style={{ backgroundColor: theme.secondary_color }}
                        />
                        <span className="text-sm text-gray-600">Secondary</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-8 h-8 rounded border border-gray-300"
                          style={{ backgroundColor: theme.background_color }}
                        />
                        <span className="text-sm text-gray-600">Background</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-8 h-8 rounded border border-gray-300"
                          style={{ backgroundColor: theme.text_color }}
                        />
                        <span className="text-sm text-gray-600">Text</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Themes;