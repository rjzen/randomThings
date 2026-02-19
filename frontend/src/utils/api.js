import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/auth';
const PROFILE_BASE_URL = 'http://localhost:8000/api/profile';
const GALLERY_BASE_URL = 'http://localhost:8000/api/gallery';
const CALENDAR_BASE_URL = 'http://localhost:8000/api/calendar';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const profileApi = axios.create({
  baseURL: PROFILE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

profileApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (username, password) => {
    try {
      const response = await api.post('/login/', { username, password });
      const { access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Login failed' };
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/logout/', { refresh_token: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  getUserProfile: async () => {
    try {
      const response = await api.get('/user/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get user profile' };
    }
  },

  getFullProfile: async () => {
    try {
      const response = await profileApi.get('/profile/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get full profile' };
    }
  },

  updateProfile: async (formData) => {
    try {
      const response = await profileApi.put('/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update profile' };
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  getToken: () => {
    return localStorage.getItem('access_token');
  },
};

// Theme API
export const themeAPI = {
  getThemes: async () => {
    try {
      const response = await profileApi.get('/themes/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get themes' };
    }
  },

  createTheme: async (themeData) => {
    try {
      const response = await profileApi.post('/themes/', themeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to create theme' };
    }
  },

  updateTheme: async (id, themeData) => {
    try {
      const response = await profileApi.put(`/themes/${id}/`, themeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update theme' };
    }
  },

  deleteTheme: async (id) => {
    try {
      await profileApi.delete(`/themes/${id}/`);
      return true;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to delete theme' };
    }
  },

  setTheme: async (themeId) => {
    try {
      const response = await profileApi.post('/set-theme/', { theme_id: themeId });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to set theme' };
    }
  },

  getActivities: async (limit = 10) => {
    try {
      const response = await profileApi.get(`/activities/?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get activities' };
    }
  },
};

const galleryApi = axios.create({
  baseURL: GALLERY_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

galleryApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

galleryApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/refresh/`, {
            refresh: refreshToken,
          });
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return galleryApi(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const galleryAPI = {
  getPhotos: async () => {
    try {
      const response = await galleryApi.get('/photos/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get photos' };
    }
  },

  uploadPhoto: async (formData) => {
    try {
      const response = await galleryApi.post('/photos/', formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to upload photo' };
    }
  },

  deletePhoto: async (id) => {
    try {
      await galleryApi.delete(`/photos/${id}/`);
      return true;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to delete photo' };
    }
  },

  updatePhoto: async (id, data) => {
    try {
      const response = await galleryApi.put(`/photos/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update photo' };
    }
  },
};

const calendarApi = axios.create({
  baseURL: CALENDAR_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

calendarApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

calendarApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/refresh/`, {
            refresh: refreshToken,
          });
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return calendarApi(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const calendarAPI = {
  getTasks: async () => {
    try {
      const response = await calendarApi.get('/tasks/all/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get tasks' };
    }
  },

  getTasksByDate: async (date) => {
    try {
      const response = await calendarApi.get(`/tasks/by_date/?date=${date}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get tasks by date' };
    }
  },

  getTodayTasks: async () => {
    try {
      const response = await calendarApi.get('/tasks/today/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get today tasks' };
    }
  },

  getUpcomingTasks: async () => {
    try {
      const response = await calendarApi.get('/tasks/upcoming/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get upcoming tasks' };
    }
  },

  getPastTasks: async () => {
    try {
      const response = await calendarApi.get('/tasks/past/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get past tasks' };
    }
  },

  createTask: async (taskData) => {
    try {
      const response = await calendarApi.post('/tasks/', taskData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to create task' };
    }
  },

  updateTask: async (id, taskData) => {
    try {
      const response = await calendarApi.put(`/tasks/${id}/`, taskData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update task' };
    }
  },

  deleteTask: async (id) => {
    try {
      await calendarApi.delete(`/tasks/${id}/`);
      return true;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to delete task' };
    }
  },

  toggleTaskComplete: async (id) => {
    try {
      const response = await calendarApi.post(`/tasks/${id}/toggle_complete/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to toggle task complete' };
    }
  },
};

export default api;