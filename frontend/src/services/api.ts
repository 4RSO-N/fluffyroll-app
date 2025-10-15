import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://10.1.0.7:3000/api/v1'; // Updated to use your IP address for mobile device testing

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fitnessAPI = {
  // Dashboard
  getDashboard: async () => {
    try {
      const response = await api.get('/fitness/dashboard');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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
      const response = await api.post('/fitness/water', { glasses });
      return response.data;
    } catch (error) {
      console.error('Failed to log water:', error);
      console.log('Mock: Logged', glasses, 'glasses of water');
      return { success: true };
    }
  },

  // Meal logging
  createMeal: async (mealData: any) => {
    try {
      const response = await api.post('/fitness/meals', mealData);
      return response.data;
    } catch (error) {
      console.error('Failed to log meal:', error);
      console.log('Mock: Logged meal:', mealData);
      return { success: true };
    }
  },

  // Profile management
  updateProfile: async (profileData: any) => {
    try {
      const response = await api.post('/fitness/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      console.log('Mock: Updated profile:', profileData);
      return { success: true };
    }
  },

  // Workout logging
  createWorkout: async (workoutData: any) => {
    try {
      const response = await api.post('/fitness/workouts', workoutData);
      return response.data;
    } catch (error) {
      console.error('Failed to log workout:', error);
      console.log('Mock: Logged workout:', workoutData);
      return { success: true };
    }
  },
};
