import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInUp,
  FadeInDown,
  SlideInRight,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { WarmTheme } from '../../constants/warmTheme';
import { useCustomAlert } from '../../hooks/useCustomAlert';
import CustomAlert from '../../components/CustomAlert';
import ModalButton from '../../components/ModalButton';

const { width: screenWidth } = Dimensions.get('window');

interface Habit {
  id: string;
  title: string;
  description: string;
  category: 'health' | 'fitness' | 'mindfulness' | 'productivity' | 'social';
  frequency: 'daily' | 'weekly' | 'custom';
  targetDays?: number; // for weekly/custom habits
  completedToday: boolean;
  streak: number;
  totalCompletions: number;
  isActive: boolean;
  createdDate: string;
  lastCompleted?: string;
  reminders: boolean;
  reminderTime?: string;
}

const HABIT_CATEGORIES = [
  { id: 'health', label: 'Health', icon: 'heart', color: WarmTheme.colors.actionButtons.fitness },
  { id: 'fitness', label: 'Fitness', icon: 'fitness', color: WarmTheme.colors.actionButtons.fitness },
  { id: 'mindfulness', label: 'Mind', icon: 'leaf', color: WarmTheme.colors.accent.secondary },
  { id: 'productivity', label: 'Work', icon: 'briefcase', color: WarmTheme.colors.actionButtons.meal },
  { id: 'social', label: 'Social', icon: 'people', color: WarmTheme.colors.actionButtons.water },
];

const HABIT_TEMPLATES = [
  { title: 'Drink 8 Glasses of Water', category: 'health', description: 'Stay hydrated throughout the day' },
  { title: 'Exercise for 30 Minutes', category: 'fitness', description: 'Get your body moving daily' },
  { title: '10 Minutes Meditation', category: 'mindfulness', description: 'Practice mindfulness and reduce stress' },
  { title: 'Read for 20 Minutes', category: 'productivity', description: 'Expand your knowledge daily' },
  { title: 'Call a Friend/Family', category: 'social', description: 'Stay connected with loved ones' },
  { title: 'Write in Journal', category: 'mindfulness', description: 'Reflect on your day and thoughts' },
  { title: 'Take a Walk', category: 'fitness', description: 'Get fresh air and light exercise' },
  { title: 'Practice Gratitude', category: 'mindfulness', description: 'List 3 things you\'re grateful for' },
];

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// HabitCard component - moved outside to follow React best practices
const HabitCard = React.memo(({ 
  habit, 
  toggleHabitCompletion, 
  deleteHabit 
}: { 
  habit: Habit; 
  toggleHabitCompletion: (id: string) => void;
  deleteHabit: (id: string) => void;
}) => {
  const getCategoryInfo = (category: string) => {
    return HABIT_CATEGORIES.find(c => c.id === category) || HABIT_CATEGORIES[0];
  };

  const categoryInfo = getCategoryInfo(habit.category);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    toggleHabitCompletion(habit.id);
  };

  const handleLongPress = () => {
    deleteHabit(habit.id);
  };

  return (
    <AnimatedTouchableOpacity
      style={[styles.habitCard, animatedStyle]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      entering={FadeInUp.delay(100)}
    >
      <View style={styles.habitHeader}>
        <View style={styles.habitTitleContainer}>
          <View style={[styles.categoryIcon, { backgroundColor: categoryInfo.color + '15' }]}>
            <Ionicons name={categoryInfo.icon as any} size={16} color={categoryInfo.color} />
          </View>
          <View style={styles.habitTextContainer}>
            <Text style={styles.habitTitle}>{habit.title}</Text>
            {habit.description ? (
              <Text style={styles.habitDescription}>{habit.description}</Text>
            ) : null}
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.checkButton,
            habit.completedToday && styles.checkButtonCompleted
          ]}
          onPress={() => toggleHabitCompletion(habit.id)}
        >
          {habit.completedToday && (
            <Ionicons name="checkmark" size={16} color="white" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.habitStats}>
        <View style={styles.statItem}>
          <Ionicons name="flame" size={14} color={WarmTheme.colors.actionButtons.fitness} />
          <Text style={styles.statText}>{habit.streak} day streak</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="trophy" size={14} color={WarmTheme.colors.accent.primary} />
          <Text style={styles.statText}>{habit.totalCompletions} completed</Text>
        </View>
      </View>
    </AnimatedTouchableOpacity>
  );
});

export default function HabitsScreen() {
  // Using WarmTheme directly for consistent styling
  const { alertConfig, isVisible, hideAlert, showError, showSuccess, showConfirmation } = useCustomAlert();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newHabit, setNewHabit] = useState({
    title: '',
    description: '',
    category: 'health' as Habit['category'],
    frequency: 'daily' as Habit['frequency'],
    reminders: false,
  });

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const stored = await AsyncStorage.getItem('user_habits');
      if (stored) {
        const parsedHabits = JSON.parse(stored);
        // Check if habits need daily reset
        const today = new Date().toISOString().split('T')[0];
        const resetHabits = parsedHabits.map((habit: Habit) => {
          if (habit.lastCompleted !== today && habit.completedToday) {
            return { ...habit, completedToday: false };
          }
          return habit;
        });
        setHabits(resetHabits);
        await AsyncStorage.setItem('user_habits', JSON.stringify(resetHabits));
      }
    } catch (error) {
      console.error('Failed to load habits:', error);
    }
  };

  const saveHabits = async (updatedHabits: Habit[]) => {
    try {
      await AsyncStorage.setItem('user_habits', JSON.stringify(updatedHabits));
      setHabits(updatedHabits);
    } catch (error) {
      console.error('Failed to save habits:', error);
    }
  };

  const toggleHabitCompletion = async (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const wasCompleted = habit.completedToday;
        const newStreak = wasCompleted ? Math.max(0, habit.streak - 1) : habit.streak + 1;
        const newTotalCompletions = wasCompleted ? 
          Math.max(0, habit.totalCompletions - 1) : 
          habit.totalCompletions + 1;

        return {
          ...habit,
          completedToday: !wasCompleted,
          streak: newStreak,
          totalCompletions: newTotalCompletions,
          lastCompleted: wasCompleted ? undefined : today,
        };
      }
      return habit;
    });

    await saveHabits(updatedHabits);
  };

  const addHabit = async () => {
    if (!newHabit.title.trim()) {
      showError('Error', 'Please enter a habit title');
      return;
    }

    const habit: Habit = {
      id: Date.now().toString(),
      title: newHabit.title,
      description: newHabit.description,
      category: newHabit.category,
      frequency: newHabit.frequency,
      completedToday: false,
      streak: 0,
      totalCompletions: 0,
      isActive: true,
      createdDate: new Date().toISOString().split('T')[0],
      reminders: newHabit.reminders,
    };

    const updatedHabits = [...habits, habit];
    await saveHabits(updatedHabits);
    
    setNewHabit({
      title: '',
      description: '',
      category: 'health',
      frequency: 'daily',
      reminders: false,
    });
    setShowAddModal(false);
    showSuccess('Success', 'Habit added successfully!');
  };

  const addTemplateHabit = async (template: typeof HABIT_TEMPLATES[0]) => {
    const habit: Habit = {
      id: Date.now().toString(),
      title: template.title,
      description: template.description,
      category: template.category as Habit['category'],
      frequency: 'daily',
      completedToday: false,
      streak: 0,
      totalCompletions: 0,
      isActive: true,
      createdDate: new Date().toISOString().split('T')[0],
      reminders: false,
    };

    const updatedHabits = [...habits, habit];
    await saveHabits(updatedHabits);
    setShowTemplateModal(false);
    showSuccess('Success', `${template.title} habit added!`);
  };

  const deleteHabit = async (habitId: string) => {
    showConfirmation(
      'Delete Habit',
      'Are you sure you want to delete this habit?',
      () => {
        const updatedHabits = habits.filter(h => h.id !== habitId);
        saveHabits(updatedHabits);
        setHabits(updatedHabits);
      }
    );
  };

  const completedToday = habits.filter(h => h.completedToday).length;
  const totalHabits = habits.length;
  const completionPercentage = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;

  const getCategoryInfo = (category: string) => {
    return HABIT_CATEGORIES.find(c => c.id === category) || HABIT_CATEGORIES[0];
  };

  const renderHabitCard = ({ item: habit }: { item: Habit }) => {
    return (
      <HabitCard 
        habit={habit} 
        toggleHabitCompletion={toggleHabitCompletion}
        deleteHabit={deleteHabit}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Warm Background Gradient */}
      <LinearGradient
        colors={WarmTheme.gradients.pageBackground as [string, string, string]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Header with Progress */}
      <View style={styles.header}>
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={styles.headerTitle}>Habits & Growth</Text>
          <Text style={styles.headerSubtitle}>Build better habits, one day at a time</Text>
          
          {/* Progress Summary */}
          <View style={styles.progressContainer}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                {completedToday} of {totalHabits} completed today
              </Text>
              <Text style={styles.progressPercentage}>
                {Math.round(completionPercentage)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  { width: `${completionPercentage}%` }
                ]}
                entering={SlideInRight.delay(300)}
              />
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Habits List */}
      <FlatList
        data={habits}
        renderItem={renderHabitCard}
        keyExtractor={item => item.id}
        style={styles.habitsList}
        contentContainerStyle={styles.habitsListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Animated.View style={styles.emptyState} entering={FadeInUp.delay(200)}>
            <Ionicons name="leaf-outline" size={64} color={WarmTheme.colors.accent.secondary} />
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptySubtitle}>
              Start building better habits today!
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowTemplateModal(true)}
            >
              <Text style={styles.emptyButtonText}>Get Started</Text>
            </TouchableOpacity>
          </Animated.View>
        }
      />

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <AnimatedTouchableOpacity
          style={[styles.fab, styles.fabSecondary]}
          onPress={() => setShowTemplateModal(true)}
          entering={FadeInUp.delay(400)}
        >
          <Ionicons name="library" size={24} color="white" />
        </AnimatedTouchableOpacity>
        
        <AnimatedTouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddModal(true)}
          entering={FadeInUp.delay(500)}
        >
          <Ionicons name="add" size={28} color="white" />
        </AnimatedTouchableOpacity>
      </View>

      {/* Add Habit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <BlurView intensity={50} style={styles.modalContainer}>
          <Animated.View
            style={styles.modalContent}
            entering={FadeInUp.delay(100)}
          >
            <LinearGradient
              colors={[WarmTheme.colors.accent.primary, WarmTheme.colors.accent.secondary]}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>Create New Habit</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowAddModal(false)}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Habit Title</Text>
                <TextInput
                  style={styles.textInput}
                  value={newHabit.title}
                  onChangeText={(text) => setNewHabit(prev => ({ ...prev, title: text }))}
                  placeholder="Enter habit title"
                  placeholderTextColor={WarmTheme.colors.secondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={newHabit.description}
                  onChangeText={(text) => setNewHabit(prev => ({ ...prev, description: text }))}
                  placeholder="Describe your habit"
                  placeholderTextColor={WarmTheme.colors.secondary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.categoryPicker}>
                    {HABIT_CATEGORIES.map(category => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryPickerItem,
                          newHabit.category === category.id && styles.categoryPickerItemActive
                        ]}
                        onPress={() => setNewHabit(prev => ({ 
                          ...prev, 
                          category: category.id as Habit['category'] 
                        }))}
                      >
                        <Ionicons 
                          name={category.icon as any} 
                          size={20} 
                          color={newHabit.category === category.id ? 'white' : category.color} 
                        />
                        <Text style={[
                          styles.categoryPickerText,
                          newHabit.category === category.id && styles.categoryPickerTextActive
                        ]}>
                          {category.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.switchRow}>
                  <Text style={styles.inputLabel}>Enable Reminders</Text>
                  <Switch
                    value={newHabit.reminders}
                    onValueChange={(value) => setNewHabit(prev => ({ ...prev, reminders: value }))}
                    trackColor={{ false: 'rgba(139,69,19,0.2)', true: WarmTheme.colors.accent.primary + '30' }}
                    thumbColor={newHabit.reminders ? WarmTheme.colors.accent.primary : WarmTheme.colors.secondary}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <ModalButton
                title="Cancel"
                type="cancel"
                onPress={() => setShowAddModal(false)}
              />
              <ModalButton
                title="Create Habit"
                type="primary"
                onPress={addHabit}
              />
            </View>
          </Animated.View>
        </BlurView>
      </Modal>

      {/* Template Selection Modal */}
      <Modal
        visible={showTemplateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTemplateModal(false)}
      >
        <BlurView intensity={50} style={styles.modalContainer}>
          <Animated.View 
            style={styles.modalContent}
            entering={FadeInUp.delay(100)}
          >
            <LinearGradient
              colors={[WarmTheme.colors.accent.primary, WarmTheme.colors.accent.secondary]}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>Choose a Habit Template</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowTemplateModal(false)}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </LinearGradient>

            <FlatList
              data={HABIT_TEMPLATES}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item: template }) => {
                const categoryInfo = getCategoryInfo(template.category);
                return (
                  <TouchableOpacity
                    style={styles.templateItem}
                    onPress={() => addTemplateHabit(template)}
                  >
                    <View style={styles.templateContent}>
                      <View style={[styles.templateIcon, { backgroundColor: categoryInfo.color + '15' }]}>
                        <Ionicons name={categoryInfo.icon as any} size={20} color={categoryInfo.color} />
                      </View>
                      <View style={styles.templateText}>
                        <Text style={styles.templateTitle}>{template.title}</Text>
                        <Text style={styles.templateDescription}>{template.description}</Text>
                      </View>
                      <Ionicons name="add-circle" size={24} color={WarmTheme.colors.accent.primary} />
                    </View>
                  </TouchableOpacity>
                );
              }}
              style={styles.templateList}
            />
          </Animated.View>
        </BlurView>
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
    backgroundColor: WarmTheme.colors.panelBackground.primary,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: FontSizes.md,
    color: '#8B4513',
    opacity: 0.8,
    marginBottom: Spacing.lg,
  },
  progressContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
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
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressText: {
    color: '#8B4513',
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  progressPercentage: {
    color: '#8B4513',
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(139, 69, 19, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: WarmTheme.colors.accent.primary,
    borderRadius: 3,
  },
  habitsList: {
    flex: 1,
  },
  habitsListContent: {
    padding: Spacing.sm,
    paddingBottom: 120, // Increased to avoid FAB overlap and tab bar
  },
  habitCard: {
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
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  habitTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  habitTextContainer: {
    flex: 1,
  },
  habitTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: WarmTheme.colors.primary,
    marginBottom: Spacing.xs,
  },
  habitDescription: {
    fontSize: FontSizes.sm,
    color: WarmTheme.colors.secondary,
    lineHeight: 18,
  },
  checkButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: WarmTheme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkButtonCompleted: {
    backgroundColor: WarmTheme.colors.accent.primary,
    borderColor: WarmTheme.colors.accent.primary,
  },
  habitStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: FontSizes.xs,
    color: WarmTheme.colors.secondary,
    marginLeft: Spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: WarmTheme.colors.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSizes.md,
    color: WarmTheme.colors.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    backgroundColor: WarmTheme.colors.accent.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 90, // Moved higher to avoid tab bar (was Spacing.xl = 32)
    right: Spacing.lg,
    alignItems: 'flex-end',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: WarmTheme.colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: Spacing.md,
  },
  fabSecondary: {
    backgroundColor: WarmTheme.colors.accent.secondary,
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: WarmTheme.colors.panelBackground.modal,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: 'white',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: Spacing.lg,
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: WarmTheme.colors.primary,
    marginBottom: Spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: WarmTheme.colors.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: WarmTheme.colors.primary,
    backgroundColor: WarmTheme.colors.panelBackground.primary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryPicker: {
    flexDirection: 'row',
  },
  categoryPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: WarmTheme.colors.panelBackground.primary,
    borderWidth: 1,
    borderColor: WarmTheme.colors.secondary,
  },
  categoryPickerItemActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryPickerText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.text,
    marginLeft: Spacing.xs,
  },
  categoryPickerTextActive: {
    color: 'white',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: WarmTheme.colors.secondary + '30',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: Spacing.xs,
    overflow: 'hidden',
    borderRadius: BorderRadius.md,
  },
  modalButtonSecondary: {
    backgroundColor: WarmTheme.colors.secondary + '20',
  },
  modalButtonGradient: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  modalButtonTextSecondary: {
    color: WarmTheme.colors.secondary,
    fontSize: FontSizes.md,
    fontWeight: '600',
    padding: Spacing.md,
    textAlign: 'center',
  },
  templateList: {
    maxHeight: 400,
  },
  templateItem: {
    borderBottomWidth: 1,
    borderBottomColor: WarmTheme.colors.secondary + '20',
  },
  templateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  templateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  templateText: {
    flex: 1,
  },
  templateTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: WarmTheme.colors.primary,
    marginBottom: Spacing.xs,
  },
  templateDescription: {
    fontSize: FontSizes.sm,
    color: WarmTheme.colors.secondary,
  },
});
