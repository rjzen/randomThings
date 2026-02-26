import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authAPI } from './utils/api';
import ThemeProvider from './context/ThemeContext';
import { useTheme } from './context/ThemeContext';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Collections from './pages/Collections';
import Projects from './pages/Projects';
import Gallery from './pages/Gallery';
import Notes from './pages/Notes';
import Calendar from './pages/Calendar';
import Themes from './pages/Themes';
import HabitTracker from './pages/HabitTracker';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

const ThemedApp = () => {
  const { currentTheme } = useTheme();
  const isAuthenticated = authAPI.isAuthenticated();

  const style = {
    '--theme-primary': currentTheme.primary_color,
    '--theme-secondary': currentTheme.secondary_color,
    '--theme-background': currentTheme.background_color,
    '--theme-text': currentTheme.text_color,
  };

  return (
    <Router>
      <div style={style} className="theme-root">
        <Routes>
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
          />
          
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/collections" element={<Collections />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/notes" element={<Notes />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/themes" element={<Themes />} />
                    <Route path="/projects/habit-tracker" element={<HabitTracker />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

export default App;