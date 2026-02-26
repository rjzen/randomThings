import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { habitsAPI } from '../../api/habitApi';
import { useTheme } from '../../context/ThemeContext';
import HabitCard from './HabitCard';
import AddHabitForm from './AddHabitForm';
import AnalyticsDashboard from './AnalyticsDashboard';
import GamificationBar from './GamificationBar';
import AchievementsPanel from './AchievementsPanel';
import DueTodayBanner from './DueTodayBanner';
import NotificationSettings from './NotificationSettings';
import EditHabitModal from './EditHabitModal';

const CATEGORY_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'health', label: 'Health' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'mindfulness', label: 'Mindfulness' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'other', label: 'Other' },
];

const HabitTracker = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const { currentTheme } = useTheme();

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAchievements, setShowAchievements] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const data = await habitsAPI.getHabits();
      setHabits(data);
      setError(null);
    } catch (err) {
      setError(err.error || 'Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleCreateHabit = async (habitData) => {
    try {
      await habitsAPI.createHabit(habitData);
      await fetchHabits();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.error || 'Failed to create habit' };
    }
  };

  const handleDeleteHabit = async (id) => {
    try {
      await habitsAPI.deleteHabit(id);
      setHabits(habits.filter(h => h.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.error || 'Failed to delete habit' };
    }
  };

  const handleToggleHabit = async (id, completed) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await habitsAPI.toggleHabitLog(id, today, completed);
      await fetchHabits();
    } catch (err) {
      console.error('Failed to toggle habit:', err);
    }
  };

  const handleUpdateHabit = async () => {
    await fetchHabits();
  };

  const filteredHabits = categoryFilter === 'all'
    ? habits
    : habits.filter(h => h.category === categoryFilter);

  const highlightedHabitId = searchParams.get('habit');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: currentTheme.primary_color }}></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: currentTheme.text_color }}>
            Habit Tracker
          </h1>
          <p style={{ color: currentTheme.text_color, opacity: 0.7 }}>
            Track your daily habits and build streaks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotificationSettings(true)}
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
            title="Notification Settings"
          >
            🔔
          </button>
          <AddHabitForm onSubmit={handleCreateHabit} />
        </div>
      </div>

      <GamificationBar onOpenAchievements={() => setShowAchievements(true)} />
      <DueTodayBanner onRefresh={fetchHabits} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {CATEGORY_FILTERS.map(filter => (
              <button
                key={filter.value}
                onClick={() => setCategoryFilter(filter.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  categoryFilter === filter.value ? 'text-white' : ''
                }`}
                style={{
                  backgroundColor: categoryFilter === filter.value ? currentTheme.primary_color : 'rgba(0,0,0,0.05)',
                  color: categoryFilter === filter.value ? 'white' : currentTheme.text_color,
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {filteredHabits.length === 0 ? (
            <div className="text-center py-12 rounded-xl" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
              <p style={{ color: currentTheme.text_color, opacity: 0.6 }}>
                No habits yet. Create your first habit to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isHighlighted={highlightedHabitId == habit.id}
                  onToggle={handleToggleHabit}
                  onDelete={handleDeleteHabit}
                  onEdit={setEditingHabit}
                />
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <AnalyticsDashboard />
        </div>
      </div>

      <AchievementsPanel
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
      />

      <NotificationSettings
        isOpen={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
        habits={habits}
      />

      <EditHabitModal
        habit={editingHabit}
        isOpen={!!editingHabit}
        onClose={() => setEditingHabit(null)}
        onSave={handleUpdateHabit}
      />
    </div>
  );
};

export default HabitTracker;
