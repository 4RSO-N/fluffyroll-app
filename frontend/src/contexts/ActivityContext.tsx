import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { healthService } from '../services/healthService';

export interface DailyActivity {
  date: string; // YYYY-MM-DD format
  waterIntake: number; // in ml
  sleepHours: number; // in hours
  exerciseMinutes: number; // in minutes
  stepsCount: number;
  moodRating: number; // 1-5 scale
  healthNotes: string[];
  habitsCompleted: string[]; // habit IDs
  caloriesConsumed: number; // Add calorie tracking
  caloriesBurned: number; // Add calorie tracking
}

export interface UserStats {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  totalHabitsCompleted: number;
  averageWaterIntake: number;
  averageSleepHours: number;
  averageMoodRating: number;
  joinDate: string;
}

interface ActivityContextType {
  todaysActivity: DailyActivity;
  userStats: UserStats;
  updateWaterIntake: (amount: number) => Promise<void>;
  updateSleepHours: (hours: number) => Promise<void>;
  updateExerciseMinutes: (minutes: number) => Promise<void>;
  updateStepsCount: (steps: number) => Promise<void>;
  syncWithSamsungHealth: () => Promise<void>;
  updateMoodRating: (rating: number) => Promise<void>;
  addHealthNote: (note: string) => Promise<void>;
  completeHabit: (habitId: string) => Promise<void>;
  updateCaloriesConsumed: (calories: number) => Promise<void>;
  updateCaloriesBurned: (calories: number) => Promise<void>;
  getTodaysProgress: () => {
    waterProgress: number;
    sleepProgress: number;
    exerciseProgress: number;
    stepsProgress: number;
    overallHealth: number;
  };
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

// Targets for calculating progress
const DAILY_TARGETS = {
  waterIntake: 2000, // 2 liters in ml
  sleepHours: 8,
  exerciseMinutes: 30,
  steps: 10000,
};

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todaysActivity, setTodaysActivity] = useState<DailyActivity>({
    date: new Date().toISOString().split('T')[0],
    waterIntake: 0,
    sleepHours: 0,
    exerciseMinutes: 0,
    stepsCount: 0,
    moodRating: 3,
    healthNotes: [],
    habitsCompleted: [],
    caloriesConsumed: 0,
    caloriesBurned: 0,
  });

  const [userStats, setUserStats] = useState<UserStats>({
    totalWorkouts: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalHabitsCompleted: 0,
    averageWaterIntake: 0,
    averageSleepHours: 0,
    averageMoodRating: 3,
    joinDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadTodaysActivity();
    loadUserStats();
  }, []);

  const getTodayDateString = () => new Date().toISOString().split('T')[0];

  const loadTodaysActivity = async () => {
    try {
      const today = getTodayDateString();
      const savedActivity = await AsyncStorage.getItem(`@activity_${today}`);
      
      if (savedActivity) {
        setTodaysActivity(JSON.parse(savedActivity));
      } else {
        // Create new activity for today
        const newActivity: DailyActivity = {
          date: today,
          waterIntake: 0,
          sleepHours: 0,
          exerciseMinutes: 0,
          stepsCount: 0,
          moodRating: 3,
          healthNotes: [],
          habitsCompleted: [],
          caloriesConsumed: 0,
          caloriesBurned: 0,
        };
        setTodaysActivity(newActivity);
        await AsyncStorage.setItem(`@activity_${today}`, JSON.stringify(newActivity));
      }
    } catch (error) {
      console.error('Error loading today\'s activity:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      const savedStats = await AsyncStorage.getItem('@user_stats');
      if (savedStats) {
        setUserStats(JSON.parse(savedStats));
      } else {
        // Initialize stats for new user
        const initialStats: UserStats = {
          totalWorkouts: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalHabitsCompleted: 0,
          averageWaterIntake: 0,
          averageSleepHours: 0,
          averageMoodRating: 3,
          joinDate: new Date().toISOString().split('T')[0],
        };
        setUserStats(initialStats);
        await AsyncStorage.setItem('@user_stats', JSON.stringify(initialStats));
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const saveTodaysActivity = async (activity: DailyActivity) => {
    try {
      await AsyncStorage.setItem(`@activity_${activity.date}`, JSON.stringify(activity));
      setTodaysActivity(activity);
    } catch (error) {
      console.error('Error saving today\'s activity:', error);
    }
  };

  const saveUserStats = async (stats: UserStats) => {
    try {
      await AsyncStorage.setItem('@user_stats', JSON.stringify(stats));
      setUserStats(stats);
    } catch (error) {
      console.error('Error saving user stats:', error);
    }
  };

  const updateWaterIntake = async (amount: number) => {
    const updated = {
      ...todaysActivity,
      waterIntake: Math.max(0, todaysActivity.waterIntake + amount),
    };
    await saveTodaysActivity(updated);
  };

  const updateSleepHours = async (hours: number) => {
    const updated = {
      ...todaysActivity,
      sleepHours: Math.max(0, Math.min(24, hours)),
    };
    await saveTodaysActivity(updated);
  };

  const updateExerciseMinutes = async (minutes: number) => {
    const updated = {
      ...todaysActivity,
      exerciseMinutes: Math.max(0, todaysActivity.exerciseMinutes + minutes),
    };
    await saveTodaysActivity(updated);
    
    // Update workout stats if it's a significant exercise session (15+ minutes)
    if (minutes >= 15) {
      const updatedStats = {
        ...userStats,
        totalWorkouts: userStats.totalWorkouts + 1,
      };
      await saveUserStats(updatedStats);
    }
  };

  const updateStepsCount = async (steps: number) => {
    const updated = {
      ...todaysActivity,
      stepsCount: Math.max(0, steps),
    };
    await saveTodaysActivity(updated);
  };

  const syncWithSamsungHealth = async () => {
    try {
      // Check if Samsung Health is available
      const isAvailable = await healthService.isAvailable();
      if (!isAvailable) {
        console.log('Samsung Health not available on this device');
        return;
      }

      // Request permissions if not already granted
      const hasPermissions = await healthService.requestPermissions();
      if (!hasPermissions) {
        console.log('Samsung Health permissions not granted');
        return;
      }

      // Get today's health data
      const healthData = await healthService.getTodaysHealthData();
      
      // Update steps count
      await updateStepsCount(healthData.steps);
      
      // Convert steps to exercise minutes and add to existing exercise
      const stepsAsExercise = healthService.stepsToExerciseMinutes(healthData.steps);
      
      // Only update if we got meaningful step data
      if (healthData.steps > 0) {
        const updated = {
          ...todaysActivity,
          stepsCount: healthData.steps,
          // Add steps-based exercise to manual exercise (but don't double count)
          exerciseMinutes: Math.max(todaysActivity.exerciseMinutes, stepsAsExercise),
        };
        await saveTodaysActivity(updated);
      }

      console.log(`Synced Samsung Health data: ${healthData.steps} steps, ${healthData.distance}m distance`);
    } catch (error) {
      console.error('Failed to sync with Samsung Health:', error);
    }
  };

  const updateMoodRating = async (rating: number) => {
    const updated = {
      ...todaysActivity,
      moodRating: Math.max(1, Math.min(5, rating)),
    };
    await saveTodaysActivity(updated);
  };

  const addHealthNote = async (note: string) => {
    const updated = {
      ...todaysActivity,
      healthNotes: [...todaysActivity.healthNotes, note],
    };
    await saveTodaysActivity(updated);
  };

  const completeHabit = async (habitId: string) => {
    if (!todaysActivity.habitsCompleted.includes(habitId)) {
      const updated = {
        ...todaysActivity,
        habitsCompleted: [...todaysActivity.habitsCompleted, habitId],
      };
      await saveTodaysActivity(updated);

      const updatedStats = {
        ...userStats,
        totalHabitsCompleted: userStats.totalHabitsCompleted + 1,
      };
      await saveUserStats(updatedStats);
    }
  };

  const updateCaloriesConsumed = async (calories: number) => {
    const updated = {
      ...todaysActivity,
      caloriesConsumed: Math.max(0, calories),
    };
    await saveTodaysActivity(updated);
  };

  const updateCaloriesBurned = async (calories: number) => {
    const updated = {
      ...todaysActivity,
      caloriesBurned: Math.max(0, calories),
    };
    await saveTodaysActivity(updated);
  };

  const getTodaysProgress = () => {
    const waterProgress = Math.min(100, (todaysActivity.waterIntake / DAILY_TARGETS.waterIntake) * 100);
    const sleepProgress = Math.min(100, (todaysActivity.sleepHours / DAILY_TARGETS.sleepHours) * 100);
    const exerciseProgress = Math.min(100, (todaysActivity.exerciseMinutes / DAILY_TARGETS.exerciseMinutes) * 100);
    const stepsProgress = Math.min(100, (todaysActivity.stepsCount / DAILY_TARGETS.steps) * 100);
    
    // Combined fitness score from exercise and steps
    const combinedFitnessScore = Math.max(exerciseProgress, stepsProgress * 0.6); // Steps worth 60% of exercise
    
    // Comprehensive wellness calculation
    // Fitness: 35%, Hydration: 20%, Sleep: 30%, Mood: 15%
    const overallHealth = (combinedFitnessScore * 0.35) + (waterProgress * 0.2) + (sleepProgress * 0.3) + (todaysActivity.moodRating * 20 * 0.15);

    return {
      waterProgress,
      sleepProgress,
      exerciseProgress,
      stepsProgress,
      overallHealth: Math.min(100, overallHealth),
    };
  };

  const contextValue = useMemo(() => ({
    todaysActivity,
    userStats,
    updateWaterIntake,
    updateSleepHours,
    updateExerciseMinutes,
    updateStepsCount,
    syncWithSamsungHealth,
    updateMoodRating,
    addHealthNote,
    completeHabit,
    updateCaloriesConsumed,
    updateCaloriesBurned,
    getTodaysProgress,
  }), [todaysActivity, userStats]);

  return (
    <ActivityContext.Provider value={contextValue}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (undefined === context) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
};