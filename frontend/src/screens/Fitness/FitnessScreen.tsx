import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { fitnessAPI } from '../../services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { WarmTheme } from '../../constants/warmTheme';
import { useCustomAlert } from '../../hooks/useCustomAlert';
import CustomAlert from '../../components/CustomAlert';
import ModalButton from '../../components/ModalButton';

export default function FitnessScreen() {
  const { alertConfig, isVisible, hideAlert, showError, showSuccess } = useCustomAlert();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [waterModalVisible, setWaterModalVisible] = useState(false);
  const [mealModalVisible, setMealModalVisible] = useState(false);
  const [workoutModalVisible, setWorkoutModalVisible] = useState(false);
  const [waterGlasses, setWaterGlasses] = useState('1');
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  
  // Workout states
  const [workoutType, setWorkoutType] = useState('');
  const [duration, setDuration] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [useAutoCalc, setUseAutoCalc] = useState(true);

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
      showSuccess('Success', 'Water logged successfully!');
      loadDashboard();
    } catch (error) {
      console.error('Failed to log water:', error);
      showError('Error', 'Failed to log water');
    }
  };

  const handleLogMeal = async () => {
    if (!mealName || !calories) {
      showError('Error', 'Please fill in meal name and calories');
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
      showSuccess('Success', 'Meal logged successfully!');
      loadDashboard();
    } catch (error) {
      console.error('Failed to log meal:', error);
      showError('Error', 'Failed to log meal');
    }
  };

  const calculateCalories = (type: string, durationMin: number) => {
    const metValues: { [key: string]: number } = {
      running: 10,
      cycling: 8,
      swimming: 9,
      walking: 3.5,
      weightlifting: 6,
      yoga: 2.5,
      hiit: 12,
      cardio: 7,
    };

    const met = metValues[type] || 5;
    const weightKg = 70;
    const hours = durationMin / 60;
    
    return Math.round(met * weightKg * hours);
  };

  const handleWorkoutTypeChange = (type: string) => {
    setWorkoutType(type);
    if (useAutoCalc && duration) {
      const calculated = calculateCalories(type, parseInt(duration));
      setCaloriesBurned(calculated.toString());
    }
  };

  const handleDurationChange = (value: string) => {
    setDuration(value);
    if (useAutoCalc && workoutType && value) {
      const calculated = calculateCalories(workoutType, parseInt(value));
      setCaloriesBurned(calculated.toString());
    }
  };

  const handleLogWorkout = async () => {
    if (!workoutType || !duration) {
      showError('Error', 'Please select workout type and duration');
      return;
    }

    try {
      await fitnessAPI.createWorkout({
        workoutType,
        durationMinutes: parseInt(duration),
        caloriesBurned: parseInt(caloriesBurned),
        exercises: [],
        notes: workoutNotes,
        performedAt: new Date().toISOString(),
      });
      
      setWorkoutModalVisible(false);
      setWorkoutType('');
      setDuration('');
      setCaloriesBurned('');
      setWorkoutNotes('');
      setUseAutoCalc(true);
      showSuccess('Success', 'Workout logged successfully! 💪');
      loadDashboard();
    } catch (error) {
      console.error('Failed to log workout:', error);
      showError('Error', 'Failed to log workout');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={WarmTheme.colors.primary} />
      </View>
    );
  }

  const caloriesPercent = dashboard?.caloriesGoal
    ? (dashboard.caloriesConsumed / dashboard.caloriesGoal) * 100
    : 0;

  const proteinPercent = dashboard?.proteinGoal
    ? (dashboard.proteinConsumed / dashboard.proteinGoal) * 100
    : 0;

  const waterPercent = dashboard?.waterGoal
    ? (dashboard.waterIntake / dashboard.waterGoal) * 100
    : 0;

  return (
    <View style={styles.container}>
      {/* Warm Background Gradient */}
      <LinearGradient
        colors={WarmTheme.gradients.pageBackground as [string, string, string]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Fitness & Nutrition</Text>
        <Text style={styles.subtitle}>Track your daily intake</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Calories Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flame" size={24} color={WarmTheme.colors.actionButtons.fitness} />
            <Text style={styles.cardTitle}>Calories</Text>
          </View>
          <Text style={styles.mainValue}>
            {dashboard?.caloriesConsumed || 0}
            <Text style={styles.goalValue}> / {dashboard?.caloriesGoal || 0}</Text>
          </Text>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(caloriesPercent, 100)}%`,
                  backgroundColor: WarmTheme.colors.actionButtons.fitness,
                },
              ]}
            />
          </View>
          <Text style={styles.remaining}>
            {Math.max(0, (dashboard?.caloriesGoal || 0) - (dashboard?.caloriesConsumed || 0))} kcal remaining
          </Text>
        </View>

        {/* Macros Row */}
        <View style={styles.macrosRow}>
          <View style={styles.macroCard}>
            <Text style={styles.macroLabel}>Protein</Text>
            <Text style={styles.macroValue}>{dashboard?.proteinConsumed || 0}g</Text>
            <Text style={styles.macroGoal}>of {dashboard?.proteinGoal || 0}g</Text>
            <View style={styles.miniProgressBg}>
              <View
                style={[
                  styles.miniProgressFill,
                  { width: `${Math.min(proteinPercent, 100)}%`, backgroundColor: WarmTheme.colors.actionButtons.meal },
                ]}
              />
            </View>
          </View>

          <View style={styles.macroCard}>
            <Text style={styles.macroLabel}>Carbs</Text>
            <Text style={styles.macroValue}>{dashboard?.carbsConsumed || 0}g</Text>
            <Text style={styles.macroGoal}>of {dashboard?.carbsGoal || 0}g</Text>
            <View style={styles.miniProgressBg}>
              <View
                style={[
                  styles.miniProgressFill,
                  {
                    width: `${Math.min(
                      ((dashboard?.carbsConsumed || 0) / (dashboard?.carbsGoal || 1)) * 100,
                      100
                    )}%`,
                    backgroundColor: WarmTheme.colors.accent.primary,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.macroCard}>
            <Text style={styles.macroLabel}>Fat</Text>
            <Text style={styles.macroValue}>{dashboard?.fatConsumed || 0}g</Text>
            <Text style={styles.macroGoal}>of {dashboard?.fatGoal || 0}g</Text>
            <View style={styles.miniProgressBg}>
              <View
                style={[
                  styles.miniProgressFill,
                  {
                    width: `${Math.min(
                      ((dashboard?.fatConsumed || 0) / (dashboard?.fatGoal || 1)) * 100,
                      100
                    )}%`,
                    backgroundColor: WarmTheme.colors.accent.tertiary,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Water Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="water" size={24} color={WarmTheme.colors.actionButtons.water} />
            <Text style={styles.cardTitle}>Water Intake</Text>
          </View>
          <Text style={styles.mainValue}>
            {dashboard?.waterIntake || 0}
            <Text style={styles.goalValue}> / {dashboard?.waterGoal || 0} glasses</Text>
          </Text>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(waterPercent, 100)}%`,
                  backgroundColor: WarmTheme.colors.actionButtons.water,
                },
              ]}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setMealModalVisible(true)}
          >
            <Ionicons name="restaurant" size={24} color={WarmTheme.colors.actionButtons.meal} />
            <Text style={styles.actionButtonText}>Log Meal</Text>
            <Ionicons name="chevron-forward" size={20} color={WarmTheme.colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setWaterModalVisible(true)}
          >
            <Ionicons name="water" size={24} color={WarmTheme.colors.actionButtons.water} />
            <Text style={styles.actionButtonText}>Add Water</Text>
            <Ionicons name="chevron-forward" size={20} color={WarmTheme.colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setWorkoutModalVisible(true)}
          >
            <Ionicons name="barbell" size={24} color={WarmTheme.colors.actionButtons.fitness} />
            <Text style={styles.actionButtonText}>Log Workout</Text>
            <Ionicons name="chevron-forward" size={20} color={WarmTheme.colors.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Water Modal */}
      <Modal
        visible={waterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setWaterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Water</Text>

            <Text style={styles.inputLabel}>Number of Glasses</Text>
            <TextInput
              style={styles.input}
              value={waterGlasses}
              onChangeText={setWaterGlasses}
              keyboardType="numeric"
              placeholder="1"
            />

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
            <Text style={styles.modalTitle}>Log Meal</Text>

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
          </View>
        </View>
      </Modal>

      {/* Workout Modal */}
      <Modal
        visible={workoutModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setWorkoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>💪 Log Workout</Text>

              <Text style={styles.inputLabel}>Workout Type</Text>
              <View style={styles.workoutTypeGrid}>
                {[
                  { id: 'running', label: '🏃 Running' },
                  { id: 'cycling', label: '🚴 Cycling' },
                  { id: 'swimming', label: '🏊 Swimming' },
                  { id: 'walking', label: '🚶 Walking' },
                  { id: 'weightlifting', label: '🏋️ Weights' },
                  { id: 'yoga', label: '🧘 Yoga' },
                  { id: 'hiit', label: '🔥 HIIT' },
                  { id: 'cardio', label: '❤️ Cardio' },
                ].map((workout) => (
                  <TouchableOpacity
                    key={workout.id}
                    style={[
                      styles.workoutTypeButton,
                      workoutType === workout.id && styles.workoutTypeButtonSelected,
                    ]}
                    onPress={() => handleWorkoutTypeChange(workout.id)}
                  >
                    <Text style={styles.workoutTypeText}>{workout.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Duration (minutes)</Text>
              <TextInput
                style={styles.input}
                value={duration}
                onChangeText={handleDurationChange}
                keyboardType="numeric"
                placeholder="e.g., 30"
              />

              <View style={styles.calcModeContainer}>
                <TouchableOpacity
                  style={styles.calcModeToggle}
                  onPress={() => setUseAutoCalc(!useAutoCalc)}
                >
                  <View style={[styles.checkbox, useAutoCalc && styles.checkboxChecked]}>
                    {useAutoCalc && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.calcModeText}>Auto-calculate calories</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>
                Calories Burned {useAutoCalc ? '(auto)' : '(manual)'}
              </Text>
              <TextInput
                style={[styles.input, useAutoCalc && styles.inputDisabled]}
                value={caloriesBurned}
                onChangeText={setCaloriesBurned}
                keyboardType="numeric"
                placeholder="e.g., 350"
                editable={!useAutoCalc}
              />

              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={workoutNotes}
                onChangeText={setWorkoutNotes}
                placeholder="How did it go?"
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalButtons}>
                <ModalButton
                  title="Cancel"
                  type="cancel"
                  onPress={() => setWorkoutModalVisible(false)}
                />
                <ModalButton
                  title="Log Workout"
                  type="primary"
                  onPress={handleLogWorkout}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <CustomAlert 
        visible={isVisible}
        onClose={hideAlert}
        title={alertConfig?.title || ''}
        message={alertConfig?.message || ''}
        type={alertConfig?.type}
        buttons={alertConfig?.buttons}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl + 20,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: WarmTheme.colors.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: WarmTheme.colors.primary,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: WarmTheme.colors.primary,
    marginLeft: Spacing.sm,
  },
  mainValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: WarmTheme.colors.primary,
    marginBottom: Spacing.sm,
  },
  goalValue: {
    fontSize: FontSizes.lg,
    color: WarmTheme.colors.primary,
    fontWeight: 'normal',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(139,69,19,0.2)',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  remaining: {
    fontSize: FontSizes.sm,
    color: WarmTheme.colors.primary,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  macroCard: {
    width: '31%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  macroLabel: {
    fontSize: FontSizes.xs,
    color: WarmTheme.colors.primary,
    marginBottom: Spacing.xs,
  },
  macroValue: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: WarmTheme.colors.primary,
  },
  macroGoal: {
    fontSize: FontSizes.xs,
    color: WarmTheme.colors.primary,
    marginBottom: Spacing.xs,
  },
  miniProgressBg: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  actionsSection: {
    marginTop: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    flex: 1,
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: WarmTheme.colors.primary,
    marginLeft: Spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
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
  workoutTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
    marginHorizontal: -Spacing.xs,
  },
  workoutTypeButton: {
    width: '48%',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    margin: Spacing.xs,
    alignItems: 'center',
  },
  workoutTypeButtonSelected: {
    backgroundColor: Colors.success + '20',
    borderColor: Colors.success,
  },
  workoutTypeText: {
    fontSize: FontSizes.sm,
    color: Colors.text,
  },
  calcModeContainer: {
    marginBottom: Spacing.md,
  },
  calcModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  calcModeText: {
    fontSize: FontSizes.sm,
    color: Colors.text,
  },
  inputDisabled: {
    backgroundColor: Colors.border + '50',
    opacity: 0.6,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  modalButton: {
    flex: 1,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    overflow: 'hidden', // Important for gradient
  },
  buttonGradient: {
    width: '100%',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    marginRight: Spacing.sm,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  submitButton: {
    marginLeft: Spacing.sm,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
