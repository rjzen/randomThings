import React, { useMemo } from 'react';

const HabitHeatmap = ({ logs }) => {
  const days = useMemo(() => {
    const result = [];
    const today = new Date();
    const logMap = new Map(
      logs.map(log => [log.date, log.completed])
    );

    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        completed: logMap.get(dateStr) || false,
        day: date.getDate(),
        month: date.getMonth(),
      });
    }
    return result;
  }, [logs]);

  const getColor = (completed) => {
    if (!completed) return 'bg-gray-100';
    return 'bg-green-500';
  };

  const months = useMemo(() => {
    const monthMap = new Map();
    days.forEach(day => {
      if (!monthMap.has(day.month)) {
        monthMap.set(day.month, []);
      }
      monthMap.get(day.month).push(day);
    });
    return Array.from(monthMap.entries());
  }, [days]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {months.map(([month, monthDays], idx) => (
          <div key={month} className="flex flex-col gap-0.5">
            <div className="text-xs text-gray-400 mb-0.5">
              {new Date(2024, month).toLocaleDateString('en-US', { month: 'short' })}
            </div>
            <div className="flex gap-0.5">
              {monthDays.map((day) => (
                <div
                  key={day.date}
                  className={`w-3 h-3 rounded-sm transition-all cursor-pointer ${getColor(day.completed)} hover:ring-2 hover:ring-offset-1`}
                  style={{ minWidth: '12px' }}
                  title={`${formatDate(day.date)}${day.completed ? ' ✓' : ''}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HabitHeatmap;
