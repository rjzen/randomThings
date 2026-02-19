import React, { useState, useEffect } from 'react';
import { calendarAPI } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const Calendar = () => {
  const { currentTheme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    date: '',
    start_time: '',
    end_time: '',
    priority: 'medium',
    completed: false
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await calendarAPI.getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add empty days for padding
    const startPadding = firstDay.getDay();
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }
    
    // Add actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTasksForDate = (date) => {
    if (!date) return [];
    const dateStr = getDateString(date);
    return tasks.filter(task => task.date === dateStr);
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const handleDateClick = (date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const openAddTask = () => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    setTaskForm({
      title: '',
      description: '',
      date: dateStr,
      start_time: '',
      end_time: '',
      priority: 'medium',
      completed: false
    });
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const openEditTask = (task) => {
    setTaskForm({
      ...task,
      start_time: task.start_time || '',
      end_time: task.end_time || ''
    });
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await calendarAPI.updateTask(editingTask.id, taskForm);
      } else {
        await calendarAPI.createTask(taskForm);
      }
      await fetchTasks();
      setShowTaskModal(false);
      setTaskForm({
        title: '',
        description: '',
        date: '',
        start_time: '',
        end_time: '',
        priority: 'medium',
        completed: false
      });
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await calendarAPI.deleteTask(taskId);
      await fetchTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      await calendarAPI.toggleTaskComplete(task.id);
      await fetchTasks();
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const selectedDateTasks = getTasksForDate(selectedDate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-2">Schedule and manage your tasks.</p>
        </div>
        <button
          onClick={openAddTask}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors"
          style={{ backgroundColor: currentTheme.primary_color }}
        >
          <PlusIcon className="h-5 w-5" />
          Add Task
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronRightIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              const dayTasks = getTasksForDate(date);
              const hasTasks = dayTasks.length > 0;
              const hasCompleted = dayTasks.some(t => t.completed);
              
              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`
                    min-h-[80px] p-2 rounded-lg cursor-pointer transition-all border
                    ${!date ? 'border-transparent' : ''}
                    ${date && isSelected(date) ? 'ring-2' : ''}
                    ${date && isToday(date) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50 border-gray-100'}
                    ${date && isSelected(date) ? 'ring-indigo-500' : ''}
                  `}
                  style={date && isSelected(date) ? { '--tw-ring-color': currentTheme.primary_color } : {}}
                >
                  {date && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className={`
                          text-sm font-medium
                          ${isToday(date) ? 'text-indigo-600' : 'text-gray-700'}
                          ${!date || !isSelected(date) ? '' : 'text-white'}
                        `}>
                          {date.getDate()}
                        </span>
                        {hasTasks && (
                          <div className="flex gap-1">
                            <div className={`w-2 h-2 rounded-full ${hasCompleted ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                            {dayTasks.length > 1 && (
                              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                            )}
                          </div>
                        )}
                      </div>
                      {dayTasks.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {dayTasks.slice(0, 2).map(task => (
                            <div
                              key={task.id}
                              className={`
                                text-xs px-1 py-0.5 rounded truncate
                                ${task.completed ? 'bg-green-100 text-green-600 line-through' : 'bg-indigo-100 text-indigo-700'}
                                ${isSelected(date) ? 'bg-white/50 text-gray-900' : ''}
                              `}
                            >
                              {task.title}
                            </div>
                          ))}
                          {dayTasks.length > 2 && (
                            <div className={`text-xs text-gray-500 ${isSelected(date) ? 'text-white/70' : ''}`}>
                              +{dayTasks.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="h-5 w-5" style={{ color: currentTheme.primary_color }} />
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: currentTheme.primary_color }}></div>
            </div>
          ) : selectedDateTasks.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No tasks for this day</p>
              <button
                onClick={openAddTask}
                className="mt-3 text-sm font-medium"
                style={{ color: currentTheme.primary_color }}
              >
                Add a task
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateTasks.map(task => (
                <div
                  key={task.id}
                  className={`
                    p-3 rounded-lg border-2 transition-all
                    ${task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 hover:border-indigo-300'}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className={`mt-0.5 ${task.completed ? 'text-green-500' : 'text-gray-300 hover:text-green-500'}`}
                    >
                      {task.completed ? (
                        <CheckCircleIcon className="h-5 w-5" />
                      ) : (
                        <ClockIcon className="h-5 w-5" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {task.title}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                      )}
                      {(task.start_time || task.end_time) && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" />
                          {task.start_time && formatTime(task.start_time)}
                          {task.start_time && task.end_time && ' - '}
                          {task.end_time && formatTime(task.end_time)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditTask(task)}
                        className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        <ClockIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
                  style={{ '--tw-ring-color': currentTheme.primary_color }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
                  style={{ '--tw-ring-color': currentTheme.primary_color }}
                />
              </div>
              {editingTask ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={taskForm.date}
                    onChange={(e) => setTaskForm({ ...taskForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
                    style={{ '--tw-ring-color': currentTheme.primary_color }}
                    required
                  />
                </div>
              ) : (
                <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500">
                    Adding task for: <span className="font-medium text-gray-900">
                      {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={taskForm.start_time}
                    onChange={(e) => setTaskForm({ ...taskForm, start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
                    style={{ '--tw-ring-color': currentTheme.primary_color }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={taskForm.end_time}
                    onChange={(e) => setTaskForm({ ...taskForm, end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
                    style={{ '--tw-ring-color': currentTheme.primary_color }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:outline-none"
                  style={{ '--tw-ring-color': currentTheme.primary_color }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              {editingTask && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="completed"
                    checked={taskForm.completed}
                    onChange={(e) => setTaskForm({ ...taskForm, completed: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="completed" className="text-sm text-gray-700">Mark as completed</label>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors"
                  style={{ backgroundColor: currentTheme.primary_color }}
                >
                  {editingTask ? 'Update' : 'Add'} Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
