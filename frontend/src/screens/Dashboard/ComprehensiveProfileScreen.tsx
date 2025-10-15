import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useActivity } from '../../contexts/ActivityContext';
import { useUserData } from '../../contexts/UserDataContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { WarmTheme } from '../../constants/warmTheme';
import ModalButton from '../../components/ModalButton';

const FITNESS_GOALS = [
  'Lose Weight',
  'Gain Weight', 
  'Build Muscle',
  'Improve Endurance',
  'Stay Healthy',
  'Reduce Stress',
  'Better Sleep',
  'Increase Energy',
];

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
  { id: 'light', label: 'Light', description: 'Light exercise 1-3 days/week' },
  { id: 'moderate', label: 'Moderate', description: 'Moderate exercise 3-5 days/week' },
  { id: 'active', label: 'Active', description: 'Hard exercise 6-7 days/week' },
  { id: 'very_active', label: 'Very Active', description: 'Very hard exercise, physical job' },
];

export default function EnhancedProfileScreen({ navigation }: any) {
  const { user } = useAuth();
  const { getTodaysProgress } = useActivity();
  const { 
    userProfile, 
    updateProfile, 
    calculateAge, 
    calculateBMI,
    getWeightTrend,
    getTDEE,
    getRecommendedCalories,
    calculateGoalProgress,
    getGoalTimeRemaining
  } = useUserData();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);

  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const formatDateToDDMMYYYY = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    birthday: userProfile?.birthday ? formatDateToDDMMYYYY(userProfile.birthday) : '',
    gender: userProfile?.gender || 'other',
    height: userProfile?.height?.toString() || '',
    currentWeight: userProfile?.currentWeight?.toString() || '',
    targetWeight: userProfile?.targetWeight?.toString() || '',
    dailyCalorieGoal: userProfile?.dailyCalorieGoal?.toString() || '',
    waterGoal: userProfile?.waterGoal?.toString() || '',
    sleepGoal: userProfile?.sleepGoal?.toString() || '',
  });

  const handleBirthdayChange = (text: string) => {
    // Remove all non-numeric characters
    const numbers = text.replace(/\D/g, '');
    
    let formatted = '';
    if (numbers.length > 0) {
      formatted = numbers.substring(0, 2); // Day
      if (numbers.length >= 3) {
        formatted += '/' + numbers.substring(2, 4); // Month
        if (numbers.length >= 5) {
          formatted += '/' + numbers.substring(4, 8); // Year
        }
      }
    }
    
    setFormData(prev => ({ ...prev, birthday: formatted }));
  };

  const validateAge = (dateString: string) => {
    if (!dateString || dateString.length !== 10) return false;
    
    const [day, month, year] = dateString.split('/').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    
    let actualAge = age;
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      actualAge--;
    }
    
    return actualAge >= 18 && actualAge <= 130;
  };

  const validateHeight = (height: string) => {
    const heightNum = parseFloat(height);
    return heightNum >= 50 && heightNum <= 300; // 50cm to 300cm (reasonable human range)
  };

  const validateWeight = (weight: string) => {
    const weightNum = parseFloat(weight);
    return weightNum >= 20 && weightNum <= 500; // 20kg to 500kg (reasonable human range)
  };

  const handleGenderSelect = (gender: string) => {
    const selectedGender = gender as 'male' | 'female' | 'other';
    setFormData(prev => ({ ...prev, gender: selectedGender }));
  };

  const renderNameField = () => (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>Name</Text>
      {isEditing ? (
        <TextInput
          style={styles.textInput}
          value={formData.name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          placeholder="Enter your name"
        />
      ) : (
        <Text style={styles.infoValue}>{userProfile?.name || 'Not set'}</Text>
      )}
    </View>
  );

  const renderBirthdayField = () => (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>Birthday</Text>
      {isEditing ? (
        <View>
          <TextInput
            style={[styles.textInput, !validateAge(formData.birthday) && formData.birthday.length === 10 && styles.textInputError]}
            value={formData.birthday}
            onChangeText={handleBirthdayChange}
            placeholder="DD/MM/YYYY"
            keyboardType="numeric"
            maxLength={10}
          />
          {!validateAge(formData.birthday) && formData.birthday.length === 10 && (
            <Text style={styles.errorText}>Age must be between 18 and 130 years</Text>
          )}
        </View>
      ) : (
        <Text style={styles.infoValue}>
          {userProfile?.birthday ? formatDateToDDMMYYYY(userProfile.birthday) : 'Not set'}
        </Text>
      )}
    </View>
  );

  const renderGenderField = () => (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>Gender</Text>
      {isEditing ? (
        <View style={styles.genderSelector}>
          {['male', 'female', 'other'].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[
                styles.genderButton,
                formData.gender === gender && styles.genderButtonActive
              ]}
              onPress={() => handleGenderSelect(gender)}
            >
              <Text style={[
                styles.genderButtonText,
                formData.gender === gender && styles.genderButtonTextActive
              ]}>
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={styles.infoValue}>
          {userProfile?.gender ? userProfile.gender.charAt(0).toUpperCase() + userProfile.gender.slice(1) : 'Not set'}
        </Text>
      )}
    </View>
  );

  const renderWeightFields = () => (
    <View style={styles.infoRow}>
      <View style={[styles.infoItem, { flex: 1, marginRight: Spacing.md }]}>
        <Text style={styles.infoLabel}>Height (cm)</Text>
        {isEditing ? (
          <View>
            <TextInput
              style={[styles.textInput, !validateHeight(formData.height) && formData.height.length > 0 && styles.textInputError]}
              value={formData.height}
              onChangeText={(text) => setFormData(prev => ({ ...prev, height: text }))}
              placeholder="170"
              keyboardType="numeric"
            />
            {!validateHeight(formData.height) && formData.height.length > 0 && (
              <Text style={styles.errorText}>Height must be 50-300cm</Text>
            )}
          </View>
        ) : (
          <Text style={styles.infoValue}>{userProfile?.height || 'Not set'} cm</Text>
        )}
      </View>

      <View style={[styles.infoItem, { flex: 1 }]}>
        <Text style={styles.infoLabel}>Current Weight (kg)</Text>
        {isEditing ? (
          <View>
            <TextInput
              style={[styles.textInput, !validateWeight(formData.currentWeight) && formData.currentWeight.length > 0 && styles.textInputError]}
              value={formData.currentWeight}
              onChangeText={(text) => setFormData(prev => ({ ...prev, currentWeight: text }))}
              placeholder="70"
              keyboardType="numeric"
            />
            {!validateWeight(formData.currentWeight) && formData.currentWeight.length > 0 && (
              <Text style={styles.errorText}>Weight must be 20-500kg</Text>
            )}
          </View>
        ) : (
          <Text style={styles.infoValue}>{userProfile?.currentWeight || 'Not set'} kg</Text>
        )}
      </View>
    </View>
  );

  const renderTargetWeightField = () => (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>Target Weight (kg)</Text>
      {isEditing ? (
        <TextInput
          style={styles.textInput}
          value={formData.targetWeight}
          onChangeText={(text) => setFormData(prev => ({ ...prev, targetWeight: text }))}
          placeholder="Optional"
          keyboardType="numeric"
        />
      ) : (
        <Text style={styles.infoValue}>
          {userProfile?.targetWeight ? `${userProfile.targetWeight} kg` : 'Not set'}
        </Text>
      )}
    </View>
  );

  const progress = getTodaysProgress();
  const age = calculateAge();
  const bmi = calculateBMI();
  const weightTrend = getWeightTrend(7);
  const tdee = getTDEE();
  const recommendedCalories = getRecommendedCalories();

  const getBMICategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return { category: 'Underweight', color: WarmTheme.colors.accent.primary };
    if (bmiValue < 25) return { category: 'Normal', color: WarmTheme.colors.actionButtons.fitness };
    if (bmiValue < 30) return { category: 'Overweight', color: WarmTheme.colors.accent.secondary };
    return { category: 'Obese', color: '#EF4444' };
  };

  const convertDDMMYYYYToISO = (dateString: string) => {
    if (!dateString || dateString.length !== 10) return '';
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const handleSaveProfile = async () => {
    // Validation
    if (formData.birthday && !validateAge(formData.birthday)) {
      Alert.alert('Error', 'Please enter a valid age between 18 and 130 years');
      return;
    }
    
    if (formData.height && !validateHeight(formData.height)) {
      Alert.alert('Error', 'Please enter a valid height between 50 and 300 cm');
      return;
    }
    
    if (formData.currentWeight && !validateWeight(formData.currentWeight)) {
      Alert.alert('Error', 'Please enter a valid weight between 20 and 500 kg');
      return;
    }

    try {
      await updateProfile({
        name: formData.name,
        birthday: formData.birthday ? convertDDMMYYYYToISO(formData.birthday) : undefined,
        gender: formData.gender as any,
        height: parseFloat(formData.height) || undefined,
        currentWeight: parseFloat(formData.currentWeight) || undefined,
        targetWeight: parseFloat(formData.targetWeight) || undefined,
        dailyCalorieGoal: parseFloat(formData.dailyCalorieGoal) || 2000,
        waterGoal: parseFloat(formData.waterGoal) || 2000,
        sleepGoal: parseFloat(formData.sleepGoal) || 8,
      });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };



  const handleSaveGoals = async () => {
    try {
      await updateProfile({ fitnessGoals: selectedGoals as any });
      setShowGoalsModal(false);
      Alert.alert('Success', 'Goals updated successfully!');
    } catch (error) {
      console.error('Failed to update goals:', error);
      Alert.alert('Error', 'Failed to update goals');
    }
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return 'trending-up';
    if (trend === 'down') return 'trending-down';
    return 'remove';
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return '#EF4444';
    if (trend === 'down') return WarmTheme.colors.actionButtons.fitness;
    return WarmTheme.colors.secondary;
  };

  const renderStatsCard = () => {
    const bmiCategory = getBMICategory(bmi);
    
    return (
      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Health Overview</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{age}</Text>
            <Text style={styles.statLabel}>Years Old</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{bmi.toFixed(1)}</Text>
            <Text style={[styles.statLabel, { color: bmiCategory.color }]}>
              BMI ({bmiCategory.category})
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.round(tdee)}</Text>
            <Text style={styles.statLabel}>Daily Calories (TDEE)</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={styles.statRow}>
              <Text style={styles.statValue}>
                {weightTrend.change > 0 ? '+' : ''}{weightTrend.change.toFixed(1)}kg
              </Text>
              <Ionicons 
                name={getTrendIcon(weightTrend.trend)} 
                size={16} 
                color={getTrendColor(weightTrend.trend)}
              />
            </View>
            <Text style={styles.statLabel}>7-Day Trend</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPersonalInfo = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Ionicons 
            name={isEditing ? 'checkmark' : 'pencil'} 
            size={16} 
            color={WarmTheme.colors.primary} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.infoGrid}>
        {renderNameField()}
        {renderBirthdayField()}
        {renderGenderField()}
        {renderWeightFields()}
        {renderTargetWeightField()}
      </View>

      {isEditing && (
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderGoalsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Health Goals</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setShowGoalsModal(true)}
        >
          <Ionicons name="add" size={16} color={WarmTheme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.goalsContainer}>
        {userProfile?.fitnessGoals?.length ? userProfile.fitnessGoals.map((goal) => {
          const progress = calculateGoalProgress(goal.id);
          const timeRemaining = getGoalTimeRemaining(goal.id);
          const isCompleted = goal.isCompleted;
          
          return (
            <TouchableOpacity 
              key={goal.id} 
              style={[styles.goalCard, isCompleted && styles.completedGoalCard]}
              onPress={() => {
                // Show goal details modal
                let statusText = 'Overdue';
                if (timeRemaining > 0) {
                  statusText = `${timeRemaining} days remaining`;
                } else if (isCompleted) {
                  statusText = 'Completed!';
                }
                
                const progressText = `Progress: ${progress.toFixed(1)}%`;
                const targetText = `${goal.currentProgress}/${goal.target} ${goal.unit}`;
                const message = `${progressText}\n${targetText}\n${statusText}`;
                
                Alert.alert(goal.name, message, [{ text: 'OK' }]);
              }}
            >
              <View style={styles.goalHeader}>
                <Text style={[styles.goalTitle, isCompleted && styles.completedGoalText]}>
                  {goal.name}
                </Text>
                <Text style={[styles.goalStatus, isCompleted && styles.completedGoalText]}>
                  {isCompleted ? '✅' : `${progress.toFixed(0)}%`}
                </Text>
              </View>
              
              <Text style={styles.goalProgress}>
                {goal.currentProgress} / {goal.target} {goal.unit}
              </Text>
              
              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${isNaN(progress) ? 0 : Math.min(progress, 100)}%`,
                      backgroundColor: isCompleted ? WarmTheme.colors.actionButtons.fitness : WarmTheme.colors.primary
                    }
                  ]} 
                />
              </View>
              
              {!isCompleted && timeRemaining !== -1 && (
                <Text style={styles.goalDeadline}>
                  {timeRemaining > 0 ? `${timeRemaining} days left` : 'Overdue'}
                </Text>
              )}
              
              {goal.milestones && goal.milestones.length > 0 && goal.milestones.some(m => m.isCompleted) && (
                <Text style={styles.goalMilestones}>
                  🏆 {goal.milestones.filter(m => m.isCompleted).length}/{goal.milestones.length} milestones
                </Text>
              )}
            </TouchableOpacity>
          );
        }) : (
          <TouchableOpacity 
            style={styles.emptyGoalsCard}
            onPress={() => setShowGoalsModal(true)}
          >
            <Ionicons name="add-circle-outline" size={32} color={WarmTheme.colors.secondary} />
            <Text style={styles.emptyText}>No goals set. Tap to add your first goal!</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.nutritionInfo}>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionLabel}>Daily Calorie Goal</Text>
          <Text style={styles.nutritionValue}>
            {userProfile?.dailyCalorieGoal || 2000} cal
          </Text>
          <Text style={styles.nutritionSubtext}>
            Recommended: {recommendedCalories} cal
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Warm Background Gradient */}
      <LinearGradient
        colors={WarmTheme.gradients.pageBackground as [string, string, string]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { 
          backgroundColor: Colors.surface,
          borderRadius: BorderRadius.lg,
          marginHorizontal: Spacing.lg,
          marginTop: Spacing.md,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            android: {
              elevation: 3,
            },
          }),
        }]}>
        <View style={styles.headerContent}>
          <View style={styles.profileInfo}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: '#F3F4F6' }]}>
              <Ionicons name="person" size={32} color={WarmTheme.colors.secondary} />
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.name, { color: WarmTheme.colors.primary }]}>{userProfile?.name || user?.displayName || 'Welcome!'}</Text>
              <Text style={[styles.email, { color: WarmTheme.colors.secondary }]}>{user?.email}</Text>
              {userProfile?.joinDate && (
                <Text style={[styles.joinDate, { color: WarmTheme.colors.secondary }]}>
                  Member since {new Date(userProfile.joinDate).getFullYear()}
                </Text>
              )}
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.settingsButton, { 
              backgroundColor: '#F3F4F6',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }]}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={22} color={WarmTheme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {renderStatsCard()}
      {renderPersonalInfo()}
      {renderGoalsSection()}

      {/* Today's Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Progress</Text>
        <View style={styles.progressGrid}>
          <View style={styles.progressItem}>
            <Ionicons name="water" size={20} color={Colors.info} />
            <Text style={styles.progressLabel}>Water</Text>
            <Text style={styles.progressValue}>{Math.round(progress.waterProgress)}%</Text>
          </View>
          <View style={styles.progressItem}>
            <Ionicons name="fitness" size={20} color={Colors.success} />
            <Text style={styles.progressLabel}>Exercise</Text>
            <Text style={styles.progressValue}>{Math.round(progress.exerciseProgress)}%</Text>
          </View>
          <View style={styles.progressItem}>
            <Ionicons name="moon" size={20} color={Colors.primaryLight} />
            <Text style={styles.progressLabel}>Sleep</Text>
            <Text style={styles.progressValue}>{Math.round(progress.sleepProgress)}%</Text>
          </View>
        </View>
      </View>

      {/* Goals Selection Modal */}
      <Modal
        visible={showGoalsModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowGoalsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Fitness Goals</Text>
            <Text style={styles.modalSubtitle}>Choose goals that align with your wellness journey</Text>
            
            <ScrollView style={styles.goalsScrollView} showsVerticalScrollIndicator={false}>
              {FITNESS_GOALS.map((goal, index) => (
                <TouchableOpacity
                  key={`goal-${index}-${goal}`}
                  style={[
                    styles.goalOption,
                    selectedGoals.includes(goal) && styles.goalOptionSelected
                  ]}
                  onPress={() => toggleGoal(goal)}
                >
                  <Text style={[
                    styles.goalOptionText,
                    selectedGoals.includes(goal) && styles.goalOptionTextSelected
                  ]}>
                    {goal}
                  </Text>
                  {selectedGoals.includes(goal) && (
                    <Ionicons 
                      name="checkmark" 
                      size={20} 
                      color={Colors.primary} 
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <ModalButton
                title="Cancel"
                type="cancel"
                onPress={() => setShowGoalsModal(false)}
              />
              <ModalButton
                title="Save Goals"
                type="primary"
                onPress={handleSaveGoals}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom padding */}
      <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.md,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  email: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  joinDate: {
    fontSize: FontSizes.xs,
    color: Colors.textLight,
  },
  section: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsCard: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  infoGrid: {
    gap: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
  },
  infoItem: {
    marginBottom: Spacing.md,
  },
  infoLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  infoValue: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
  },
  dateButtonText: {
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  genderSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  genderButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  genderButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderButtonText: {
    fontSize: FontSizes.sm,
    color: Colors.text,
  },
  genderButtonTextActive: {
    color: 'white',
  },
  weightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  saveButtonText: {
    color: 'white',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  goalChip: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  goalText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  goalCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  completedGoalCard: {
    backgroundColor: Colors.success + '10',
    borderColor: Colors.success + '30',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  goalTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  goalStatus: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  completedGoalText: {
    color: Colors.success,
  },
  goalProgress: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: Spacing.xs,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  goalDeadline: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  goalMilestones: {
    fontSize: FontSizes.xs,
    color: Colors.success,
    marginTop: Spacing.xs,
  },
  emptyGoalsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  nutritionInfo: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  nutritionValue: {
    fontSize: FontSizes.lg,
    color: Colors.primary,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  nutritionSubtext: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  progressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.xs,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  progressLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  progressValue: {
    fontSize: FontSizes.md,
    color: Colors.text,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  cancelButton: {
    backgroundColor: Colors.borderLight,
  },
  modalButtonText: {
    color: 'white',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  modalSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  goalsScrollView: {
    maxHeight: 300,
    marginBottom: Spacing.md,
  },
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.background,
  },
  goalOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  goalOptionText: {
    fontSize: FontSizes.md,
    color: Colors.text,
    fontWeight: '500',
  },
  goalOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  textInputError: {
    borderColor: Colors.error,
    borderWidth: 1,
  },
  errorText: {
    fontSize: FontSizes.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});