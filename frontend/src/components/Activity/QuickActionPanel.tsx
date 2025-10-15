import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useActivity } from '../../contexts/ActivityContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

export const QuickActionPanel: React.FC = () => {
  const { 
    todaysActivity, 
    updateWaterIntake, 
    updateExerciseMinutes, 
    updateSleepHours,
    updateMoodRating,
    getTodaysProgress 
  } = useActivity();

  const progress = getTodaysProgress();

  const quickActions = [
    {
      icon: 'water',
      label: 'Drink Water',
      value: `${todaysActivity.waterIntake}ml`,
      progress: progress.waterProgress,
      action: () => updateWaterIntake(250), // Add 250ml
      color: Colors.info,
    },
    {
      icon: 'fitness',
      label: 'Exercise',
      value: `${todaysActivity.exerciseMinutes}min`,
      progress: progress.exerciseProgress,
      action: () => {
        Alert.alert(
          'Log Exercise',
          'How many minutes did you exercise?',
          [
            { text: '15 min', onPress: () => { updateExerciseMinutes(15).catch(console.error); } },
            { text: '30 min', onPress: () => { updateExerciseMinutes(30).catch(console.error); } },
            { text: '60 min', onPress: () => { updateExerciseMinutes(60).catch(console.error); } },
          ]
        );
      },
      color: Colors.success,
    },
    {
      icon: 'bed',
      label: 'Sleep',
      value: `${todaysActivity.sleepHours}h`,
      progress: progress.sleepProgress,
      action: () => {
        Alert.alert(
          'Log Sleep',
          'How many hours did you sleep last night?',
          [
            { text: '6h', onPress: () => { updateSleepHours(6).catch(console.error); } },
            { text: '7h', onPress: () => { updateSleepHours(7).catch(console.error); } },
            { text: '8h', onPress: () => { updateSleepHours(8).catch(console.error); } },
            { text: '9h', onPress: () => { updateSleepHours(9).catch(console.error); } },
          ]
        );
      },
      color: Colors.secondary,
    },
    {
      icon: 'happy',
      label: 'Mood',
      value: `${todaysActivity.moodRating}/5`,
      progress: (todaysActivity.moodRating / 5) * 100,
      action: () => {
        Alert.alert(
          'Rate Your Mood',
          'How are you feeling today?',
          [
            { text: '😢 Poor (1)', onPress: () => { updateMoodRating(1).catch(console.error); } },
            { text: '😐 Fair (2)', onPress: () => { updateMoodRating(2).catch(console.error); } },
            { text: '🙂 Good (3)', onPress: () => { updateMoodRating(3).catch(console.error); } },
            { text: '😊 Great (4)', onPress: () => { updateMoodRating(4).catch(console.error); } },
            { text: '🤩 Excellent (5)', onPress: () => { updateMoodRating(5).catch(console.error); } },
          ]
        );
      },
      color: Colors.warning,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Activities</Text>
      <Text style={styles.subtitle}>Track your daily habits and stay on top of your wellness goals!</Text>
      
      <View style={styles.actionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.label}
            style={styles.actionCard}
            onPress={action.action}
          >
            <View style={[styles.iconContainer, { backgroundColor: action.color + '20' }]}>
              <Ionicons name={action.icon as any} size={24} color={action.color} />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
            <Text style={styles.actionValue}>{action.value}</Text>
            
            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${Math.min(100, action.progress)}%`,
                      backgroundColor: action.color 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(action.progress)}%
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.overallProgress}>
        <Text style={styles.overallTitle}>Overall Health Score</Text>
        <View style={styles.overallBar}>
          <View 
            style={[
              styles.overallFill, 
              { 
                width: `${Math.min(100, progress.overallHealth)}%`,
                backgroundColor: getHealthColor(progress.overallHealth)
              }
            ]} 
          />
        </View>
        <Text style={styles.overallScore}>
          {Math.round(progress.overallHealth)}/100
        </Text>
      </View>
    </View>
  );
};

const getHealthColor = (score: number): string => {
  if (score >= 80) return Colors.success;
  if (score >= 60) return Colors.warning;
  if (score >= 40) return Colors.error;
  return Colors.textSecondary;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.textLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  actionLabel: {
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  actionValue: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  overallProgress: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  overallTitle: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  overallBar: {
    width: '100%',
    height: 12,
    backgroundColor: Colors.border,
    borderRadius: 6,
    marginBottom: Spacing.sm,
  },
  overallFill: {
    height: '100%',
    borderRadius: 6,
  },
  overallScore: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.text,
  },
});

// Fix the key issue by using label instead of index