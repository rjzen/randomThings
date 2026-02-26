import axios from 'axios';

const HABITS_BASE_URL = 'http://localhost:8000/api/habits';

const habitsApi = axios.create({
  baseURL: HABITS_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

habitsApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

habitsApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post('http://localhost:8000/api/auth/refresh/', {
            refresh: refreshToken,
          });
          localStorage.setItem('access_token', response.data.access);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return habitsApi(originalRequest);
        }
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const habitsAPI = {
  getHabits: async () => {
    try {
      const response = await habitsApi.get('/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get habits' };
    }
  },

  createHabit: async (habitData) => {
    try {
      const response = await habitsApi.post('/', habitData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to create habit' };
    }
  },

  updateHabit: async (id, habitData) => {
    try {
      const response = await habitsApi.patch(`/${id}/`, habitData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update habit' };
    }
  },

  deleteHabit: async (id) => {
    try {
      await habitsApi.delete(`/${id}/`);
      return true;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to delete habit' };
    }
  },

  getHabitLogs: async (id) => {
    try {
      const response = await habitsApi.get(`/${id}/logs/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get habit logs' };
    }
  },

  toggleHabitLog: async (id, date, completed = true) => {
    try {
      const response = await habitsApi.post(`/${id}/toggle_log/`, { date, completed });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to toggle habit log' };
    }
  },

  getDueToday: async () => {
    try {
      const response = await habitsApi.get('/due_today/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get due habits' };
    }
  },

  getAnalytics: async () => {
    try {
      const response = await habitsApi.get('/analytics/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get analytics' };
    }
  },

  getGamification: async () => {
    try {
      const response = await habitsApi.get('/gamification/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get gamification data' };
    }
  },

  getAchievements: async () => {
    try {
      const response = await habitsApi.get('/achievements/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get achievements' };
    }
  },
};

export default habitsAPI;
