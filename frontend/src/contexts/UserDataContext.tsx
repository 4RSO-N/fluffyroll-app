import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GoalMilestone {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  unit: string;
  isCompleted: boolean;
  completedDate?: string;
  achievedAt?: string;
  reward?: string;
}

export interface HealthGoal {
  id: string;
  type: 'lose_weight' | 'gain_weight' | 'build_muscle' | 'improve_endurance' | 'stay_healthy' | 'reduce_stress' | 'better_sleep' | 'increase_energy';
  name: string;
  target: number;
  currentProgress: number;
  unit: string;
  deadline?: string;
  createdAt: string;
  completedAt?: string;
  isCompleted: boolean;
  milestones: GoalMilestone[];
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'milestone' | 'goal_completion' | 'streak' | 'special';
  category: string;
  earnedDate: string;
  goalId?: string;
  milestoneId?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: string;
  progress: number;
  maxProgress: number;
  isEarned: boolean;
  earnedDate?: string;
}

export interface UserProfile {
  // Basic Info
  name: string;
  email: string;
  birthday: string; // ISO date string
  gender: 'male' | 'female' | 'other';
  
  // Physical Stats
  height: number; // in cm
  currentWeight: number; // in kg
  targetWeight?: number; // in kg
  
  // Fitness Info
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  fitnessGoals: HealthGoal[];
  achievements: Achievement[];
  badges: Badge[];
  
  // Health Info
  dailyCalorieGoal: number;
  waterGoal: number; // in ml
  sleepGoal: number; // in hours
  
  // Tracking
  joinDate: string; // ISO date string
  lastUpdated: string; // ISO date string
}

export interface WeightEntry {
  date: string; // ISO date string
  weight: number; // in kg
  notes?: string;
}

export interface CalorieEntry {
  date: string; // ISO date string
  consumed: number;
  burned?: number;
  goal: number;
}

interface UserDataContextType {
  userProfile: UserProfile | null;
  weightHistory: WeightEntry[];
  calorieHistory: CalorieEntry[];
  
  // Profile management
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  calculateAge: () => number;
  calculateBMI: () => number;
  
  // Weight tracking
  addWeightEntry: (weight: number, notes?: string) => Promise<void>;
  getWeightTrend: (days: number) => { change: number; trend: 'up' | 'down' | 'stable' };
  
  // Calorie tracking
  addCalorieEntry: (consumed: number, burned?: number) => Promise<void>;
  getTodaysCalories: () => CalorieEntry | null;
  getCalorieDeficit: () => number;
  
  // Health calculations
  getBMR: () => number; // Basal Metabolic Rate
  getTDEE: () => number; // Total Daily Energy Expenditure
  getRecommendedCalories: () => number;

  // Goal management
  addGoal: (goalData: Omit<HealthGoal, 'id' | 'createdAt' | 'currentProgress' | 'isCompleted'>) => Promise<void>;
  updateGoalProgress: (goalId: string, progress: number) => Promise<void>;
  completeGoal: (goalId: string) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  getGoalById: (goalId: string) => HealthGoal | undefined;
  getActiveGoals: () => HealthGoal[];
  getCompletedGoals: () => HealthGoal[];
  calculateGoalProgress: (goalId: string) => number;
  getGoalTimeRemaining: (goalId: string) => number;
  getWeightProgressForGoal: (goalId: string) => number;
  getGoalRecommendations: (goalId: string) => string[];
  getMilestoneAchievements: () => GoalMilestone[];
  
  // Goal-specific metrics
  trackExerciseSession: (duration: number, type: string, caloriesBurned?: number) => Promise<void>;
  trackSleepQuality: (hours: number, quality: number) => Promise<void>;
  trackStressLevel: (level: number, notes?: string) => Promise<void>;
  trackEnergyLevel: (level: number) => Promise<void>;
  getGoalSpecificMetrics: (goalId: string) => any;

  // Achievement system
  checkAndAwardAchievements: () => Promise<Achievement[]>;
  initializeBadges: () => Promise<void>;
  getEarnedAchievements: () => Achievement[];
  getEarnedBadges: () => Badge[];
  getBadgeProgress: () => Badge[];
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

const DEFAULT_PROFILE: Partial<UserProfile> = {
  name: '',
  email: '',
  birthday: '',
  gender: 'other',
  height: 170,
  currentWeight: 70,
  activityLevel: 'moderate',
  fitnessGoals: [],
  achievements: [],
  badges: [],
  dailyCalorieGoal: 2000,
  waterGoal: 2000,
  sleepGoal: 8,
  joinDate: new Date().toISOString().split('T')[0],
  lastUpdated: new Date().toISOString().split('T')[0],
};

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [calorieHistory, setCalorieHistory] = useState<CalorieEntry[]>([]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const [profileData, weightData, calorieData] = await Promise.all([
        AsyncStorage.getItem('user_profile'),
        AsyncStorage.getItem('weight_history'),
        AsyncStorage.getItem('calorie_history'),
      ]);

      if (profileData) {
        const profile = JSON.parse(profileData);
        
        // Migrate old string-based goals to new HealthGoal format
        if (profile.fitnessGoals && Array.isArray(profile.fitnessGoals)) {
          const migratedGoals = profile.fitnessGoals
            .map((goal: any) => {
              // If it's already a HealthGoal object, ensure it has milestones
              if (typeof goal === 'object' && goal.id) {
                return {
                  ...goal,
                  milestones: goal.milestones || []
                };
              }
              // If it's a string, skip it (we'll handle this in the UI)
              return null;
            })
            .filter((goal: any) => goal !== null); // Remove null entries
          
          profile.fitnessGoals = migratedGoals;
        } else {
          // Ensure fitnessGoals is always an array
          profile.fitnessGoals = [];
        }
        
        setUserProfile(profile);
      }
      if (weightData) {
        setWeightHistory(JSON.parse(weightData));
      }
      if (calorieData) {
        setCalorieHistory(JSON.parse(calorieData));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const updatedProfile = {
      ...DEFAULT_PROFILE,
      ...userProfile,
      ...updates,
      lastUpdated: new Date().toISOString().split('T')[0],
    } as UserProfile;

    try {
      await AsyncStorage.setItem('user_profile', JSON.stringify(updatedProfile));
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const calculateAge = (): number => {
    if (!userProfile?.birthday) return 0;
    
    const today = new Date();
    const birthDate = new Date(userProfile.birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const calculateBMI = (): number => {
    if (!userProfile?.height || !userProfile?.currentWeight) return 0;
    
    const heightInMeters = userProfile.height / 100;
    return userProfile.currentWeight / (heightInMeters * heightInMeters);
  };

  const addWeightEntry = async (weight: number, notes?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const newEntry: WeightEntry = {
      date: today,
      weight,
      notes,
    };

    // Remove any existing entry for today and add new one
    const updatedHistory = [
      ...weightHistory.filter(entry => entry.date !== today),
      newEntry,
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    try {
      await AsyncStorage.setItem('weight_history', JSON.stringify(updatedHistory));
      setWeightHistory(updatedHistory);

      // Update current weight in profile
      if (userProfile) {
        await updateProfile({ currentWeight: weight });
      }
    } catch (error) {
      console.error('Failed to add weight entry:', error);
      throw error;
    }
  };

  const getWeightTrend = (days: number = 7) => {
    if (weightHistory.length < 2) {
      return { change: 0, trend: 'stable' as const };
    }

    const recentEntries = weightHistory
      .slice(0, days)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (recentEntries.length < 2) {
      return { change: 0, trend: 'stable' as const };
    }

    const oldestWeight = recentEntries[0].weight;
    const newestWeight = recentEntries[recentEntries.length - 1].weight;
    const change = newestWeight - oldestWeight;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(change) >= 0.5) {
      trend = change > 0 ? 'up' : 'down';
    }

    return { change, trend };
  };

  const addCalorieEntry = async (consumed: number, burned?: number) => {
    const today = new Date().toISOString().split('T')[0];
    const newEntry: CalorieEntry = {
      date: today,
      consumed,
      burned,
      goal: userProfile?.dailyCalorieGoal || 2000,
    };

    // Remove any existing entry for today and add new one
    const updatedHistory = [
      ...calorieHistory.filter(entry => entry.date !== today),
      newEntry,
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    try {
      await AsyncStorage.setItem('calorie_history', JSON.stringify(updatedHistory));
      setCalorieHistory(updatedHistory);
    } catch (error) {
      console.error('Failed to add calorie entry:', error);
      throw error;
    }
  };

  const getTodaysCalories = (): CalorieEntry | null => {
    const today = new Date().toISOString().split('T')[0];
    return calorieHistory.find(entry => entry.date === today) || null;
  };

  const getCalorieDeficit = (): number => {
    const todaysEntry = getTodaysCalories();
    if (!todaysEntry) return 0;

    const tdee = getTDEE();
    const netCalories = todaysEntry.consumed - (todaysEntry.burned || 0);
    return tdee - netCalories;
  };

  // Mifflin-St Jeor Equation for BMR
  const getBMR = (): number => {
    if (!userProfile) return 0;
    
    const { currentWeight, height, gender } = userProfile;
    const age = calculateAge();
    
    if (gender === 'male') {
      return (10 * currentWeight) + (6.25 * height) - (5 * age) + 5;
    } else {
      return (10 * currentWeight) + (6.25 * height) - (5 * age) - 161;
    }
  };

  const getTDEE = (): number => {
    const bmr = getBMR();
    if (!userProfile) return bmr;

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    return bmr * activityMultipliers[userProfile.activityLevel];
  };

  const getRecommendedCalories = (): number => {
    if (!userProfile?.targetWeight) return getTDEE();
    
    const weightDiff = userProfile.currentWeight - userProfile.targetWeight;
    const tdee = getTDEE();
    
    // 1 kg of fat ≈ 7700 calories
    // Safe weight loss/gain: 0.5-1 kg per week
    const weeklyCalorieAdjustment = weightDiff > 0 ? -3500 : 3500; // 0.5 kg per week
    const dailyCalorieAdjustment = weeklyCalorieAdjustment / 7;
    
    return Math.round(tdee + dailyCalorieAdjustment);
  };

  // Goal management functions
  const addGoal = async (goalData: Omit<HealthGoal, 'id' | 'createdAt' | 'currentProgress' | 'isCompleted'>) => {
    if (!userProfile) return;

    const newGoal: HealthGoal = {
      ...goalData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      currentProgress: 0,
      isCompleted: false,
      milestones: goalData.milestones || []
    };

    const updatedGoals = [...userProfile.fitnessGoals, newGoal];
    await updateProfile({ fitnessGoals: updatedGoals });
  };

  const updateGoalProgress = async (goalId: string, progress: number) => {
    if (!userProfile) return;

    const updatedGoals = userProfile.fitnessGoals.map(goal => {
      if (goal.id === goalId) {
        const updatedGoal = { ...goal, currentProgress: progress };
        
        // Check if goal is completed
        if (progress >= goal.target && !goal.isCompleted) {
          updatedGoal.isCompleted = true;
          updatedGoal.completedAt = new Date().toISOString();
        }
        
        // Update milestone achievements
        updatedGoal.milestones = (goal.milestones || []).map(milestone => {
          const targetProgress = (milestone.targetValue / goal.target) * goal.target;
          if (progress >= targetProgress && !milestone.isCompleted) {
            return { ...milestone, isCompleted: true, completedDate: new Date().toISOString() };
          }
          return milestone;
        });
        
        return updatedGoal;
      }
      return goal;
    });

    await updateProfile({ fitnessGoals: updatedGoals });
  };

  const completeGoal = async (goalId: string) => {
    if (!userProfile) return;

    const updatedGoals = userProfile.fitnessGoals.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          isCompleted: true,
          completedAt: new Date().toISOString(),
          currentProgress: goal.target
        };
      }
      return goal;
    });

    await updateProfile({ fitnessGoals: updatedGoals });
  };

  const deleteGoal = async (goalId: string) => {
    if (!userProfile) return;

    const updatedGoals = userProfile.fitnessGoals.filter(goal => goal.id !== goalId);
    await updateProfile({ fitnessGoals: updatedGoals });
  };

  const getGoalById = (goalId: string): HealthGoal | undefined => {
    return userProfile?.fitnessGoals.find(goal => goal.id === goalId);
  };

  const getActiveGoals = (): HealthGoal[] => {
    return userProfile?.fitnessGoals.filter(goal => !goal.isCompleted) || [];
  };

  const getCompletedGoals = (): HealthGoal[] => {
    return userProfile?.fitnessGoals.filter(goal => goal.isCompleted) || [];
  };

  const calculateGoalProgress = (goalId: string): number => {
    const goal = getGoalById(goalId);
    if (!goal) return 0;
    
    // Ensure we have valid numbers for the calculation
    const currentProgress = typeof goal.currentProgress === 'number' ? goal.currentProgress : 0;
    const target = typeof goal.target === 'number' && goal.target > 0 ? goal.target : 1;
    
    const percentage = (currentProgress / target) * 100;
    
    // Return a valid number, capped at 100%
    return Math.min(isNaN(percentage) ? 0 : percentage, 100);
  };

  // Advanced goal calculations
  const getGoalTimeRemaining = (goalId: string): number => {
    const goal = getGoalById(goalId);
    if (!goal?.deadline) return -1;
    
    const deadline = new Date(goal.deadline);
    const now = new Date();
    const timeDiff = deadline.getTime() - now.getTime();
    
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Days remaining
  };

  const calculateWeightLossProgress = (currentWeight: number, targetWeight: number, startingWeight: number): number => {
    const totalToLose = startingWeight - targetWeight;
    if (totalToLose <= 0) return 0;
    
    const lostSoFar = startingWeight - currentWeight;
    const percentage = (lostSoFar / totalToLose) * 100;
    return Math.min(isNaN(percentage) ? 0 : percentage, 100);
  };

  const calculateWeightGainProgress = (currentWeight: number, targetWeight: number, startingWeight: number): number => {
    const totalToGain = targetWeight - startingWeight;
    if (totalToGain <= 0) return 0;
    
    const gainedSoFar = currentWeight - startingWeight;
    const percentage = (gainedSoFar / totalToGain) * 100;
    return Math.min(isNaN(percentage) ? 0 : percentage, 100);
  };

  const getWeightProgressForGoal = (goalId: string): number => {
    const goal = getGoalById(goalId);
    if (!goal || !userProfile) return 0;
    
    if (goal.type === 'lose_weight' || goal.type === 'gain_weight') {
      const currentWeight = typeof userProfile.currentWeight === 'number' ? userProfile.currentWeight : 70;
      const targetWeight = typeof goal.target === 'number' ? goal.target : currentWeight;
      const startingWeight = userProfile.height ? currentWeight : 70;
      
      if (goal.type === 'lose_weight') {
        return calculateWeightLossProgress(currentWeight, targetWeight, startingWeight);
      } else {
        return calculateWeightGainProgress(currentWeight, targetWeight, startingWeight);
      }
    }
    
    return typeof goal.currentProgress === 'number' ? goal.currentProgress : 0;
  };

  const getWeightLossRecommendations = (progress: number): string[] => {
    if (progress < 25) {
      return [
        'Start with a moderate calorie deficit',
        'Add 30 minutes of cardio daily'
      ];
    } else if (progress < 75) {
      return [
        'Maintain consistent eating patterns',
        'Add strength training 2-3x per week'
      ];
    } else {
      return ['Focus on maintenance and lifestyle habits'];
    }
  };

  const getMuscleBuildingtRecommendations = (progress: number): string[] => {
    const recommendations = [
      'Consume protein within 30 minutes post-workout',
      'Progressive overload training 3-4x per week'
    ];
    if (progress < 50) {
      recommendations.push('Focus on compound movements');
    }
    return recommendations;
  };

  const getEnduranceRecommendations = (progress: number): string[] => {
    const recommendations = ['Gradually increase workout duration'];
    if (progress < 30) {
      recommendations.push('Start with low-intensity steady-state cardio');
    } else {
      recommendations.push('Add interval training sessions');
    }
    return recommendations;
  };

  const getSleepRecommendations = (): string[] => {
    return [
      'Maintain consistent sleep schedule',
      'Avoid screens 1 hour before bed',
      'Keep bedroom cool and dark'
    ];
  };

  const getGoalRecommendations = (goalId: string): string[] => {
    const goal = getGoalById(goalId);
    if (!goal) return [];
    
    const progress = calculateGoalProgress(goalId);
    const timeRemaining = getGoalTimeRemaining(goalId);
    let recommendations: string[] = [];
    
    switch (goal.type) {
      case 'lose_weight':
        recommendations = getWeightLossRecommendations(progress);
        break;
      case 'build_muscle':
        recommendations = getMuscleBuildingtRecommendations(progress);
        break;
      case 'improve_endurance':
        recommendations = getEnduranceRecommendations(progress);
        break;
      case 'better_sleep':
        recommendations = getSleepRecommendations();
        break;
      default:
        recommendations = [
          'Stay consistent with your routine',
          'Track your progress regularly'
        ];
    }
    
    if (timeRemaining > 0 && timeRemaining < 30) {
      recommendations.push('You\'re in the final stretch - stay focused!');
    }
    
    return recommendations;
  };

  const getMilestoneAchievements = (): GoalMilestone[] => {
    if (!userProfile) return [];
    
    const allMilestones: GoalMilestone[] = [];
    userProfile.fitnessGoals.forEach(goal => {
      if (goal.milestones && goal.milestones.length > 0) {
        goal.milestones.forEach(milestone => {
          if (milestone.isCompleted) {
            allMilestones.push(milestone);
          }
        });
      }
    });
    
    return allMilestones.sort((a, b) => {
      const dateA = new Date(a.completedDate || '').getTime();
      const dateB = new Date(b.completedDate || '').getTime();
      return dateB - dateA; // Most recent first
    });
  };

  // Goal-specific metrics tracking
  const trackExerciseSession = async (duration: number, type: string, caloriesBurned?: number) => {
    if (!userProfile) return;

    // Update relevant fitness goals
    const updatedGoals = userProfile.fitnessGoals.map(goal => {
      if (goal.type === 'improve_endurance' || goal.type === 'build_muscle') {
        const newProgress = goal.currentProgress + duration;
        return { ...goal, currentProgress: Math.min(newProgress, goal.target) };
      }
      return goal;
    });

    await updateProfile({ fitnessGoals: updatedGoals });
    
    // Track calories if provided
    if (caloriesBurned) {
      await addCalorieEntry(0, caloriesBurned);
    }
  };

  const trackSleepQuality = async (hours: number, quality: number) => {
    if (!userProfile) return;

    // Update sleep-related goals
    const updatedGoals = userProfile.fitnessGoals.map(goal => {
      if (goal.type === 'better_sleep') {
        const newProgress = Math.min(goal.currentProgress + hours, goal.target);
        return { ...goal, currentProgress: newProgress };
      }
      return goal;
    });

    await updateProfile({ fitnessGoals: updatedGoals });
  };

  const trackStressLevel = async (level: number, notes?: string) => {
    if (!userProfile) return;

    // Update stress reduction goals
    const updatedGoals = userProfile.fitnessGoals.map(goal => {
      if (goal.type === 'reduce_stress') {
        // Lower stress levels = higher progress towards goal
        const stressReduction = Math.max(0, 10 - level); // Invert scale
        const newProgress = Math.min(goal.currentProgress + stressReduction, goal.target);
        return { ...goal, currentProgress: newProgress };
      }
      return goal;
    });

    await updateProfile({ fitnessGoals: updatedGoals });
  };

  const trackEnergyLevel = async (level: number) => {
    if (!userProfile) return;

    // Update energy-related goals
    const updatedGoals = userProfile.fitnessGoals.map(goal => {
      if (goal.type === 'increase_energy') {
        const newProgress = Math.min(goal.currentProgress + level, goal.target);
        return { ...goal, currentProgress: newProgress };
      }
      return goal;
    });

    await updateProfile({ fitnessGoals: updatedGoals });
  };

  const getGoalSpecificMetrics = (goalId: string): any => {
    const goal = getGoalById(goalId);
    if (!goal) return null;

    const metrics: any = {
      progress: calculateGoalProgress(goalId),
      timeRemaining: getGoalTimeRemaining(goalId),
      recommendations: getGoalRecommendations(goalId),
    };

    switch (goal.type) {
      case 'lose_weight':
      case 'gain_weight':
        metrics.weightProgress = getWeightProgressForGoal(goalId);
        metrics.bmi = calculateBMI();
        metrics.recommendedCalories = getRecommendedCalories();
        break;
      
      case 'build_muscle':
        metrics.currentWeight = userProfile?.currentWeight;
        metrics.recommendedProtein = userProfile ? Math.round(userProfile.currentWeight * 2.2) : 0; // 2.2g per kg
        break;
      
      case 'improve_endurance':
        metrics.weeklyMinutes = goal.currentProgress;
        metrics.targetMinutes = goal.target;
        break;
      
      case 'better_sleep':
        metrics.averageHours = goal.currentProgress / 7; // Assuming weekly tracking
        metrics.targetHours = goal.target / 7;
        break;
      
      case 'reduce_stress':
        metrics.stressReduction = goal.currentProgress;
        metrics.targetReduction = goal.target;
        break;
      
      case 'increase_energy':
        metrics.energyImprovement = goal.currentProgress;
        metrics.targetImprovement = goal.target;
        break;
    }

    return metrics;
  };

  // Achievement System
  const createDefaultBadges = (): Badge[] => {
    return [
      {
        id: 'first_goal',
        name: 'Goal Setter',
        description: 'Set your first health goal',
        icon: '🎯',
        color: '#4CAF50',
        requirement: 'Create 1 goal',
        progress: 0,
        maxProgress: 1,
        isEarned: false
      },
      {
        id: 'goal_achiever',
        name: 'Achiever',
        description: 'Complete your first goal',
        icon: '🏆',
        color: '#FF9800',
        requirement: 'Complete 1 goal',
        progress: 0,
        maxProgress: 1,
        isEarned: false
      },
      {
        id: 'milestone_master',
        name: 'Milestone Master',
        description: 'Reach 5 milestones',
        icon: '⭐',
        color: '#9C27B0',
        requirement: 'Complete 5 milestones',
        progress: 0,
        maxProgress: 5,
        isEarned: false
      },
      {
        id: 'weight_warrior',
        name: 'Weight Warrior',
        description: 'Lose or gain 5kg',
        icon: '💪',
        color: '#F44336',
        requirement: 'Reach weight target',
        progress: 0,
        maxProgress: 5,
        isEarned: false
      },
      {
        id: 'consistency_champion',
        name: 'Consistency Champion',
        description: 'Track progress for 30 days',
        icon: '📈',
        color: '#2196F3',
        requirement: 'Track for 30 days',
        progress: 0,
        maxProgress: 30,
        isEarned: false
      }
    ];
  };

  const checkAndAwardAchievements = async (): Promise<Achievement[]> => {
    if (!userProfile) return [];

    const newAchievements: Achievement[] = [];
    const updatedBadges = [...userProfile.badges];

    // Check Goal Setter badge
    const goalSetterBadge = updatedBadges.find(b => b.id === 'first_goal');
    if (goalSetterBadge && !goalSetterBadge.isEarned && userProfile.fitnessGoals.length >= 1) {
      goalSetterBadge.isEarned = true;
      goalSetterBadge.earnedDate = new Date().toISOString();
      goalSetterBadge.progress = 1;
      
      newAchievements.push({
        id: Date.now().toString(),
        title: 'Goal Setter!',
        description: 'You set your first health goal!',
        icon: '🎯',
        type: 'special',
        category: 'Goals',
        earnedDate: new Date().toISOString()
      });
    }

    // Check Achiever badge
    const achieverBadge = updatedBadges.find(b => b.id === 'goal_achiever');
    const completedGoals = userProfile.fitnessGoals.filter(g => g.isCompleted).length;
    if (achieverBadge && !achieverBadge.isEarned && completedGoals >= 1) {
      achieverBadge.isEarned = true;
      achieverBadge.earnedDate = new Date().toISOString();
      achieverBadge.progress = 1;
      
      newAchievements.push({
        id: Date.now().toString() + '_achiever',
        title: 'First Achievement!',
        description: 'You completed your first goal!',
        icon: '🏆',
        type: 'goal_completion',
        category: 'Goals',
        earnedDate: new Date().toISOString()
      });
    }

    // Check Milestone Master badge
    const milestoneBadge = updatedBadges.find(b => b.id === 'milestone_master');
    const completedMilestones = getMilestoneAchievements().length;
    if (milestoneBadge && !milestoneBadge.isEarned) {
      milestoneBadge.progress = Math.min(completedMilestones, 5);
      if (completedMilestones >= 5) {
        milestoneBadge.isEarned = true;
        milestoneBadge.earnedDate = new Date().toISOString();
        
        newAchievements.push({
          id: Date.now().toString() + '_milestone',
          title: 'Milestone Master!',
          description: 'You reached 5 milestones!',
          icon: '⭐',
          type: 'milestone',
          category: 'Progress',
          earnedDate: new Date().toISOString()
        });
      }
    }

    // Update profile with new achievements and badges
    if (newAchievements.length > 0 || updatedBadges.some(b => b.progress > 0)) {
      await updateProfile({
        achievements: [...userProfile.achievements, ...newAchievements],
        badges: updatedBadges
      });
    }

    return newAchievements;
  };

  const initializeBadges = async () => {
    if (!userProfile || userProfile.badges.length > 0) return;
    
    const defaultBadges = createDefaultBadges();
    await updateProfile({ badges: defaultBadges });
  };

  const getEarnedAchievements = (): Achievement[] => {
    return userProfile?.achievements || [];
  };

  const getEarnedBadges = (): Badge[] => {
    return userProfile?.badges.filter(b => b.isEarned) || [];
  };

  const getBadgeProgress = (): Badge[] => {
    return userProfile?.badges || [];
  };

  const contextValue = useMemo(() => ({
    userProfile,
    weightHistory,
    calorieHistory,
    updateProfile,
    calculateAge,
    calculateBMI,
    addWeightEntry,
    getWeightTrend,
    addCalorieEntry,
    getTodaysCalories,
    getCalorieDeficit,
    getBMR,
    getTDEE,
    getRecommendedCalories,
    addGoal,
    updateGoalProgress,
    completeGoal,
    deleteGoal,
    getGoalById,
    getActiveGoals,
    getCompletedGoals,
    calculateGoalProgress,
    getGoalTimeRemaining,
    getWeightProgressForGoal,
    getGoalRecommendations,
    getMilestoneAchievements,
    trackExerciseSession,
    trackSleepQuality,
    trackStressLevel,
    trackEnergyLevel,
    getGoalSpecificMetrics,
    checkAndAwardAchievements,
    initializeBadges,
    getEarnedAchievements,
    getEarnedBadges,
    getBadgeProgress,
  }), [userProfile, weightHistory, calorieHistory]);

  return (
    <UserDataContext.Provider value={contextValue}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};