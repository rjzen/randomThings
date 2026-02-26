import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { habitsAPI } from '../../api/habitApi';
import { useTheme } from '../../context/ThemeContext';
import HabitHeatmap from './HabitHeatmap';

const HabitCard = ({ habit, isHighlighted, onToggle, onDelete, onEdit }) => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const { currentTheme } = useTheme();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await habitsAPI.getHabitLogs(habit.id);
        setLogs(data);
      } catch (err) {
        console.error('Failed to fetch logs:', err);
      }
    };
    fetchLogs();
  }, [habit.id]);

  const handleToggle = async () => {
    setLoading(true);
    await onToggle(habit.id, !habit.today_completed);
    setLoading(false);
  };

  const handleDelete = async () => {
    const result = await onDelete(habit.id);
    if (result.success) {
      setShowConfirmDelete(false);
    }
  };

  return (
    <div
      className={`rounded-xl p-4 transition-all`}
      style={{
        backgroundColor: currentTheme.background_color,
        borderLeft: `4px solid ${habit.color || currentTheme.primary_color}`,
        boxShadow: isHighlighted ? `0 0 20px ${habit.color || currentTheme.primary_color}40` : 'none',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{habit.icon || '✅'}</span>
            <h3 className="text-lg font-semibold" style={{ color: currentTheme.text_color }}>
              {habit.name}
            </h3>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-sm" style={{ color: '#f97316' }}>
              🔥 {habit.current_streak || 0}
            </span>
            <span className="flex items-center gap-1 text-sm" style={{ color: '#eab308' }}>
              🏆 {habit.longest_streak || 0}
            </span>
            {habit.points > 0 && (
              <span className="flex items-center gap-1 text-sm" style={{ color: '#6366f1' }}>
                ⚡ {habit.points}
              </span>
            )}
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full mt-2 inline-block" style={{ 
            backgroundColor: `${habit.color || currentTheme.primary_color}20`,
            color: habit.color || currentTheme.primary_color 
          }}>
            {habit.category || 'other'}
          </span>
        </div>
        
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            habit.today_completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400 hover:bg-green-100'
          }`}
        >
          {loading ? (
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          ) : habit.today_completed ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
        </button>
      </div>

      <div className="mb-3">
        <HabitHeatmap logs={logs} />
      </div>

      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: '#e5e7eb' }}>
        <div className="flex items-center gap-3">
          <Link
            to={`/collections?habit=${habit.id}`}
            className="text-sm font-medium transition-colors hover:underline"
            style={{ color: '#3730a3' }}
          >
            View in Collections →
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(habit)}
            className="text-sm px-3 py-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: '#e5e7eb', color: '#1f2937', fontWeight: 500 }}
          >
            Edit
          </button>
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="text-sm px-3 py-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 500 }}
          >
            Delete
          </button>
        </div>
      </div>

      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className="rounded-xl p-6 max-w-sm mx-4"
            style={{ backgroundColor: currentTheme.background_color }}
          >
            <h4 className="text-lg font-semibold mb-2" style={{ color: currentTheme.text_color }}>
              Delete Habit?
            </h4>
            <p className="mb-4" style={{ color: currentTheme.text_color, opacity: 0.7 }}>
              Are you sure you want to delete "{habit.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: '#e5e7eb', color: '#1f2937' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: '#dc2626', color: 'white' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitCard;
