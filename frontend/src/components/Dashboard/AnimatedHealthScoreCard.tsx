import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
  Extrapolate,
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import Svg, { Circle, Path } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');
const size = screenWidth * 0.4;
const strokeWidth = 8;
const radius = (size - strokeWidth) / 2;
const circumference = radius * 2 * Math.PI;

interface AnimatedHealthScoreCardProps {
  score: number;
  previousScore?: number;
  breakdown: {
    fitness: number;
    nutrition: number;
    hydration: number;
  };
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function AnimatedHealthScoreCard({
  score,
  previousScore = 0,
  breakdown,
}: AnimatedHealthScoreCardProps) {
  const progress = useSharedValue(0);
  const scaleValue = useSharedValue(0.8);
  const rotateValue = useSharedValue(0);
  
  // Individual breakdown animations
  const fitnessProgress = useSharedValue(0);
  const nutritionProgress = useSharedValue(0);
  const hydrationProgress = useSharedValue(0);

  useEffect(() => {
    // Main score animation
    progress.value = withDelay(
      300,
      withTiming(score / 100, {
        duration: 2000,
      })
    );

    // Scale animation
    scaleValue.value = withDelay(
      200,
      withSpring(1, {
        damping: 15,
        stiffness: 200,
      })
    );

    // Subtle rotation for visual interest
    rotateValue.value = withDelay(
      500,
      withTiming(360, {
        duration: 3000,
      })
    );

    // Breakdown animations with staggered timing
    fitnessProgress.value = withDelay(
      800,
      withTiming(breakdown.fitness / 100, { duration: 1500 })
    );

    nutritionProgress.value = withDelay(
      1000,
      withTiming(breakdown.nutrition / 100, { duration: 1500 })
    );

    hydrationProgress.value = withDelay(
      1200,
      withTiming(breakdown.hydration / 100, { duration: 1500 })
    );
  }, [score, breakdown]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scaleValue.value },
        { rotate: `${rotateValue.value * 0.1}deg` },
      ],
    };
  });

  const circleAnimatedStyle = useAnimatedStyle(() => {
    const strokeDashoffset = circumference - progress.value * circumference;
    return {
      strokeDashoffset,
    };
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return Colors.success;
    if (score >= 60) return Colors.warning;
    return Colors.error;
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return ['#4ade80', '#22c55e'];
    if (score >= 60) return ['#fbbf24', '#f59e0b'];
    return ['#f87171', '#ef4444'];
  };

  const scoreDifference = score - previousScore;
  const scoreColor = getScoreColor(score);
  const scoreGradient = getScoreGradient(score);

  const BreakdownItem = ({ 
    title, 
    value, 
    icon, 
    color, 
    progressValue, 
    delay 
  }: { 
    title: string; 
    value: number; 
    icon: string; 
    color: string; 
    progressValue: any;
    delay: number;
  }) => {
    const itemAnimatedStyle = useAnimatedStyle(() => {
      const width = progressValue.value * 100;
      return {
        width: `${width}%`,
      };
    });

    return (
      <Animated.View 
        style={styles.breakdownItem}
        entering={FadeInUp.delay(delay)}
      >
        <View style={styles.breakdownHeader}>
          <View style={styles.breakdownTitleContainer}>
            <Ionicons name={icon as any} size={16} color={color} />
            <Text style={styles.breakdownTitle}>{title}</Text>
          </View>
          <Text style={[styles.breakdownValue, { color }]}>{value}%</Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarBackground, { backgroundColor: `${color}20` }]}>
            <Animated.View 
              style={[
                styles.progressBarFill, 
                { backgroundColor: color },
                itemAnimatedStyle
              ]} 
            />
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <Animated.View 
      style={styles.container}
      entering={ZoomIn.delay(200).springify()}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
        style={styles.card}
      >
        <Text style={styles.title}>Health Score</Text>
        
        <View style={styles.scoreContainer}>
          {/* Main Circular Progress */}
          <Animated.View style={[styles.circleContainer, animatedStyle]}>
            <Svg width={size} height={size} style={styles.svg}>
              {/* Background Circle */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="rgba(0,0,0,0.1)"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              
              {/* Progress Circle */}
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={scoreColor}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={circumference}
                strokeLinecap="round"
                style={circleAnimatedStyle}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            </Svg>
            
            {/* Score Text */}
            <View style={styles.scoreTextContainer}>
              <Animated.Text 
                style={[styles.scoreText, { color: scoreColor }]}
                entering={ZoomIn.delay(1500)}
              >
                {Math.round(score)}
              </Animated.Text>
              <Text style={styles.scoreSubtext}>Health Score</Text>
              
              {/* Score Change Indicator */}
              {scoreDifference !== 0 && (
                <Animated.View 
                  style={styles.changeIndicator}
                  entering={FadeInUp.delay(2000)}
                >
                  <Ionicons 
                    name={scoreDifference > 0 ? 'trending-up' : 'trending-down'} 
                    size={16} 
                    color={scoreDifference > 0 ? Colors.success : Colors.error} 
                  />
                  <Text 
                    style={[
                      styles.changeText,
                      { color: scoreDifference > 0 ? Colors.success : Colors.error }
                    ]}
                  >
                    {Math.abs(scoreDifference)}
                  </Text>
                </Animated.View>
              )}
            </View>
          </Animated.View>
        </View>

        {/* Breakdown Section */}
        <View style={styles.breakdownContainer}>
          <Text style={styles.breakdownHeader}>Breakdown</Text>
          
          <BreakdownItem
            title="Fitness"
            value={breakdown.fitness}
            icon="fitness"
            color={Colors.success}
            progressValue={fitnessProgress}
            delay={1600}
          />
          
          <BreakdownItem
            title="Nutrition"
            value={breakdown.nutrition}
            icon="restaurant"
            color={Colors.primary}
            progressValue={nutritionProgress}
            delay={1700}
          />
          
          <BreakdownItem
            title="Hydration"
            value={breakdown.hydration}
            icon="water"
            color={Colors.info}
            progressValue={hydrationProgress}
            delay={1800}
          />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  circleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    transform: [{ rotate: '0deg' }],
  },
  scoreTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: FontSizes.xxxl,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scoreSubtext: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: Spacing.xs,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  changeText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  breakdownContainer: {
    marginTop: Spacing.lg,
  },
  breakdownHeader: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  breakdownItem: {
    marginBottom: Spacing.md,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  breakdownTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  breakdownValue: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  progressBarContainer: {
    marginTop: Spacing.xs,
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});