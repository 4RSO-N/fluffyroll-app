import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { fitnessAPI } from '../../services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import AnalyticsCard from '../../components/Dashboard/AnalyticsCard';
import InsightCard from '../../components/Dashboard/InsightCard';
import GoalCard from '../../components/Dashboard/GoalCard';
import HealthScoreCard from '../../components/Dashboard/HealthScoreCard';

const { width: screenWidth } = Dimensions.get('window');

export default function EnhancedDashboardScreen() {
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
    }
  };

  const loadWeeklyData = async () => {
    // Mock weekly data - in real app, fetch from API
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

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
    loadWeeklyData();
  };

  const handleLogWater = async () => {
    try {
      await fitnessAPI.logWater(parseInt(waterGlasses));
      setWaterModalVisible(false);
      setWaterGlasses('1');
      Alert.alert('Success', 'Water logged successfully! 💧');
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
      Alert.alert('Success', 'Meal logged successfully! 🍽️');
      loadDashboard();
    } catch (error) {
      Alert.alert('Error', 'Failed to log meal');
    }
  };

  const generateInsights = () => {
    const insights = [];
    
    if (dashboard) {
      const caloriesPercent = (dashboard.caloriesConsumed / dashboard.caloriesGoal) * 100;
      const waterPercent = (dashboard.waterIntake / dashboard.waterGoal) * 100;
      
      if (caloriesPercent > 90) {
        insights.push({
          title: "Great Calorie Management!",
          message: "You're staying within your calorie goals. Keep up the excellent work!",
          type: 'success' as const,
        });
      } else if (caloriesPercent < 70) {
        insights.push({
          title: "Increase Your Intake",
          message: "You might be under-eating. Consider adding a healthy snack to meet your goals.",
          type: 'warning' as const,
          actionText: "Log Snack",
          onAction: () => setMealModalVisible(true),
        });
      }
      
      if (waterPercent < 50) {
        insights.push({
          title: "Hydration Alert",
          message: "You're behind on water intake. Stay hydrated for better performance!",
          type: 'info' as const,
          actionText: "Add Water",
          onAction: () => setWaterModalVisible(true),
        });
      }
      
      if (dashboard.workoutsCompleted === 0) {
        insights.push({
          title: "Time to Move!",
          message: "No workouts logged today. Even a 10-minute walk can make a difference.",
          type: 'tip' as const,
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
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const insights = generateInsights();
  const healthData = calculateHealthScore();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.displayName}! 👋</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>

      {/* Health Score */}
      <View style={styles.section}>
        <HealthScoreCard
          score={healthData.score}
          previousScore={72} // Mock previous score
          breakdown={healthData.breakdown}
        />
      </View>

      {/* Insights */}
      {insights.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Insights</Text>
          {insights.map((insight, index) => (
            <InsightCard
              key={index}
              title={insight.title}
              message={insight.message}
              type={insight.type}
              actionText={insight.actionText}
              onAction={insight.onAction}
            />
          ))}
        </View>
      )}

      {/* Goals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Goals</Text>
        
        <GoalCard
          title="Calories"
          current={dashboard?.caloriesConsumed || 0}
          target={dashboard?.caloriesGoal || 2000}
          unit="kcal"
          icon="flame"
          color={Colors.primary}
          streak={5}
          onPress={() => setMealModalVisible(true)}
        />
        
        <GoalCard
          title="Water Intake"
          current={dashboard?.waterIntake || 0}
          target={dashboard?.waterGoal || 8}
          unit="glasses"
          icon="water"
          color={Colors.info}
          streak={3}
          onPress={() => setWaterModalVisible(true)}
        />
        
        <GoalCard
          title="Workouts"
          current={dashboard?.workoutsCompleted || 0}
          target={1}
          unit="sessions"
          icon="fitness"
          color={Colors.success}
          streak={dashboard?.workoutsCompleted > 0 ? 2 : 0}
        />
      </View>

      {/* Weekly Analytics */}
      {weeklyData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Trends</Text>
          
          <AnalyticsCard
            title="Calorie Intake"
            data={weeklyData.calories}
            chartType="line"
            color={Colors.primary}
            suffix=" kcal"
          />
          
          <AnalyticsCard
            title="Water Intake"
            data={weeklyData.water}
            chartType="bar"
            color={Colors.info}
            suffix=" glasses"
          />
          
          <AnalyticsCard
            title="Workout Frequency"
            data={weeklyData.workouts}
            chartType="bar"
            color={Colors.success}
            suffix=" sessions"
          />
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setMealModalVisible(true)}
          >
            <Ionicons name="add-circle" size={32} color={Colors.primary} />
            <Text style={styles.actionText}>Log Meal</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setWaterModalVisible(true)}
          >
            <Ionicons name="water" size={32} color={Colors.info} />
            <Text style={styles.actionText}>Add Water</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Log Workout', 'Go to the Fitness tab to log workouts! 💪')}
          >
            <Ionicons name="barbell" size={32} color={Colors.success} />
            <Text style={styles.actionText}>Log Workout</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Coming Soon', 'Journal feature coming soon! 📝')}
          >
            <Ionicons name="journal" size={32} color={Colors.secondary} />
            <Text style={styles.actionText}>Journal</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modals */}
      {/* Water Modal */}
      <Modal
        visible={waterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setWaterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>💧 Log Water</Text>

            <Text style={styles.inputLabel}>Number of Glasses</Text>
            <TextInput
              style={styles.input}
              value={waterGlasses}
              onChangeText={setWaterGlasses}
              keyboardType="numeric"
              placeholder="1"
            />

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
                <Text style={styles.submitButtonText}>Log Water</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Meal Modal */}
      <Modal
        visible={mealModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMealModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🍽️ Log Meal</Text>

            <Text style={styles.inputLabel}>Meal Name</Text>
            <TextInput
              style={styles.input}
              value={mealName}
              onChangeText={setMealName}
              placeholder="e.g., Chicken Salad"
            />

            <Text style={styles.inputLabel}>Calories</Text>
            <TextInput
              style={styles.input}
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
              placeholder="e.g., 350"
            />

            <Text style={styles.inputLabel}>Protein (g) - Optional</Text>
            <TextInput
              style={styles.input}
              value={protein}
              onChangeText={setProtein}
              keyboardType="numeric"
              placeholder="e.g., 30"
            />

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
                <Text style={styles.submitButtonText}>Log Meal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl + 20,
    backgroundColor: Colors.surface,
  },
  greeting: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  date: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  section: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  actionText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.border,
    marginRight: Spacing.sm,
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    marginLeft: Spacing.sm,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});