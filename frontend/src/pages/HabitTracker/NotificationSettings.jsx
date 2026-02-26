import React, { useState, useEffect } from 'react';
import { habitsAPI } from '../../api/habitApi';
import { useTheme } from '../../context/ThemeContext';

const NotificationSettings = ({ isOpen, onClose, habits }) => {
  const { currentTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="rounded-xl p-6 w-full max-w-md" style={{ backgroundColor: currentTheme.background_color }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: currentTheme.text_color }}>
            🔔 Notification Settings
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {habits?.filter(h => h.reminder_enabled).map(habit => (
            <div key={habit.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
              <div className="flex items-center gap-2">
                <span>{habit.icon}</span>
                <span className="font-medium">{habit.name}</span>
              </div>
              <span className="text-sm opacity-70">
                {habit.reminder_time || 'Not set'}
              </span>
            </div>
          ))}
          {(!habits || !habits.filter(h => h.reminder_enabled).length) && (
            <p className="text-center opacity-60 py-4">No habits with reminders enabled</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
