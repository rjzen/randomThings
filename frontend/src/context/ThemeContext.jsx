import React, { createContext, useContext, useState, useEffect } from 'react';
import { themeAPI, authAPI } from '../utils/api';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState({
    id: null,
    primary_color: '#6366f1',
    secondary_color: '#8b5cf6',
    background_color: '#f9fafb',
    text_color: '#111827',
    sidebar_color: '#1f2937',
  });
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      loadThemeData();
    } else {
      setLoading(false);
    }
  }, []);

  const loadThemeData = async () => {
    try {
      const profile = await authAPI.getFullProfile();
      if (profile.current_theme) {
        setCurrentTheme({
          id: profile.current_theme.id,
          primary_color: profile.current_theme.primary_color,
          secondary_color: profile.current_theme.secondary_color,
          background_color: profile.current_theme.background_color,
          text_color: profile.current_theme.text_color,
          sidebar_color: profile.current_theme.sidebar_color || '#1f2937',
        });
      }
      
      const themesData = await themeAPI.getThemes();
      setThemes(themesData);
    } catch (error) {
      console.error('Failed to load theme data:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeTheme = async (themeId) => {
    try {
      const profile = await themeAPI.setTheme(themeId);
      if (profile.current_theme) {
        setCurrentTheme({
          id: profile.current_theme.id,
          primary_color: profile.current_theme.primary_color,
          secondary_color: profile.current_theme.secondary_color,
          background_color: profile.current_theme.background_color,
          text_color: profile.current_theme.text_color,
          sidebar_color: profile.current_theme.sidebar_color || '#1f2937',
        });
      }
      // Refresh themes to update activity log
      const themesData = await themeAPI.getThemes();
      setThemes(themesData);
    } catch (error) {
      console.error('Failed to change theme:', error);
    }
  };

  const refreshThemes = async () => {
    try {
      const themesData = await themeAPI.getThemes();
      setThemes(themesData);
    } catch (error) {
      console.error('Failed to refresh themes:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      currentTheme, 
      themes, 
      loading, 
      changeTheme, 
      refreshThemes 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;