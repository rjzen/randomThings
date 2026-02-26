import React, { useState, useEffect } from 'react';
import { habitsAPI } from '../../api/habitApi';

const GamificationBar = ({ onOpenAchievements }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await habitsAPI.getGamification();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch gamification:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 h-16 rounded-xl mb-4"></div>
    );
  }

  if (!stats) return null;

  const levelColors = {
    'Beginner': '#6366f1',
    'Consistent': '#22c55e',
    'Dedicated': '#f59e0b',
    'Master': '#ec4899'
  };

  return (
    <div className="mb-4 p-4 rounded-xl flex items-center justify-between" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          <div>
            <p className="text-sm opacity-60">Level</p>
            <p className="font-bold" style={{ color: levelColors[stats.level] || '#6366f1' }}>
              {stats.level}
            </p>
          </div>
        </div>

        <div className="w-32">
          <div className="flex justify-between text-xs mb-1">
            <span>{stats.title}</span>
            <span>{Math.round(stats.progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${stats.progress}%`,
                backgroundColor: levelColors[stats.level] || '#6366f1'
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenAchievements}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
          style={{ backgroundColor: 'rgba(255,215,0,0.2)', color: '#b8860b' }}
        >
          🏆 {stats.achievements?.filter(a => a.unlocked).length || 0}
        </button>
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(99,102,241,0.1)' }}>
          <span>⚡</span>
          <span className="font-bold" style={{ color: '#6366f1' }}>{stats.points}</span>
        </div>
      </div>
    </div>
  );
};

export default GamificationBar;
