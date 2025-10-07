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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { fitnessAPI } from '../../services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [waterModalVisible, setWaterModalVisible] = useState(false);
  const [mealModalVisible, setMealModalVisible] = useState(false);
  const [waterGlasses, setWaterGlasses] = useState('1');
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await fitnessAPI.getDashboard();
      setDashboard(data);
    } catch (error: any) {
      console.error('Load dashboard error:', error);
      if (error.response?.status === 403 || error.response?.status === 404) {
        setDashboard({
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
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const caloriesPercent = dashboard?.caloriesGoal
    ? (dashboard.caloriesConsumed / dashboard.caloriesGoal) * 100
    : 0;

  const waterPercent = dashboard?.waterGoal
    ? (dashboard.waterIntake / dashboard.waterGoal) * 100
    : 0;

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

      {/* Quick Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: Colors.primary + '20' }]}>
              <Ionicons name="flame" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{dashboard?.caloriesConsumed || 0}</Text>
            <Text style={styles.statLabel}>Calories</Text>
            <Text style={styles.statSubtext}>
              of {dashboard?.caloriesGoal || 0}
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: Colors.info + '20' }]}>
              <Ionicons name="water" size={24} color={Colors.info} />
            </View>
            <Text style={styles.statValue}>{dashboard?.waterIntake || 0}</Text>
            <Text style={styles.statLabel}>Glasses</Text>
            <Text style={styles.statSubtext}>
              of {dashboard?.waterGoal || 0}
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: Colors.success + '20' }]}>
              <Ionicons name="fitness" size={24} color={Colors.success} />
            </View>
            <Text style={styles.statValue}>{dashboard?.workoutsCompleted || 0}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
            <Text style={styles.statSubtext}>completed</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: Colors.secondary + '20' }]}>
              <Ionicons name="restaurant" size={24} color={Colors.secondary} />
            </View>
            <Text style={styles.statValue}>{dashboard?.mealsCount || 0}</Text>
            <Text style={styles.statLabel}>Meals</Text>
            <Text style={styles.statSubtext}>logged</Text>
          </View>
        </View>
      </View>

      {/* Progress Bars */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress</Text>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Calories</Text>
            <Text style={styles.progressValue}>
              {dashboard?.caloriesConsumed || 0} / {dashboard?.caloriesGoal || 0}
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(caloriesPercent, 100)}%`, backgroundColor: Colors.primary },
              ]}
            />
          </View>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Water Intake</Text>
            <Text style={styles.progressValue}>
              {dashboard?.waterIntake || 0} / {dashboard?.waterGoal || 0} glasses
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(waterPercent, 100)}%`, backgroundColor: Colors.info },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Action Buttons - No Section Title */}
      <View style={styles.section}>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  statSubtext: {
    fontSize: FontSizes.xs,
    color: Colors.textLight,
  },
  progressCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  progressTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  progressValue: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
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
