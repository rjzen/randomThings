import React, { useState, useEffect } from 'react';
import { habitsAPI } from '../../api/habitApi';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await habitsAPI.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-xl h-64"></div>
    );
  }

  return (
    <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
      <h3 className="font-semibold text-lg mb-4" style={{ color: '#1f2937' }}>
        📊 Insights & Analytics
      </h3>
      <div className="grid grid-cols-1 gap-4">
        <div className="p-4 rounded-lg bg-white shadow-sm">
          <p className="text-sm opacity-60 mb-1">Completion Rate</p>
          <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>
            {analytics.overall_completion_rate}%
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white shadow-sm">
          <p className="text-sm opacity-60 mb-1">Best Day</p>
          <p className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>
            {analytics.best_day_of_week}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white shadow-sm">
          <p className="text-sm opacity-60 mb-1">Most Consistent</p>
          <p className="text-xl font-bold truncate" style={{ color: '#f59e0b' }}>
            {analytics.most_consistent_habit?.name || 'N/A'}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white shadow-sm">
          <p className="text-sm font-medium mb-3">Weekly Progress (Last 4 Weeks)</p>
          <div className="flex items-end justify-between gap-2 h-32">
            {analytics.weekly_summary.map((week, idx) => {
              const percentage = week.total > 0 ? (week.completed / week.total) * 100 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${percentage}%`,
                      minHeight: percentage > 0 ? '8px' : '4px',
                      backgroundColor: '#6366f1',
                      opacity: 0.7 + (idx * 0.1)
                    }}
                  ></div>
                  <p className="text-xs mt-2 opacity-60">{week.week}</p>
                  <p className="text-xs opacity-40">{week.completed}/{week.total}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
