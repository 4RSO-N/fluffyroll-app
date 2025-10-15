import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Dimensions,
  StatusBar,
} from 'react-native';
import Animated, {
  FadeInUp,
  FadeInDown,
  ZoomIn,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useActivity } from '../../contexts/ActivityContext';
import { useUserData } from '../../contexts/UserDataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { fitnessAPI } from '../../services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { WarmTheme } from '../../constants/warmTheme';
import CustomAlert from '../../components/CustomAlert';
import ModalButton from '../../components/ModalButton';
import StepsCounter from '../../components/StepsCounter';
import { useCustomAlert } from '../../hooks/useCustomAlert';

const { height: screenHeight } = Dimensions.get('window');

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);


interface DashboardGoal {
  id: number;
  title: string;
  progress: number;
  target: number;
  unit: string;
}

interface DashboardData {
  caloriesConsumed: number;
  caloriesGoal: number;
  proteinConsumed: number;
  proteinGoal: number;
  carbsConsumed: number;
  carbsGoal: number;
  fatConsumed: number;
  fatGoal: number;
  waterIntake: number;
  waterGoal: number;
  workoutsCompleted: number;
  mealsCount: number;
  goals: DashboardGoal[];
}

const defaultDashboard: DashboardData = {
  caloriesConsumed: 0,
  caloriesGoal: 2000,
  proteinConsumed: 0,
  proteinGoal: 150,
  carbsConsumed: 0,
  carbsGoal: 200,
  fatConsumed: 0,
  fatGoal: 65,
  waterIntake: 0,
  waterGoal: 8,
  workoutsCompleted: 0,
  mealsCount: 0,
  goals: [
    { id: 1, title: 'Daily Water Intake', progress: 0, target: 8, unit: 'glasses' },
    { id: 2, title: 'Daily Calories', progress: 0, target: 2000, unit: 'kcal' },
    { id: 3, title: 'Weekly Workouts', progress: 0, target: 5, unit: 'sessions' }
  ]
};

export default function AnimatedDashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const { userProfile } = useUserData();
  const { getTodaysProgress, userStats } = useActivity();
  const { colors } = useTheme();
  const { alertConfig, isVisible, hideAlert, showInfo, showError } = useCustomAlert();

  const [dashboard, setDashboard] = useState<DashboardData>(defaultDashboard);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Modal states
  const [waterModalVisible, setWaterModalVisible] = useState(false);
  const [mealModalVisible, setMealModalVisible] = useState(false);
  const [waterGlasses, setWaterGlasses] = useState('1');
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');

  // Success animation states
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  useEffect(() => {
    loadDashboard();
    loadWeeklyData();
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    // No mock notifications - empty array for clean state
    const mockNotifications: any[] = [];
    setNotifications(mockNotifications);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationPress = () => {
    const unreadCount = notifications.filter(n => !n.read).length;
    if (unreadCount === 0) {
      showInfo('Notifications', 'No new notifications 🔔');
    } else {
      const notificationList = notifications
        .filter(n => !n.read)
        .map(n => `• ${n.title}: ${n.message}`)
        .join('\n');
      
      showInfo(
        'Notifications',
        `You have ${unreadCount} new notifications:\n\n${notificationList}`,
        markAllNotificationsAsRead
      );
    }
  };

  const loadDashboard = async () => {
    try {
      const data = await fitnessAPI.getDashboard();
      // Ensure we have goals data
      const mergedData: DashboardData = {
        ...defaultDashboard,
        ...data,
        goals: data?.goals || defaultDashboard.goals
      };
      setDashboard(mergedData);
    } catch (error: any) {
      console.error('Load dashboard error:', error);
      if (error.response?.status === 403 || error.response?.status === 404) {
        // Use mock data for development/demo
        setDashboard({
          ...defaultDashboard,
          caloriesConsumed: 1850,
          proteinConsumed: 120,
          carbsConsumed: 180,
          fatConsumed: 55,
          waterIntake: 6,
          waterGoal: 8,
          workoutsCompleted: 1,
          mealsCount: 3,
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      
      // Animate refresh completion

    }
  };

  const loadWeeklyData = async () => {
    // Mock weekly data load with slight delay for staggered animations
    await new Promise(resolve => setTimeout(resolve, 200));
    // Weekly data processing would happen here
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    loadDashboard();
    loadWeeklyData();
  }, []);

  const showSuccessNotification = useCallback((message: string) => {
    setShowSuccessAnimation(true);

    
    setTimeout(() => {
      setShowSuccessAnimation(false);
    }, 3000);
  }, []);

  const handleLogWater = async () => {
    try {
      await fitnessAPI.logWater(parseInt(waterGlasses));
      setWaterModalVisible(false);
      setWaterGlasses('1');
      showSuccessNotification('Water logged! 💧');
      
      // Haptic feedback would go here
      loadDashboard();
    } catch (error) {
      console.error('Failed to log water:', error);
      showError('Error', 'Failed to log water');
    }
  };

  const handleLogMeal = async () => {
    if (!mealName || !calories) {
      showError('Missing Information', 'Please fill in meal name and calories');
      return;
    }

    try {
      await fitnessAPI.createMeal({
        mealType: 'snack',
        mealName,
        consumedAt: new Date().toISOString(),
        items: [
          {
            foodName: mealName,
            servingSize: '1 serving',
            servingQuantity: 1,
            calories: parseInt(calories),
            protein_g: protein ? parseInt(protein) : 0,
            carbs_g: 0,
            fat_g: 0,
          },
        ],
      });
      setMealModalVisible(false);
      setMealName('');
      setCalories('');
      setProtein('');
      showSuccessNotification('Meal logged! 🍽️');
      loadDashboard();
    } catch (error) {
      console.error('Failed to log meal:', error);
      showError('Error', 'Failed to log meal');
    }
  };





  const generateInsights = () => {
    const insights = [];
    
    if (dashboard) {
      const caloriesPercent = (dashboard.caloriesConsumed / dashboard.caloriesGoal) * 100;
      const waterPercent = (dashboard.waterIntake / dashboard.waterGoal) * 100;
      
      if (caloriesPercent > 90) {
        insights.push({
          title: "Outstanding Progress!",
          message: "You're crushing your calorie goals today. Your dedication shows!",
          type: 'success' as const,
          icon: 'trophy',
        });
      } else if (caloriesPercent < 70) {
        insights.push({
          title: "Fuel Your Body",
          message: "Consider adding a nutritious snack to reach your energy goals.",
          type: 'warning' as const,
          actionText: "Quick Add",
          icon: 'nutrition',
          onAction: () => setMealModalVisible(true),
        });
      }
      
      if (waterPercent < 50) {
        insights.push({
          title: "Hydration Boost Needed",
          message: "Your body needs more water to perform at its best!",
          type: 'info' as const,
          actionText: "Drink Up",
          icon: 'water-outline',
          onAction: () => setWaterModalVisible(true),
        });
      }
      
      if (dashboard.workoutsCompleted === 0) {
        insights.push({
          title: "Movement Moment",
          message: "Even a short walk can boost your mood and energy.",
          type: 'tip' as const,
          icon: 'walk',
        });
      }
    }
    
    return insights;
  };

  const calculateHealthScore = () => {
    if (!dashboard) return { score: 0, breakdown: { fitness: 0, nutrition: 0, hydration: 0 } };
    
    // Fitness Score - Based on workouts and steps (using ActivityContext data)
    const activityProgress = getTodaysProgress();
    const workoutScore = dashboard.workoutsCompleted * 50; // 50 points per workout
    const stepsScore = activityProgress.stepsProgress * 0.6; // Steps worth 60% of full exercise
    const fitnessScore = Math.min(Math.max(workoutScore, stepsScore), 100);
    
    // Nutrition Score - Comprehensive macronutrient tracking
    const caloriesScore = Math.min((dashboard.caloriesConsumed / dashboard.caloriesGoal) * 100, 100);
    const proteinScore = Math.min((dashboard.proteinConsumed / dashboard.proteinGoal) * 100, 100);
    const carbsScore = Math.min((dashboard.carbsConsumed / dashboard.carbsGoal) * 100, 100);
    const fatScore = Math.min((dashboard.fatConsumed / dashboard.fatGoal) * 100, 100);
    
    // Weighted nutrition score: calories 40%, protein 30%, carbs 20%, fats 10%
    const nutritionScore = (caloriesScore * 0.4) + (proteinScore * 0.3) + (carbsScore * 0.2) + (fatScore * 0.1);
    
    // Hydration Score - Keep as is, it's already good
    const hydrationScore = Math.min((dashboard.waterIntake / dashboard.waterGoal) * 100, 100);
    
    // Overall Score - Balanced weighting
    const overallScore = (fitnessScore * 0.35) + (nutritionScore * 0.45) + (hydrationScore * 0.2);
    
    return {
      score: overallScore,
      breakdown: {
        fitness: Math.round(fitnessScore),
        nutrition: Math.round(nutritionScore),
        hydration: Math.round(hydrationScore),
      },
    };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View entering={ZoomIn.duration(600).springify()}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your wellness journey...</Text>
        </Animated.View>
      </View>
    );
  }

  const insights = generateInsights();
  const healthData = calculateHealthScore();
  const currentHour = new Date().getHours();
  const getGreeting = (hour: number): string => {
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };
  const greeting = getGreeting(currentHour);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      {/* Beige Background Gradient */}
      <LinearGradient
        colors={WarmTheme.gradients.pageBackground as [string, string, string]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <ScrollView
        style={[styles.scrollContainer, { backgroundColor: 'transparent' }]}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="white"
            colors={[Colors.primary]}
          />
        }
      >
        {/* Enhanced Header with Better Layout */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              {/* Main Header Info */}
              <View style={styles.headerMain}>
                <Animated.Text 
                  style={styles.greeting}
                  entering={FadeInUp.delay(200)}
                >
                  {greeting}, {userProfile?.name || user?.displayName || 'there'}!
                </Animated.Text>
                <Animated.Text 
                  style={styles.date}
                  entering={FadeInUp.delay(300)}
                >
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Animated.Text>
              </View>
              
              {/* Header Actions */}
              <Animated.View style={styles.headerActions} entering={FadeInUp.delay(300)}>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={handleNotificationPress}
                >
                  <Ionicons name="notifications-outline" size={20} color="#8B4513" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.badgeText}>{notifications.filter(n => !n.read).length}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </Animated.View>

        {/* Quick Stats Bar */}
        <Animated.View style={styles.quickStatsContainer} entering={FadeInUp.delay(400)}>
          <View style={styles.quickStatsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.totalWorkouts}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.round(healthData.score)}%</Text>
              <Text style={styles.statLabel}>Wellness</Text>
            </View>
          </View>
        </Animated.View>

        {/* Main Dashboard Grid - Compact Layout */}
        <View style={styles.mainContent}>
          
          {/* Enhanced Wellness Score Card */}
          <Animated.View entering={FadeInUp.delay(500)} style={styles.topRow}>
            <View style={styles.wellnessCard}>
              <View
                style={[styles.cardGradient, { backgroundColor: Colors.surface }]}
              >
                <View style={styles.wellnessContent}>
                  <Text style={styles.wellnessLabel}>Wellness Score</Text>
                  <View style={styles.scoreDisplay}>
                    <Text style={styles.wellnessScore}>{Math.round(healthData.score)}</Text>
                    <Text style={styles.scorePercentage}>%</Text>
                  </View>
                </View>
                
                <View style={styles.wellnessBreakdown}>
                  <View style={styles.breakdownItem}>
                    <View style={[styles.dot, { backgroundColor: '#FF6347' }]} />
                    <Text style={styles.dotLabel}>Fitness</Text>
                    <Text style={styles.dotValue}>{healthData.breakdown.fitness}%</Text>
                  </View>
                  <View style={styles.breakdownItem}>
                    <View style={[styles.dot, { backgroundColor: '#FF8C42' }]} />
                    <Text style={styles.dotLabel}>Nutrition</Text>
                    <Text style={styles.dotValue}>{healthData.breakdown.nutrition}%</Text>
                  </View>
                  <View style={styles.breakdownItem}>
                    <View style={[styles.dot, { backgroundColor: '#D2691E' }]} />
                    <Text style={styles.dotLabel}>Hydration</Text>
                    <Text style={styles.dotValue}>{healthData.breakdown.hydration}%</Text>
                  </View>
                </View>
              </View>
            </View>
            
            {/* Enhanced Quick Actions */}
            <View style={styles.quickActionsCompact}>
              <View
                style={[styles.cardGradient, { backgroundColor: Colors.surface }]}
              >
                <Text style={styles.actionsTitle}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                  <TouchableOpacity style={styles.compactAction} onPress={() => setWaterModalVisible(true)}>
                    <View style={[styles.actionIconContainer, { backgroundColor: '#4682B4' }]}>
                      <Ionicons name="water-outline" size={20} color="white" />
                    </View>
                    <Text style={styles.actionLabel}>Water</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.compactAction} onPress={() => setMealModalVisible(true)}>
                    <View style={[styles.actionIconContainer, { backgroundColor: '#FF6B35' }]}>
                      <Ionicons name="restaurant-outline" size={20} color="white" />
                    </View>
                    <Text style={styles.actionLabel}>Meal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.compactAction} onPress={() => showInfo('Coming Soon', 'Journal feature! 📝')}>
                    <View style={[styles.actionIconContainer, { backgroundColor: '#D2691E' }]}>
                      <Ionicons name="book-outline" size={20} color="white" />
                    </View>
                    <Text style={styles.actionLabel}>Journal</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Enhanced Progress Section */}
          <Animated.View entering={FadeInUp.delay(600)} style={styles.progressRow}>
            <View
              style={[styles.progressCard, { backgroundColor: Colors.surface }]}
            >
              <Text style={styles.progressTitle}>Today's Progress</Text>
              <View style={styles.progressGrid}>
                {/* Calories Progress */}
                <View style={styles.progressItemCard}>
                  <View style={styles.progressHeader}>
                    <View style={[styles.progressIcon, { backgroundColor: '#DC143C' }]}>
                      <Ionicons name="flame-outline" size={18} color="white" />
                    </View>
                    <Text style={styles.progressLabel}>Calories</Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar}>
                      <Animated.View 
                        style={[styles.progressFill, { 
                          width: `${Math.min(((dashboard?.caloriesConsumed || 0) / (dashboard?.caloriesGoal || 2000)) * 100, 100)}%`,
                          backgroundColor: '#DC143C',
                        }]} 
                      />
                    </View>
                    <Text style={styles.progressPercentage}>
                      {Math.round(((dashboard?.caloriesConsumed || 0) / (dashboard?.caloriesGoal || 2000)) * 100)}%
                    </Text>
                  </View>
                  <Text style={styles.progressText}>
                    {dashboard?.caloriesConsumed || 0} / {dashboard?.caloriesGoal || 2000} cal
                  </Text>
                </View>
                
                {/* Water Progress */}
                <View style={styles.progressItemCard}>
                  <View style={styles.progressHeader}>
                    <View style={[styles.progressIcon, { backgroundColor: '#4682B4' }]}>
                      <Ionicons name="water-outline" size={18} color="white" />
                    </View>
                    <Text style={styles.progressLabel}>Water</Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar}>
                      <Animated.View 
                        style={[styles.progressFill, { 
                          width: `${Math.min(((dashboard?.waterIntake || 0) / (dashboard?.waterGoal || 8)) * 100, 100)}%`,
                          backgroundColor: '#4682B4',
                        }]} 
                      />
                    </View>
                    <Text style={styles.progressPercentage}>
                      {Math.round(((dashboard?.waterIntake || 0) / (dashboard?.waterGoal || 8)) * 100)}%
                    </Text>
                  </View>
                  <Text style={styles.progressText}>
                    {dashboard?.waterIntake || 0} / {dashboard?.waterGoal || 8} glasses
                  </Text>
                </View>

                {/* Exercise Progress */}
                <View style={styles.progressItemCard}>
                  <View style={styles.progressHeader}>
                    <View style={[styles.progressIcon, { backgroundColor: '#DC143C' }]}>
                      <Ionicons name="fitness-outline" size={18} color="white" />
                    </View>
                    <Text style={styles.progressLabel}>Exercise</Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar}>
                      <Animated.View 
                        style={[styles.progressFill, { 
                          width: `${dashboard?.workoutsCompleted > 0 ? 100 : 0}%`,
                          backgroundColor: '#DC143C',
                        }]} 
                      />
                    </View>
                    <Text style={styles.progressPercentage}>
                      {dashboard?.workoutsCompleted > 0 ? 100 : 0}%
                    </Text>
                  </View>
                  <Text style={styles.progressText}>
                    {dashboard?.workoutsCompleted || 0} completed
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Steps Counter Section */}
          <Animated.View entering={FadeInUp.delay(650)} style={styles.stepsRow}>
            <StepsCounter />
          </Animated.View>

          {/* Enhanced Insights Section */}
          {insights.length > 0 && (
            <Animated.View entering={FadeInUp.delay(700)} style={styles.insightsRow}>
              <View
                style={[styles.insightsCard, { backgroundColor: Colors.surface }]}
              >
                <Text style={styles.insightsTitle}>💡 Smart Insight</Text>
                <Text style={styles.insightText}>{insights[0]?.title}</Text>
                <Text style={styles.insightMessage}>{insights[0]?.message}</Text>
                {insights[0]?.onAction && (
                  <TouchableOpacity style={styles.insightAction} onPress={insights[0].onAction}>
                    <Text style={styles.insightActionText}>{insights[0]?.actionText || 'Take Action'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          )}
          
        </View>
        
        <View style={{ paddingBottom: 100 }} />
      </ScrollView>

      {/* Floating Success Notification */}
      {showSuccessAnimation && (
        <Animated.View style={styles.successNotification}>
          <BlurView intensity={80} style={styles.successBlur}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
            <Text style={styles.successText}>Success! 🎉</Text>
          </BlurView>
        </Animated.View>
      )}

      {/* Enhanced Modals with Warm White Theme */}
      <Modal
        visible={waterModalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setWaterModalVisible(false)}
      >
        <BlurView intensity={100} style={styles.modalOverlay}>
          <Animated.View 
            style={styles.modalContent}
            entering={ZoomIn.springify()}
          >
            <LinearGradient
              colors={['rgba(255,248,240,0.98)', 'rgba(255,248,240,0.95)']}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <View style={[styles.modalIconContainer, { backgroundColor: '#FF7F50' }]}>
                  <Ionicons name="water-outline" size={24} color="white" />
                </View>
                <Text style={styles.modalTitle}>Log Water</Text>
              </View>
              <Text style={styles.modalSubtitle}>Stay hydrated, stay healthy!</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Number of Glasses</Text>
                <TextInput
                  style={styles.input}
                  value={waterGlasses}
                  onChangeText={setWaterGlasses}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>

              <View style={styles.modalButtons}>
                <ModalButton
                  title="Cancel"
                  type="cancel"
                  onPress={() => setWaterModalVisible(false)}
                />
                <ModalButton
                  title="Log Water"
                  type="primary"
                  onPress={handleLogWater}
                />
              </View>
            </LinearGradient>
          </Animated.View>
        </BlurView>
      </Modal>

      <Modal
        visible={mealModalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setMealModalVisible(false)}
      >
        <BlurView intensity={100} style={styles.modalOverlay}>
          <Animated.View 
            style={styles.modalContent}
            entering={ZoomIn.springify()}
          >
            <LinearGradient
              colors={['rgba(255,248,240,0.98)', 'rgba(255,248,240,0.95)']}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <View style={[styles.modalIconContainer, { backgroundColor: '#FF8C42' }]}>
                  <Ionicons name="restaurant-outline" size={24} color="white" />
                </View>
                <Text style={styles.modalTitle}>Log Meal</Text>
              </View>
              <Text style={styles.modalSubtitle}>Fuel your body right!</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Meal Name</Text>
                <TextInput
                  style={styles.input}
                  value={mealName}
                  onChangeText={setMealName}
                  placeholder="e.g., Grilled Chicken Salad"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Calories</Text>
                <TextInput
                  style={styles.input}
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="numeric"
                  placeholder="e.g., 350"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Protein (g) - Optional</Text>
                <TextInput
                  style={styles.input}
                  value={protein}
                  onChangeText={setProtein}
                  keyboardType="numeric"
                  placeholder="e.g., 30"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>

              <View style={styles.modalButtons}>
                <ModalButton
                  title="Cancel"
                  type="cancel"
                  onPress={() => setMealModalVisible(false)}
                />
                <ModalButton
                  title="Log Meal"
                  type="primary"
                  onPress={handleLogMeal}
                />
              </View>
            </LinearGradient>
          </Animated.View>
        </BlurView>
      </Modal>

      {/* Custom Alert */}
      <CustomAlert
        visible={isVisible}
        onClose={hideAlert}
        title={alertConfig?.title || ''}
        message={alertConfig?.message || ''}
        type={alertConfig?.type}
        buttons={alertConfig?.buttons}
        icon={alertConfig?.icon}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  loadingText: {
    color: 'white',
    fontSize: FontSizes.md,
    marginTop: Spacing.md,
    fontWeight: '500',
  },
  header: {
    paddingTop: 60,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerMain: {
    flex: 1,
  },
  quickStatsContainer: {
    marginTop: Spacing.lg,
  },
  quickStatsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    transform: [{ scale: 1 }],
  },
  headerButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BorderRadius.lg,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  summaryCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginTop: Spacing.sm,
    borderWidth: 0.5,
    borderColor: 'rgba(128,128,128,0.2)',
    transform: [{ scale: 1 }],
  },
  summaryGradient: {
    padding: Spacing.lg,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: 'white',
    marginTop: Spacing.xs,
  },
  summaryLabel: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    textAlign: 'center',
  },
  tipCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginTop: Spacing.sm,
    borderWidth: 0.5,
    borderColor: 'rgba(128,128,128,0.2)',
    transform: [{ scale: 1 }],
  },
  tipGradient: {
    padding: Spacing.lg,
  },
  tipContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  tipTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: 'white',
    marginBottom: Spacing.xs,
  },
  tipDescription: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  greeting: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: Spacing.xs,
  },
  date: {
    fontSize: FontSizes.sm,
    color: '#8B4513',
    fontWeight: '500',
  },
  profileButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    padding: Spacing.xs,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: 'white',
    marginBottom: Spacing.md,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  actionButton: {
    width: '48%',
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  actionGradient: {
    padding: Spacing.lg,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: 'white',
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  successNotification: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    zIndex: 1000,
  },
  successBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  successText: {
    color: Colors.success,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  modalGradient: {
    padding: Spacing.xl,
  },
  modalTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    fontSize: FontSizes.md,
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: Spacing.sm,
    overflow: 'hidden', // Important for gradient to work
  },
  cancelButtonText: {
    color: 'white',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  submitButton: {
    marginLeft: Spacing.sm,
    overflow: 'hidden',
  },
  submitGradient: {
    width: '100%',
    padding: Spacing.md,
    alignItems: 'center',
  },
  submitButtonText: {
    color: Colors.primary,
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  headerLeft: {
    flex: 1,
  },
  headerInfo: {
    flex: 1,
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    backgroundColor: 'rgba(255,248,240,0.7)',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 60,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: '#8B4513',
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: '#8B4513',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(139,69,19,0.3)',
    marginHorizontal: Spacing.sm,
  },
  // New compact layout styles
  mainContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  wellnessCard: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    transform: [{ scale: 1 }],
  },
  cardGradient: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    flex: 1,
    justifyContent: 'center',
  },
  wellnessContent: {
    alignItems: 'center',
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  wellnessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  scoreContainer: {
    alignItems: 'flex-start',
  },
  scoreRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scorePercentage: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: '#8B4513',
    marginLeft: 4,
  },
  wellnessScore: {
    fontSize: 42,
    fontWeight: '800',
    color: '#8B4513',
  },
  wellnessLabel: {
    fontSize: FontSizes.sm,
    color: '#8B4513',
    marginBottom: Spacing.md,
    fontWeight: '600',
  },
  wellnessBreakdown: {
    flexDirection: 'column',
    gap: Spacing.sm,
  },
  breakdownDot: {
    alignItems: 'center',
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotLabel: {
    fontSize: FontSizes.xs,
    color: '#8B4513',
    fontWeight: '500',
    flex: 1,
  },
  dotValue: {
    fontSize: FontSizes.xs,
    color: '#8B4513',
    fontWeight: '600',
  },
  quickActionsCompact: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  compactAction: {
    alignItems: 'center',
    width: '48%',
    paddingVertical: Spacing.sm,
  },
  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  actionLabel: {
    fontSize: FontSizes.xs,
    color: '#8B4513',
    fontWeight: '500',
  },
  progressRow: {
    marginBottom: Spacing.lg,
  },
  stepsRow: {
    marginBottom: Spacing.lg,
  },
  progressCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    transform: [{ scale: 1 }],
  },
  progressTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  progressGrid: {
    gap: Spacing.md,
  },
  progressItemCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  progressItems: {
    gap: Spacing.lg,
  },
  progressItem: {
    gap: Spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  progressIcon: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: FontSizes.sm,
    color: '#8B4513',
    fontWeight: '600',
    flex: 1,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    flex: 1,
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  progressPercentage: {
    fontSize: FontSizes.xs,
    color: '#8B4513',
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
  progressText: {
    fontSize: FontSizes.xs,
    color: '#8B4513',
    fontWeight: '500',
  },
  insightsRow: {
    marginBottom: Spacing.lg,
  },
  insightsCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightsTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: Spacing.sm,
  },
  insightText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: Spacing.xs,
  },
  insightMessage: {
    fontSize: FontSizes.sm,
    color: '#8B4513',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  insightAction: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.md,
  },
  insightActionText: {
    fontSize: FontSizes.sm,
    color: 'white',
    fontWeight: '600',
  },
});