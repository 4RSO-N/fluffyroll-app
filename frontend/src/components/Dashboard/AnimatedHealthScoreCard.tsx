import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Spacing, FontSizes, BorderRadius } from '../../constants/theme';

interface Props {
  readonly score: number;
  readonly previousScore?: number;
  readonly breakdown: {
    readonly fitness: number;
    readonly nutrition: number;
    readonly hydration: number;
  };
}

const AnimatedText = Animated.createAnimatedComponent(Text);

export default function AnimatedHealthScoreCard({ score, previousScore = 0, breakdown }: Props) {
  // Animation values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const displayScore = useSharedValue(previousScore);

  // Initialize animations
  React.useEffect(() => {
    opacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    scale.value = withDelay(300, withSpring(1, { damping: 15 }));
    displayScore.value = withDelay(500, withTiming(score, { duration: 1000 }));
  }, [score]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  // Render score using callback to prevent access during render
  const renderScore = useCallback(() => {
    'worklet';
    return Math.round(displayScore.value).toString();
  }, []);

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.transparentCard}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>💖 Health Score</Text>
            <Text style={styles.subtitle}>Your wellness journey today</Text>
          </View>
          
          <View style={styles.scoreSection}>
            <View style={styles.scoreContainer}>
              <AnimatedText style={styles.score}>
                {renderScore()}
              </AnimatedText>
              <Text style={styles.scoreLabel}>Wellness Points</Text>
            </View>
            
            <View style={styles.breakdownContainer}>
              <View style={styles.breakdownItem}>
                <View style={[styles.breakdownBar, { backgroundColor: 'rgba(76, 175, 80, 0.8)' }]}>
                  <View style={[styles.breakdownFill, { width: `${breakdown.fitness}%`, backgroundColor: '#4CAF50' }]} />
                </View>
                <Text style={styles.breakdownLabel}>Fitness {breakdown.fitness}%</Text>
              </View>
              
              <View style={styles.breakdownItem}>
                <View style={[styles.breakdownBar, { backgroundColor: 'rgba(255, 152, 0, 0.8)' }]}>
                  <View style={[styles.breakdownFill, { width: `${breakdown.nutrition}%`, backgroundColor: '#FF9800' }]} />
                </View>
                <Text style={styles.breakdownLabel}>Nutrition {breakdown.nutrition}%</Text>
              </View>
              
              <View style={styles.breakdownItem}>
                <View style={[styles.breakdownBar, { backgroundColor: 'rgba(33, 150, 243, 0.8)' }]}>
                  <View style={[styles.breakdownFill, { width: `${breakdown.hydration}%`, backgroundColor: '#2196F3' }]} />
                </View>
                <Text style={styles.breakdownLabel}>Hydration {breakdown.hydration}%</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
  },
  transparentCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  scoreSection: {
    alignItems: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  score: {
    fontSize: 56,
    fontWeight: '800',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  scoreLabel: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.9)',
    marginTop: Spacing.xs,
    fontWeight: '500',
  },
  breakdownContainer: {
    width: '100%',
  },
  breakdownItem: {
    marginBottom: Spacing.md,
  },
  breakdownBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: Spacing.xs,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 4,
  },
  breakdownLabel: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
});
