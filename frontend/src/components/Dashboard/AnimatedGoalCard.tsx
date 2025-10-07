import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
  Extrapolate,
  FadeInRight,
  BounceIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

interface AnimatedGoalCardProps {
  title: string;
  current: number;
  target: number;
  unit: string;
  icon: string;
  color: string;
  streak?: number;
  onPress?: () => void;
  delay?: number;
  showPercentage?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

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
  showPercentage = true,
}: AnimatedGoalCardProps) {
  const progress = useSharedValue(0);
  const scaleValue = useSharedValue(0.9);
  const streakScale = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const iconRotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  const progressPercentage = Math.min((current / target) * 100, 100);
  const isCompleted = current >= target;

  useEffect(() => {
    // Main card entrance animation
    scaleValue.value = withDelay(
      delay,
      withSpring(1, {
        damping: 15,
        stiffness: 200,
      })
    );

    // Progress bar animation
    progress.value = withDelay(
      delay + 200,
      withTiming(progressPercentage / 100, {
        duration: 1500,
      })
    );

    // Streak animation if present
    if (streak > 0) {
      streakScale.value = withDelay(
        delay + 800,
        withSequence(
          withSpring(1.2, { damping: 10, stiffness: 200 }),
          withSpring(1, { damping: 15, stiffness: 200 })
        )
      );
    }

    // Icon rotation for visual interest
    iconRotation.value = withDelay(
      delay + 400,
      withTiming(360, {
        duration: 2000,
      })
    );

    // Glow effect for completed goals
    if (isCompleted) {
      glowOpacity.value = withDelay(
        delay + 1000,
        withSequence(
          withTiming(1, { duration: 800 }),
          withTiming(0.3, { duration: 1200 })
        )
      );
    }
  }, [current, target, streak, delay, isCompleted]);

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scaleValue.value },
        { scale: buttonScale.value },
      ],
    };
  });

  const progressAnimatedStyle = useAnimatedStyle(() => {
    const width = progress.value * 100;
    return {
      width: `${width}%`,
    };
  });

  const streakAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: streakScale.value }],
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${iconRotation.value * 0.5}deg` }],
    };
  });

  const glowAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });

  const handlePress = () => {
    if (onPress) {
      // Press animation
      buttonScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withSpring(1, { damping: 15, stiffness: 300 })
      );
      
      // Icon celebration animation
      iconRotation.value = withSequence(
        withTiming(iconRotation.value + 180, { duration: 300 }),
        withSpring(iconRotation.value + 360, { damping: 15, stiffness: 200 })
      );
      
      onPress();
    }
  };

  const getStatusColor = () => {
    if (isCompleted) return Colors.success;
    if (progressPercentage >= 75) return color;
    if (progressPercentage >= 50) return Colors.warning;
    return Colors.textSecondary;
  };

  const getStatusText = () => {
    if (isCompleted) return "🎉 Goal Achieved!";
    if (progressPercentage >= 75) return "Almost there!";
    if (progressPercentage >= 50) return "Good progress!";
    return "Keep going!";
  };

  return (
    <AnimatedTouchableOpacity
      style={[styles.container, cardAnimatedStyle]}
      entering={FadeInRight.delay(delay).springify()}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {/* Glow effect for completed goals */}
      {isCompleted && (
        <Animated.View 
          style={[styles.glow, { backgroundColor: color }, glowAnimatedStyle]} 
        />
      )}
      
      <LinearGradient
        colors={[
          isCompleted ? `${Colors.success}15` : 'rgba(255,255,255,0.95)',
          isCompleted ? `${Colors.success}10` : 'rgba(255,255,255,0.85)'
        ]}
        style={styles.card}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Animated.View 
              style={[styles.iconContainer, { backgroundColor: `${color}20` }, iconAnimatedStyle]}
            >
              <Ionicons name={icon as any} size={24} color={color} />
            </Animated.View>
            
            <View style={styles.titleTextContainer}>
              <Text style={styles.title}>{title}</Text>
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
          </View>

          {/* Streak Indicator */}
          {streak > 0 && (
            <Animated.View 
              style={[styles.streakContainer, streakAnimatedStyle]}
              entering={BounceIn.delay(delay + 600)}
            >
              <Ionicons name="flame" size={16} color={Colors.warning} />
              <Text style={styles.streakText}>{streak}</Text>
            </Animated.View>
          )}
        </View>

        <View style={styles.progressSection}>
          {/* Current/Target Display */}
          <View style={styles.numbersContainer}>
            <View style={styles.currentContainer}>
              <Text style={[styles.currentNumber, { color }]}>{current}</Text>
              <Text style={styles.unit}>/ {target} {unit}</Text>
            </View>
            
            {showPercentage && (
              <View style={styles.percentageContainer}>
                <Text style={[styles.percentage, { color: getStatusColor() }]}>
                  {Math.round(progressPercentage)}%
                </Text>
              </View>
            )}
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarBackground, { backgroundColor: `${color}20` }]}>
              <Animated.View 
                style={[
                  styles.progressBarFill, 
                  { backgroundColor: isCompleted ? Colors.success : color },
                  progressAnimatedStyle
                ]} 
              />
              
              {/* Progress Bar Shimmer Effect */}
              {!isCompleted && progressPercentage > 0 && (
                <Animated.View
                  style={[
                    styles.shimmer,
                    {
                      backgroundColor: `${color}40`,
                      left: `${progressPercentage - 10}%`,
                    }
                  ]}
                  entering={FadeInRight.delay(delay + 1000)}
                />
              )}
            </View>
          </View>

          {/* Achievement Badge */}
          {isCompleted && (
            <Animated.View 
              style={styles.achievementBadge}
              entering={BounceIn.delay(delay + 1200).springify()}
            >
              <LinearGradient
                colors={[Colors.success, '#22c55e']}
                style={styles.badgeGradient}
              >
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.badgeText}>Complete!</Text>
              </LinearGradient>
            </Animated.View>
          )}
        </View>

        {/* Action Hint */}
        {onPress && !isCompleted && (
          <Animated.View 
            style={styles.actionHint}
            entering={FadeInRight.delay(delay + 1400)}
          >
            <Text style={styles.actionHintText}>Tap to add more</Text>
            <Ionicons name="add-circle-outline" size={16} color={Colors.textSecondary} />
          </Animated.View>
        )}
      </LinearGradient>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: BorderRadius.xl + 2,
    opacity: 0.3,
  },
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
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
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  statusText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.warning}20`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
  },
  streakText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.warning,
    marginLeft: Spacing.xs,
  },
  progressSection: {
    marginTop: Spacing.sm,
  },
  numbersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  currentContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currentNumber: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
  },
  unit: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
    fontWeight: '500',
  },
  percentageContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  percentage: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  progressBarContainer: {
    marginBottom: Spacing.sm,
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    position: 'relative',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    width: 20,
    height: '100%',
    borderRadius: 4,
  },
  achievementBadge: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  badgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  badgeText: {
    color: 'white',
    fontSize: FontSizes.sm,
    fontWeight: '700',
    marginLeft: Spacing.xs,
  },
  actionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  actionHintText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginRight: Spacing.xs,
    fontWeight: '500',
  },
});