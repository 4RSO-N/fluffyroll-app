import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

export default function GoalsScreen({ navigation }: any) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const { updateOnboardingStatus } = useAuth();

  const goals = [
    { id: 'fitness', label: 'Track Fitness & Nutrition', icon: 'barbell-outline' },
    { id: 'habits', label: 'Build Healthy Habits', icon: 'leaf-outline' },
    { id: 'cycle', label: 'Track Menstrual Cycle', icon: 'calendar-outline' },
    { id: 'mental', label: 'Improve Mental Wellness', icon: 'heart-outline' },
    { id: 'journal', label: 'Daily Journaling', icon: 'book-outline' },
  ];

  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goalId));
    } else {
      setSelectedGoals([...selectedGoals, goalId]);
    }
  };

  const handleContinue = () => {
    // Here you would typically save the goals to your backend or state management
    console.log('Selected goals:', selectedGoals);
    navigation.navigate('Complete');
  };

  const handleSkip = async () => {
    try {
      await updateOnboardingStatus(true);
      navigation.navigate('Main');
    } catch (error) {
      console.error('Skip error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What are your goals?</Text>
        <Text style={styles.subtitle}>Select all that interest you</Text>

        <View style={styles.goalsContainer}>
          {goals.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalCard,
                selectedGoals.includes(goal.id) && styles.goalCardSelected,
              ]}
              onPress={() => toggleGoal(goal.id)}
            >
              <Ionicons
                name={goal.icon as any}
                size={32}
                color={selectedGoals.includes(goal.id) ? Colors.primary : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.goalText,
                  selectedGoals.includes(goal.id) && styles.goalTextSelected,
                ]}
              >
                {goal.label}
              </Text>
              {selectedGoals.includes(goal.id) && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.primaryButton, selectedGoals.length === 0 && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={selectedGoals.length === 0}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleSkip}
        >
          <Text style={styles.secondaryButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  goalsContainer: {
    marginTop: Spacing.md,
  },
  goalCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  goalCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  goalText: {
    fontSize: FontSizes.md,
    color: Colors.text,
    marginLeft: Spacing.md,
    flex: 1,
  },
  goalTextSelected: {
    fontWeight: '600',
    color: Colors.primary,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttons: {
    padding: Spacing.lg,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },
});
