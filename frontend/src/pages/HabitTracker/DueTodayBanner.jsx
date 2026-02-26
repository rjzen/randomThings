import React, { useState, useEffect } from 'react';
import { habitsAPI } from '../../api/habitApi';

const DueTodayBanner = ({ onRefresh }) => {
  const [dueHabits, setDueHabits] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchDueHabits = async () => {
    try {
      const data = await habitsAPI.getDueToday();
      setDueHabits(data);
    } catch (err) {
      console.error('Failed to fetch due habits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDueHabits();
  }, []);

  const handleToggle = async (habitId) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await habitsAPI.toggleHabitLog(habitId, today, true);
      await fetchDueHabits();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to toggle habit:', err);
    }
  };

  if (loading || !dueHabits.length || !isVisible) {
    return null;
  }

  return (
    <div className="mb-4 p-4 rounded-xl border-2 border-yellow-200 bg-yellow-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔔</span>
          <h3 className="font-semibold text-yellow-800">
            You have {dueHabits.length} habits due today!
          </h3>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-yellow-600 hover:text-yellow-800"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-2">
        {dueHabits.map(habit => (
          <div key={habit.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
            <div className="flex items-center gap-2">
              <span>{habit.icon || '✅'}</span>
              <span className="font-medium">{habit.name}</span>
            </div>
            <button
              onClick={() => handleToggle(habit.id)}
              className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Mark Done
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DueTodayBanner;
