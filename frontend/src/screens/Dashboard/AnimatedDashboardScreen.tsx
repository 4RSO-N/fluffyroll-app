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
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
  interpolate,
  Extrapolate,
  FadeIn,
  FadeInUp,
  FadeInDown,
  SlideInRight,
  SlideInLeft,
  BounceIn,
  ZoomIn,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { fitnessAPI } from '../../services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import AnimatedHealthScoreCard from '../../components/Dashboard/AnimatedHealthScoreCard';
import AnimatedGoalCard from '../../components/Dashboard/AnimatedGoalCard';
import AnimatedInsightCard from '../../components/Dashboard/AnimatedInsightCard';
import AnimatedAnalyticsCard from '../../components/Dashboard/AnimatedAnalyticsCard';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function AnimatedDashboardScreen() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weeklyData, setWeeklyData] = useState<any>(null);
  
  // Modal states
  const [waterModalVisible, setWaterModalVisible] = useState(false);
  const [mealModalVisible, setMealModalVisible] = useState(false);
  const [waterGlasses, setWaterGlasses] = useState('1');
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');

  // Animation values
  const scrollY = useSharedValue(0);
  const headerOpacity = useSharedValue(1);
  const headerScale = useSharedValue(1);
  const fabScale = useSharedValue(1);
  const refreshProgress = useSharedValue(0);
  
  // Success animation states
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const successScale = useSharedValue(0);

  useEffect(() => {
    loadDashboard();
    loadWeeklyData();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await fitnessAPI.getDashboard();
      setDashboard(data);
    } catch (error: any) {
      console.error('Load dashboard error:', error);
      if (error.response?.status === 403 || error.response?.status === 404) {
        setDashboard({
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
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      
      // Animate refresh completion
      refreshProgress.value = withTiming(0, { duration: 300 });
    }
  };

  const loadWeeklyData = async () => {
    // Mock weekly data with slight delay for staggered animations
    await new Promise(resolve => setTimeout(resolve, 200));
    
    setWeeklyData({
      calories: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          data: [1800, 2100, 1950, 2200, 1850, 2050, 1900],
        }],
      },
      water: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          data: [7, 8, 6, 9, 8, 7, 6],
        }],
      },
      workouts: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          data: [1, 0, 1, 1, 0, 1, 1],
        }],
      },
    });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refreshProgress.value = withTiming(1, { duration: 300 });
    loadDashboard();
    loadWeeklyData();
  }, []);

  const showSuccessNotification = useCallback((message: string) => {
    setShowSuccessAnimation(true);
    successScale.value = withSequence(
      withSpring(1, { damping: 15, stiffness: 200 }),
      withDelay(2000, withSpring(0, { damping: 15, stiffness: 200 }))
    );
    
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
      Alert.alert('Error', 'Failed to log water');
    }
  };

  const handleLogMeal = async () => {
    if (!mealName || !calories) {
      Alert.alert('Error', 'Please fill in meal name and calories');
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
      Alert.alert('Error', 'Failed to log meal');
    }
  };

  const handleScroll = useCallback((event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.value = offsetY;
    
    // Animate header based on scroll
    const maxScroll = 100;
    const progress = Math.min(offsetY / maxScroll, 1);
    
    headerOpacity.value = withTiming(1 - progress * 0.3, { duration: 100 });
    headerScale.value = withTiming(1 - progress * 0.05, { duration: 100 });
  }, []);

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
      transform: [{ scale: headerScale.value }],
    };
  });

  const fabAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 200],
      [0, 100],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [
        { translateY },
        { scale: fabScale.value }
      ],
    };
  });

  const successAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: successScale.value }],
    };
  });

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
    
    const caloriesScore = Math.min((dashboard.caloriesConsumed / dashboard.caloriesGoal) * 100, 100);
    const waterScore = Math.min((dashboard.waterIntake / dashboard.waterGoal) * 100, 100);
    const workoutScore = dashboard.workoutsCompleted > 0 ? 100 : 0;
    
    const fitnessScore = workoutScore;
    const nutritionScore = caloriesScore;
    const hydrationScore = waterScore;
    
    const overallScore = (fitnessScore * 0.4) + (nutritionScore * 0.4) + (hydrationScore * 0.2);
    
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
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Animated Background Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <AnimatedScrollView
        style={styles.scrollContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="white"
            colors={[Colors.primary]}
          />
        }
      >
        {/* Animated Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]} entering={FadeInDown.delay(100)}>
          <View style={styles.headerContent}>
            <View>
              <Animated.Text 
                style={styles.greeting}
                entering={FadeInUp.delay(200)}
              >
                {greeting}, {user?.displayName}! ✨
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
            
            <Animated.View entering={SlideInRight.delay(400)}>
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => Alert.alert('Profile', 'Profile screen coming soon!')}
              >
                <Ionicons name="person-circle" size={40} color="white" />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>

        {/* Health Score Card */}
        <Animated.View entering={FadeInUp.delay(500)} style={styles.section}>
          <AnimatedHealthScoreCard
            score={healthData.score}
            previousScore={72}
            breakdown={healthData.breakdown}
          />
        </Animated.View>

        {/* Insights Section */}
        {insights.length > 0 && (
          <Animated.View entering={FadeInUp.delay(600)} style={styles.section}>
            <Text style={styles.sectionTitle}>💡 Smart Insights</Text>
            {insights.map((insight, index) => (
              <AnimatedInsightCard
                key={index}
                title={insight.title}
                message={insight.message}
                type={insight.type}
                icon={insight.icon}
                actionText={insight.actionText}
                onAction={insight.onAction}
                delay={700 + (index * 100)}
              />
            ))}
          </Animated.View>
        )}

        {/* Goals Section */}
        <Animated.View entering={FadeInUp.delay(800)} style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Today's Goals</Text>
          
          <AnimatedGoalCard
            title="Calories"
            current={dashboard?.caloriesConsumed || 0}
            target={dashboard?.caloriesGoal || 2000}
            unit="kcal"
            icon="flame"
            color={Colors.primary}
            streak={5}
            onPress={() => setMealModalVisible(true)}
            delay={900}
          />
          
          <AnimatedGoalCard
            title="Water Intake"
            current={dashboard?.waterIntake || 0}
            target={dashboard?.waterGoal || 8}
            unit="glasses"
            icon="water"
            color={Colors.info}
            streak={3}
            onPress={() => setWaterModalVisible(true)}
            delay={1000}
          />
          
          <AnimatedGoalCard
            title="Workouts"
            current={dashboard?.workoutsCompleted || 0}
            target={1}
            unit="sessions"
            icon="fitness"
            color={Colors.success}
            streak={dashboard?.workoutsCompleted > 0 ? 2 : 0}
            delay={1100}
          />
        </Animated.View>

        {/* Weekly Analytics */}
        {weeklyData && (
          <Animated.View entering={FadeInUp.delay(1200)} style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Weekly Trends</Text>
            
            <AnimatedAnalyticsCard
              title="Calorie Intake"
              data={weeklyData.calories}
              chartType="line"
              color={Colors.primary}
              suffix=" kcal"
              delay={1300}
            />
            
            <AnimatedAnalyticsCard
              title="Water Intake"
              data={weeklyData.water}
              chartType="bar"
              color={Colors.info}
              suffix=" glasses"
              delay={1400}
            />
            
            <AnimatedAnalyticsCard
              title="Workout Frequency"
              data={weeklyData.workouts}
              chartType="bar"
              color={Colors.success}
              suffix=" sessions"
              delay={1500}
            />
          </Animated.View>
        )}

        {/* Quick Actions */}
        <Animated.View entering={FadeInUp.delay(1600)} style={[styles.section, { marginBottom: 100 }]}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {[
              { icon: 'add-circle', text: 'Log Meal', color: Colors.primary, action: () => setMealModalVisible(true) },
              { icon: 'water', text: 'Add Water', color: Colors.info, action: () => setWaterModalVisible(true) },
              { icon: 'barbell', text: 'Log Workout', color: Colors.success, action: () => Alert.alert('Workout', 'Go to Fitness tab! 💪') },
              { icon: 'journal', text: 'Journal', color: Colors.secondary, action: () => Alert.alert('Coming Soon', 'Journal feature! 📝') },
            ].map((item, index) => (
              <AnimatedTouchableOpacity
                key={index}
                style={styles.actionButton}
                entering={BounceIn.delay(1700 + (index * 100))}
                onPress={() => {
                  fabScale.value = withSequence(
                    withSpring(0.95, { damping: 15, stiffness: 200 }),
                    withSpring(1, { damping: 15, stiffness: 200 })
                  );
                  item.action();
                }}
              >
                <LinearGradient
                  colors={[item.color, `${item.color}80`]}
                  style={styles.actionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={item.icon as any} size={32} color="white" />
                  <Text style={styles.actionText}>{item.text}</Text>
                </LinearGradient>
              </AnimatedTouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </AnimatedScrollView>

      {/* Floating Success Notification */}
      {showSuccessAnimation && (
        <Animated.View style={[styles.successNotification, successAnimatedStyle]}>
          <BlurView intensity={80} style={styles.successBlur}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
            <Text style={styles.successText}>Success! 🎉</Text>
          </BlurView>
        </Animated.View>
      )}

      {/* Enhanced Modals with Blur Background */}
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
              colors={[Colors.info, `${Colors.info}90`]}
              style={styles.modalGradient}
            >
              <Text style={styles.modalTitle}>💧 Log Water</Text>
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
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setWaterModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleLogWater}
                >
                  <LinearGradient
                    colors={['white', '#f0f0f0']}
                    style={styles.submitGradient}
                  >
                    <Text style={styles.submitButtonText}>Log Water</Text>
                  </LinearGradient>
                </TouchableOpacity>
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
              colors={[Colors.primary, `${Colors.primary}90`]}
              style={styles.modalGradient}
            >
              <Text style={styles.modalTitle}>🍽️ Log Meal</Text>
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
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setMealModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleLogMeal}
                >
                  <LinearGradient
                    colors={['white', '#f0f0f0']}
                    style={styles.submitGradient}
                  >
                    <Text style={styles.submitButtonText}>Log Meal</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        </BlurView>
      </Modal>
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
  greeting: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: Spacing.xs,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  date: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.9)',
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
    color: 'white',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    fontSize: FontSizes.md,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: 'white',
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: Spacing.sm,
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
});