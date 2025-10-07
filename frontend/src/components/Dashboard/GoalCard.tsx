import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

interface GoalCardProps {
  title: string;
  current: number;
  target: number;
  unit: string;
  icon: string;
  color: string;
  streak?: number;
  onPress?: () => void;
  showPercentage?: boolean;
}

export default function GoalCard({
  title,
  current,
  target,
  unit,
  icon,
  color,
  streak,
  onPress,
  showPercentage = true,
}: GoalCardProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isCompleted = current >= target;
  
  const getProgressColor = () => {
    if (isCompleted) return Colors.success;
    if (percentage >= 75) return color;
    if (percentage >= 50) return Colors.warning;
    return Colors.error;
  };

  const progressColor = getProgressColor();

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon as any} size={20} color={color} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            {streak !== undefined && streak > 0 && (
              <View style={styles.streakContainer}>
                <Ionicons name="flame" size={12} color={Colors.warning} />
                <Text style={styles.streakText}>{streak} day streak</Text>
              </View>
            )}
          </View>
        </View>
        {isCompleted && (
          <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
        )}
      </View>

      <View style={styles.progressSection}>
        <View style={styles.valueRow}>
          <Text style={styles.currentValue}>
            {current.toLocaleString()}
          </Text>
          <Text style={styles.targetValue}>
            / {target.toLocaleString()} {unit}
          </Text>
        </View>
        
        {showPercentage && (
          <Text style={[styles.percentage, { color: progressColor }]}>
            {Math.round(percentage)}%
          </Text>
        )}
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${percentage}%`,
                backgroundColor: progressColor,
              },
            ]}
          />
        </View>
      </View>

      {isCompleted && (
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>Goal Achieved! 🎉</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  streakText: {
    fontSize: FontSizes.xs,
    color: Colors.warning,
    fontWeight: '600',
    marginLeft: 2,
  },
  progressSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currentValue: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  targetValue: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  percentage: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  progressBarContainer: {
    marginBottom: Spacing.sm,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  completedBadge: {
    backgroundColor: Colors.success + '15',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  completedText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.success,
  },
});