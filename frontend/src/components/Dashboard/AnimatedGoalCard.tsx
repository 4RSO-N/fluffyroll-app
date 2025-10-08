import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeInRight,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

interface Props {
  title: string;
  current: number;
  target: number;
  unit: string;
  icon: string;
  color: string;
  streak?: number;
  onPress?: () => void;
  delay?: number;
}

export default function AnimatedGoalCard({
  title,
  current,
  target,
  unit,
  icon,
  color,
  streak = 0,
  onPress,
  delay = 0,
}: Props) {
  const progressAnimation = useSharedValue(0);
  const scaleAnimation = useSharedValue(1);

  useEffect(() => {
    progressAnimation.value = withTiming((current / target) * 100, { duration: 1000 });
  }, [current, target]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${Math.min(progressAnimation.value, 100)}%`,
  }));

  const handlePress = () => {
    scaleAnimation.value = withSpring(0.95, { damping: 15, stiffness: 200 }, () => {
      scaleAnimation.value = withSpring(1);
    });
    onPress?.();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnimation.value }],
  }));

  const isCompleted = current >= target;
  const progressPercentage = Math.min((current / target) * 100, 100);

  return (
    <Animated.View 
      entering={FadeInRight.delay(delay)} 
      style={[styles.container, animatedStyle]}
    >
      <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                <Ionicons name={icon as any} size={24} color={color} />
              </View>
              <View style={styles.titleTextContainer}>
                <Text style={styles.title}>{title}</Text>
                {streak > 0 && (
                  <View style={styles.streakContainer}>
                    <Ionicons name="flame" size={12} color={Colors.warning} />
                    <Text style={styles.streakText}>{streak} day streak</Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.valuesContainer}>
              <Text style={[styles.currentValue, { color }]}>
                {current}
              </Text>
              <Text style={styles.targetValue}>/ {target} {unit}</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View 
                style={[
                  styles.progressFill, 
                  { backgroundColor: color },
                  progressStyle
                ]} 
              />
            </View>
            <Text style={[styles.percentage, { color }]}>
              {Math.round(progressPercentage)}%
            </Text>
          </View>

          {isCompleted && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text style={styles.completedText}>Goal Achieved! 🎉</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    fontSize: FontSizes.xs,
    color: Colors.warning,
    marginLeft: Spacing.xs,
    fontWeight: '600',
  },
  valuesContainer: {
    alignItems: 'flex-end',
  },
  currentValue: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
  },
  targetValue: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    marginRight: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  percentage: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.success}10`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  completedText: {
    fontSize: FontSizes.xs,
    color: Colors.success,
    marginLeft: Spacing.xs,
    fontWeight: '600',
  },
});
