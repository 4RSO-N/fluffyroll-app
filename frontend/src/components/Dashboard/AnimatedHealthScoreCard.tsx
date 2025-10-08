import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeInUp,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

interface Props {
  score: number;
  previousScore?: number;
  breakdown: {
    fitness: number;
    nutrition: number;
    hydration: number;
  };
}

export default function AnimatedHealthScoreCard({ score, previousScore = 0, breakdown }: Props) {
  const scoreAnimation = useSharedValue(0);
  const fitnessAnimation = useSharedValue(0);
  const nutritionAnimation = useSharedValue(0);
  const hydrationAnimation = useSharedValue(0);

  useEffect(() => {
    scoreAnimation.value = withSpring(score, { damping: 15, stiffness: 100 });
    fitnessAnimation.value = withTiming(breakdown.fitness, { duration: 1000 });
    nutritionAnimation.value = withTiming(breakdown.nutrition, { duration: 1200 });
    hydrationAnimation.value = withTiming(breakdown.hydration, { duration: 1400 });
  }, [score, breakdown]);

  const scoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scoreAnimation.value > 0 ? 1 : 0.8) }],
  }));

  const getScoreColor = (score: number) => {
    if (score >= 80) return Colors.success;
    if (score >= 60) return Colors.warning;
    return Colors.error;
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return '🔥';
    if (score >= 80) return '💪';
    if (score >= 70) return '👍';
    if (score >= 60) return '📈';
    return '💡';
  };

  return (
    <Animated.View entering={FadeInUp.delay(500)} style={styles.container}>
      <LinearGradient
        colors={[Colors.surface, '#f8f9ff']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="analytics" size={24} color={Colors.primary} />
            <Text style={styles.title}>Health Score</Text>
          </View>
          <Text style={styles.emoji}>{getScoreEmoji(score)}</Text>
        </View>

        <Animated.View style={[styles.scoreContainer, scoreStyle]}>
          <Text style={[styles.score, { color: getScoreColor(score) }]}>
            {Math.round(score)}
          </Text>
          <Text style={styles.scoreLabel}>out of 100</Text>
          {previousScore > 0 && (
            <View style={styles.changeContainer}>
              <Ionicons 
                name={score > previousScore ? "trending-up" : "trending-down"} 
                size={16} 
                color={score > previousScore ? Colors.success : Colors.error} 
              />
              <Text style={[
                styles.changeText, 
                { color: score > previousScore ? Colors.success : Colors.error }
              ]}>
                {Math.abs(score - previousScore).toFixed(1)} from yesterday
              </Text>
            </View>
          )}
        </Animated.View>

        <View style={styles.breakdown}>
          <View style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <Ionicons name="barbell" size={20} color={Colors.primary} />
              <Text style={styles.breakdownLabel}>Fitness</Text>
            </View>
            <Text style={styles.breakdownValue}>{breakdown.fitness}%</Text>
          </View>

          <View style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <Ionicons name="nutrition" size={20} color={Colors.success} />
              <Text style={styles.breakdownLabel}>Nutrition</Text>
            </View>
            <Text style={styles.breakdownValue}>{breakdown.nutrition}%</Text>
          </View>

          <View style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <Ionicons name="water" size={20} color={Colors.info} />
              <Text style={styles.breakdownLabel}>Hydration</Text>
            </View>
            <Text style={styles.breakdownValue}>{breakdown.hydration}%</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  gradient: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  emoji: {
    fontSize: 28,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  score: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  changeText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  breakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  breakdownItem: {
    alignItems: 'center',
    flex: 1,
  },
  breakdownHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  breakdownLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    fontWeight: '600',
  },
  breakdownValue: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    color: Colors.text,
  },
});
