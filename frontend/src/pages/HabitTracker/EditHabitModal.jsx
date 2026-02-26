import React, { useState, useEffect } from 'react';
import { habitsAPI } from '../../api/habitApi';
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

const EditHabitModal = ({ habit, isOpen, onClose, onSave }) => {
  const { currentTheme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    color: '#6366f1',
    icon: '✅',
    frequency: 'daily',
    target_days: [],
    category: 'other',
    reminder_enabled: false,
    reminder_time: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name || '',
        color: habit.color || '#6366f1',
        icon: habit.icon || '✅',
        frequency: habit.frequency || 'daily',
        target_days: habit.target_days || [],
        category: habit.category || 'other',
        reminder_enabled: habit.reminder_enabled || false,
        reminder_time: habit.reminder_time || '',
      });
    }
  }, [habit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await habitsAPI.updateHabit(habit.id, formData);
      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to update habit:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto" style={{ backgroundColor: currentTheme.background_color }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: currentTheme.text_color }}>
          Edit Habit
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" style={{ color: currentTheme.text_color }}>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border"
              style={{ borderColor: 'rgba(0,0,0,0.1)' }}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.text_color }}>Color</label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full ${formData.color === color ? 'ring-2 ring-offset-2' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.text_color }}>Icon</label>
            <div className="grid grid-cols-5 gap-2">
              {EMOJI_LIST.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: emoji })}
                  className={`text-2xl p-2 rounded-lg ${formData.icon === emoji ? 'bg-gray-200' : ''}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" style={{ color: currentTheme.text_color }}>Frequency</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border"
              style={{ borderColor: 'rgba(0,0,0,0.1)' }}
            >
              <option value="daily">Daily</option>
              <option value="weekdays">Weekdays</option>
              <option value="weekends">Weekends</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {formData.frequency === 'custom' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.text_color }}>Select Days</label>
              <div className="flex gap-2">
                {WEEKDAYS.map((day, idx) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      const days = formData.target_days.includes(idx)
                        ? formData.target_days.filter(d => d !== idx)
                        : [...formData.target_days, idx];
                      setFormData({ ...formData, target_days: days });
                    }}
                    className={`px-2 py-1 text-xs rounded-lg ${
                      formData.target_days.includes(idx) ? 'bg-indigo-500 text-white' : 'bg-gray-100'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" style={{ color: currentTheme.text_color }}>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border"
              style={{ borderColor: 'rgba(0,0,0,0.1)' }}
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.reminder_enabled}
                onChange={(e) => setFormData({ ...formData, reminder_enabled: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm" style={{ color: currentTheme.text_color }}>Enable Reminder</span>
            </label>
          </div>

          {formData.reminder_enabled && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: currentTheme.text_color }}>Reminder Time</label>
              <input
                type="time"
                value={formData.reminder_time}
                onChange={(e) => setFormData({ ...formData, reminder_time: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border"
                style={{ borderColor: 'rgba(0,0,0,0.1)' }}
              />
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-white"
              style={{ backgroundColor: currentTheme.primary_color, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHabitModal;
