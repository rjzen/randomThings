import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const PRESET_COLORS = ['#6366f1', '#ef4444', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#84cc16'];
const EMOJI_LIST = ['✅', '💪', '📚', '🧘', '🏃', '💧', '🍎', '😴', '✍️', '🎯', '🌱', '💊', '🧹', '🎨', '🎵', '💰', '🙏', '⏰', '📝', '🎮'];
const CATEGORIES = [
  { value: 'health', label: 'Health' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'mindfulness', label: 'Mindfulness' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'other', label: 'Other' },
];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const AddHabitForm = ({ onSubmit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [icon, setIcon] = useState('✅');
  const [frequency, setFrequency] = useState('daily');
  const [targetDays, setTargetDays] = useState([]);
  const [category, setCategory] = useState('other');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError('');

    const habitData = {
      name: name.trim(),
      color,
      icon,
      frequency,
      target_days: targetDays,
      category,
      reminder_enabled: reminderEnabled,
      reminder_time: reminderTime || null,
    };

    const result = await onSubmit(habitData);

    if (result.success) {
      setName('');
      setColor('#6366f1');
      setIcon('✅');
      setFrequency('daily');
      setTargetDays([]);
      setCategory('other');
      setReminderEnabled(false);
      setReminderTime('');
      setIsOpen(false);
    } else {
      setError(result.error || 'Failed to create habit');
    }

    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
        style={{ backgroundColor: currentTheme.primary_color }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Habit
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto" style={{ backgroundColor: currentTheme.background_color }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: currentTheme.text_color }}>
          Create New Habit
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1" style={{ color: currentTheme.text_color }}>
              Habit Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Exercise, Read, Meditate..."
              className="w-full px-4 py-2 rounded-lg border"
              style={{ borderColor: 'rgba(0,0,0,0.1)' }}
              autoFocus
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.text_color }}>
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full ${color === c ? 'ring-2 ring-offset-2' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.text_color }}>
              Icon
            </label>
            <div className="grid grid-cols-5 gap-2">
              {EMOJI_LIST.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`text-2xl p-2 rounded-lg ${icon === emoji ? 'bg-gray-200' : ''}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1" style={{ color: currentTheme.text_color }}>
              Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border"
              style={{ borderColor: 'rgba(0,0,0,0.1)' }}
            >
              <option value="daily">Daily</option>
              <option value="weekdays">Weekdays</option>
              <option value="weekends">Weekends</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {frequency === 'custom' && (
            <div className="mb-3">
              <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.text_color }}>
                Select Days
              </label>
              <div className="flex gap-2 flex-wrap">
                {WEEKDAYS.map((day, idx) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      const days = targetDays.includes(idx)
                        ? targetDays.filter(d => d !== idx)
                        : [...targetDays, idx];
                      setTargetDays(days);
                    }}
                    className={`px-3 py-1 text-sm rounded-lg ${
                      targetDays.includes(idx) ? 'bg-indigo-500 text-white' : 'bg-gray-100'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1" style={{ color: currentTheme.text_color }}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border"
              style={{ borderColor: 'rgba(0,0,0,0.1)' }}
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm" style={{ color: currentTheme.text_color }}>Enable Reminder</span>
            </label>
          </div>

          {reminderEnabled && (
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1" style={{ color: currentTheme.text_color }}>
                Reminder Time
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor: 'rgba(0,0,0,0.1)' }}
              />
            </div>
          )}

          {error && (
            <p className="mb-3 text-sm text-red-500">{error}</p>
          )}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: currentTheme.primary_color, opacity: loading || !name.trim() ? 0.7 : 1 }}
            >
              {loading ? 'Creating...' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHabitForm;
