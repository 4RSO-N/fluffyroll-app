import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Colors, Spacing, FontSizes } from '../../constants/theme';
import DashboardCard from './DashboardCard';

interface HealthData {
  score: number;
  breakdown: {
    fitness: number;
    nutrition: number;
    hydration: number;
  };
}

interface WellnessScoreCardProps {
  healthData: HealthData;
  animationDelay?: number;
}

export const WellnessScoreCard: React.FC<WellnessScoreCardProps> = ({
  healthData,
  animationDelay = 0,
}) => {
  return (
    <Animated.View entering={FadeInUp.delay(animationDelay)} style={styles.container}>
      <DashboardCard gradient={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}>
        <View style={styles.header}>
          <View style={styles.scoreContainer}>
            <Text style={styles.score}>{Math.round(healthData.score)}</Text>
            <Text style={styles.label}>Wellness Score</Text>
          </View>
          <View style={styles.scoreRing}>
            <Text style={styles.percentage}>%</Text>
          </View>
        </View>
        
        <View style={styles.breakdown}>
          <View style={styles.breakdownItem}>
            <View style={[styles.dot, { backgroundColor: Colors.success }]} />
            <Text style={styles.dotLabel}>Fitness</Text>
            <Text style={styles.dotValue}>{healthData.breakdown.fitness}%</Text>
          </View>
          <View style={styles.breakdownItem}>
            <View style={[styles.dot, { backgroundColor: Colors.accent }]} />
            <Text style={styles.dotLabel}>Nutrition</Text>
            <Text style={styles.dotValue}>{healthData.breakdown.nutrition}%</Text>
          </View>
          <View style={styles.breakdownItem}>
            <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
            <Text style={styles.dotLabel}>Hydration</Text>
            <Text style={styles.dotValue}>{healthData.breakdown.hydration}%</Text>
          </View>
        </View>
      </DashboardCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  scoreContainer: {
    alignItems: 'flex-start',
  },
  score: {
    fontSize: 42,
    fontWeight: '800',
    color: 'white',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  scoreRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentage: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.8)',
  },
  breakdown: {
    flexDirection: 'column',
    gap: Spacing.sm,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotLabel: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    flex: 1,
  },
  dotValue: {
    fontSize: FontSizes.xs,
    color: 'white',
    fontWeight: '600',
  },
});

export default WellnessScoreCard;