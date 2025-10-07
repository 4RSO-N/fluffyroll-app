import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.1.0.7:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        await AsyncStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (email: string, password: string, displayName: string) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      displayName,
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};

// Fitness API
export const fitnessAPI = {
  getDashboard: async (date?: string) => {
    const response = await api.get('/fitness/dashboard', {
      params: { date },
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/fitness/profile');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.put('/fitness/profile', data);
    return response.data;
  },

  logWater: async (glasses: number) => {
    const response = await api.post('/fitness/water', { glasses });
    return response.data;
  },

  createMeal: async (data: any) => {
    const response = await api.post('/fitness/meals', data);
    return response.data;
  },

  getMeals: async (startDate?: string, endDate?: string) => {
    const response = await api.get('/fitness/meals', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  createWorkout: async (data: any) => {
    const response = await api.post('/fitness/workouts', data);
    return response.data;
  },

  getWorkouts: async (startDate?: string, endDate?: string) => {
    const response = await api.get('/fitness/workouts', {
      params: { startDate, endDate },
    });
    return response.data;
  },
};

// Habits API
export const habitsAPI = {
  getHabits: async () => {
    const response = await api.get('/habits');
    return response.data;
  },

  createHabit: async (data: any) => {
    const response = await api.post('/habits', data);
    return response.data;
  },

  completeHabit: async (habitId: string, completionDate?: string) => {
    const response = await api.post(`/habits/${habitId}/complete`, {
      completionDate,
    });
    return response.data;
  },

  uncompleteHabit: async (habitId: string, date: string) => {
    const response = await api.delete(`/habits/${habitId}/completions/${date}`);
    return response.data;
  },

  getAchievements: async () => {
    const response = await api.get('/habits/achievements');
    return response.data;
  },
};

// Health API
export const healthAPI = {
  getTimeline: async (startDate?: string, endDate?: string, types?: string) => {
    const response = await api.get('/health/timeline', {
      params: { startDate, endDate, types },
    });
    return response.data;
  },

  logSymptom: async (data: any) => {
    const response = await api.post('/health/symptoms', data);
    return response.data;
  },

  logMood: async (data: any) => {
    const response = await api.post('/health/moods', data);
    return response.data;
  },

  logMedication: async (data: any) => {
    const response = await api.post('/health/medications', data);
    return response.data;
  },
};

// Journal API
export const journalAPI = {
  setupSecurity: async (pin: string) => {
    const response = await api.post('/journal/security', {
      pin,
      authMethod: 'pin',
    });
    return response.data;
  },

  unlock: async (pin: string) => {
    const response = await api.post('/journal/unlock', { pin });
    return response.data;
  },

  getEntries: async () => {
    const response = await api.get('/journal/entries');
    return response.data;
  },

  getEntry: async (entryId: string) => {
    const response = await api.get(`/journal/entries/${entryId}`);
    return response.data;
  },

  createEntry: async (content: string, promptUsed?: string) => {
    const response = await api.post('/journal/entries', {
      content,
      promptUsed,
    });
    return response.data;
  },
};

// Cycle API
export const cycleAPI = {
  getProfile: async () => {
    const response = await api.get('/cycle/profile');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.put('/cycle/profile', data);
    return response.data;
  },

  logPeriod: async (data: any) => {
    const response = await api.post('/cycle/periods', data);
    return response.data;
  },

  getPeriods: async () => {
    const response = await api.get('/cycle/periods');
    return response.data;
  },

  getPredictions: async () => {
    const response = await api.get('/cycle/predictions');
    return response.data;
  },
};

// AI API
export const aiAPI = {
  startCheckIn: async () => {
    const response = await api.post('/ai/check-in');
    return response.data;
  },

  sendMessage: async (conversationId: string, messageText: string) => {
    const response = await api.post(
      `/ai/conversations/${conversationId}/messages`,
      { messageText }
    );
    return response.data;
  },

  getConversation: async (conversationId: string) => {
    const response = await api.get(`/ai/conversations/${conversationId}`);
    return response.data;
  },
};

export default api;
