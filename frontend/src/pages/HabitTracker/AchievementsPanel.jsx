import React, { useState, useEffect } from 'react';
import { habitsAPI } from '../../api/habitApi';

const AchievementsPanel = ({ isOpen, onClose }) => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchAchievements = async () => {
        try {
          const data = await habitsAPI.getAchievements();
          setAchievements(data);
        } catch (err) {
          console.error('Failed to fetch achievements:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchAchievements();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto" style={{ backgroundColor: 'var(--theme-background, #fff)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--theme-text, #111827)' }}>
            🏆 Achievements
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map(achievement => (
              <div
                key={achievement.id}
                className={`p-4 rounded-xl text-center transition-all ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200'
                    : 'bg-gray-100 opacity-50'
                }`}
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <h3 className="font-bold text-sm" style={{ color: 'var(--theme-text, #111827)' }}>
                  {achievement.name}
                </h3>
                <p className="text-xs opacity-70 mt-1">{achievement.description}</p>
                {achievement.unlocked && (
                  <span className="inline-block mt-2 text-xs text-green-600 font-medium">✓ Unlocked</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementsPanel;
