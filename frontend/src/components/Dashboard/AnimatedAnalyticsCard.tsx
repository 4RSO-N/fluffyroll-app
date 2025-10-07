import React, { useEffect, useState } from 'react';
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
  SlideInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - (Spacing.lg * 4); // Account for card padding

interface AnimatedAnalyticsCardProps {
  title: string;
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
    }>;
  };
  chartType: 'line' | 'bar';
  color: string;
  suffix?: string;
  delay?: number;
}

export default function AnimatedAnalyticsCard({
  title,
  data,
  chartType,
  color,
  suffix = '',
  delay = 0,
}: AnimatedAnalyticsCardProps) {
  const [showChart, setShowChart] = useState(false);
  const scaleValue = useSharedValue(0.9);
  const chartOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const statsScale = useSharedValue(0);

  useEffect(() => {
    // Card entrance animation
    scaleValue.value = withDelay(
      delay,
      withSpring(1, {
        damping: 15,
        stiffness: 200,
      })
    );

    // Header slide down
    headerTranslateY.value = withDelay(
      delay + 200,
      withSpring(0, {
        damping: 15,
        stiffness: 200,
      })
    );

    // Show chart with delay
    setTimeout(() => {
      setShowChart(true);
      chartOpacity.value = withTiming(1, { duration: 800 });
    }, delay + 400);

    // Stats animation
    statsScale.value = withDelay(
      delay + 800,
      withSequence(
        withSpring(1.1, { damping: 10, stiffness: 200 }),
        withSpring(1, { damping: 15, stiffness: 200 })
      )
    );
  }, [delay]);

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: headerTranslateY.value }],
    };
  });

  const chartAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: chartOpacity.value,
    };
  });

  const statsAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: statsScale.value }],
    };
  });

  // Calculate stats from data
  const dataPoints = data.datasets[0]?.data || [];
  const currentValue = dataPoints[dataPoints.length - 1] || 0;
  const previousValue = dataPoints[dataPoints.length - 2] || 0;
  const average = dataPoints.reduce((sum, val) => sum + val, 0) / dataPoints.length || 0;
  const maxValue = Math.max(...dataPoints) || 0;
  const minValue = Math.min(...dataPoints) || 0;
  const trend = currentValue > previousValue ? 'up' : currentValue < previousValue ? 'down' : 'stable';
  const trendPercentage = previousValue > 0 ? ((currentValue - previousValue) / previousValue * 100) : 0;

  const getTrendColor = () => {
    if (trend === 'up') return Colors.success;
    if (trend === 'down') return Colors.error;
    return Colors.textSecondary;
  };

  const getTrendIcon = () => {
    if (trend === 'up') return 'trending-up';
    if (trend === 'down') return 'trending-down';
    return 'remove';
  };

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'rgba(255,255,255,0)',
    backgroundGradientTo: 'rgba(255,255,255,0)',
    decimalPlaces: 0,
    color: (opacity = 1) => `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
    labelColor: (opacity = 1) => Colors.textSecondary,
    style: {
      borderRadius: BorderRadius.md,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: color,
      fill: color,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: 'rgba(0,0,0,0.1)',
      strokeWidth: 1,
    },
  };

  return (
    <Animated.View
      style={[styles.container, cardAnimatedStyle]}
      entering={FadeInUp.delay(delay).springify()}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
        style={styles.card}
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <View style={styles.titleContainer}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
              <Ionicons 
                name={chartType === 'line' ? 'analytics' : 'bar-chart'} 
                size={20} 
                color={color} 
              />
            </View>
            <Text style={styles.title}>{title}</Text>
          </View>

          {/* Current Value */}
          <Animated.View style={[styles.currentValueContainer, statsAnimatedStyle]}>
            <Text style={[styles.currentValue, { color }]}>
              {Math.round(currentValue)}{suffix}
            </Text>
            <View style={styles.trendContainer}>
              <Ionicons 
                name={getTrendIcon()} 
                size={14} 
                color={getTrendColor()} 
              />
              <Text style={[styles.trendText, { color: getTrendColor() }]}>
                {Math.abs(trendPercentage).toFixed(1)}%
              </Text>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Chart */}
        <Animated.View style={[styles.chartContainer, chartAnimatedStyle]}>
          {showChart && (
            <View style={styles.chart}>
              {chartType === 'line' ? (
                <LineChart
                  data={data}
                  width={chartWidth}
                  height={180}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chartStyle}
                  withInnerLines={true}
                  withOuterLines={false}
                  withVerticalLabels={true}
                  withHorizontalLabels={true}
                  getDotColor={() => color}
                  onDataPointClick={(value) => {
                    // Add haptic feedback or tooltip here
                  }}
                />
              ) : (
                <BarChart
                  data={data}
                  width={chartWidth}
                  height={180}
                  chartConfig={chartConfig}
                  style={styles.chartStyle}
                  withInnerLines={true}
                  showValuesOnTopOfBars={false}
                  withCustomBarColorFromData={false}
                />
              )}
            </View>
          )}
        </Animated.View>

        {/* Stats Summary */}
        <Animated.View 
          style={[styles.statsContainer, statsAnimatedStyle]}
          entering={SlideInDown.delay(delay + 1000)}
        >
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Average</Text>
            <Text style={[styles.statValue, { color }]}>
              {Math.round(average)}{suffix}
            </Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Peak</Text>
            <Text style={[styles.statValue, { color: Colors.success }]}>
              {Math.round(maxValue)}{suffix}
            </Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Low</Text>
            <Text style={[styles.statValue, { color: Colors.error }]}>
              {Math.round(minValue)}{suffix}
            </Text>
          </View>
        </Animated.View>

        {/* Gradient Overlay for Visual Enhancement */}
        <LinearGradient
          colors={[`${color}05`, 'transparent']}
          style={styles.gradientOverlay}
          pointerEvents="none"
        />
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
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
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
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  currentValueContainer: {
    alignItems: 'flex-end',
  },
  currentValue: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  trendText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  chartContainer: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  chart: {
    alignItems: 'center',
  },
  chartStyle: {
    marginVertical: 0,
    borderRadius: BorderRadius.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: Spacing.sm,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
});