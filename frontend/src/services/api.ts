import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3000/api'; // Change this to your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fitnessAPI = {
  // Dashboard
  getDashboard: async () => {
    try {
      const response = await api.get('/dashboard');
      return response.data;
    } catch (error) {
      // Return mock data if API fails
      return {
        caloriesConsumed: 1850,
        caloriesGoal: 2000,
        proteinConsumed: 120,
        proteinGoal: 150,
        carbsConsumed: 180,
        carbsGoal: 200,
        fatConsumed: 55,
        fatGoal: 65,
        waterIntake: 6,
        waterGoal: 8,
        workoutsCompleted: 1,
        mealsCount: 3,
      };
    }
  },

  // Water logging
  logWater: async (glasses: number) => {
    try {
      const response = await api.post('/water', { glasses });
      return response.data;
    } catch (error) {
      console.log('Mock: Logged', glasses, 'glasses of water');
      return { success: true };
    }
  },

  // Meal logging
  createMeal: async (mealData: any) => {
    try {
      const response = await api.post('/meals', mealData);
      return response.data;
    } catch (error) {
      console.log('Mock: Logged meal:', mealData);
      return { success: true };
    }
  },
};
