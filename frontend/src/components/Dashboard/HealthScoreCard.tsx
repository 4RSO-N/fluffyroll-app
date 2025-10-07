import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

interface HealthScoreCardProps {
  score: number; // 0-100
  previousScore?: number;
  breakdown: {
    fitness: number;
    nutrition: number;
    hydration: number;
    sleep?: number;
    habits?: number;
  };
}

export default function HealthScoreCard({
  score,
  previousScore,
  breakdown,
}: HealthScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 85) return Colors.success;
    if (score >= 70) return Colors.primary;
    if (score >= 50) return Colors.warning;
    return Colors.error;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Improvement';
  };

  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);
  const scoreDiff = previousScore ? score - previousScore : 0;

  // Calculate circumference for circular progress
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Score</Text>
        {scoreDiff !== 0 && (
          <View style={styles.trendContainer}>
            <Ionicons 
              name={scoreDiff > 0 ? 'trending-up' : 'trending-down'} 
              size={16} 
              color={scoreDiff > 0 ? Colors.success : Colors.error} 
            />
            <Text style={[
              styles.trendText,
              { color: scoreDiff > 0 ? Colors.success : Colors.error }
            ]}>
              {scoreDiff > 0 ? '+' : ''}{scoreDiff.toFixed(1)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.scoreSection}>
        <View style={styles.circularProgress}>
          {/* Background circle */}
          <View style={styles.circleBackground} />
          
          {/* Progress circle - simplified representation */}
          <View style={[
            styles.circleProgress,
            {
              borderColor: scoreColor,
              transform: [{ rotate: `${(score / 100) * 360}deg` }]
            }
          ]} />
          
          <View style={styles.scoreContent}>
            <Text style={[styles.scoreValue, { color: scoreColor }]}>
              {Math.round(score)}
            </Text>
            <Text style={styles.scoreLabel}>{scoreLabel}</Text>
          </View>
        </View>

        <View style={styles.breakdown}>
          <Text style={styles.breakdownTitle}>Contributing Factors</Text>
          
          <View style={styles.breakdownItem}>
            <View style={styles.breakdownRow}>
              <Ionicons name="fitness" size={16} color={Colors.success} />
              <Text style={styles.breakdownLabel}>Fitness</Text>
            </View>
            <Text style={styles.breakdownValue}>{breakdown.fitness}%</Text>
          </View>

          <View style={styles.breakdownItem}>
            <View style={styles.breakdownRow}>
              <Ionicons name="restaurant" size={16} color={Colors.primary} />
              <Text style={styles.breakdownLabel}>Nutrition</Text>
            </View>
            <Text style={styles.breakdownValue}>{breakdown.nutrition}%</Text>
          </View>

          <View style={styles.breakdownItem}>
            <View style={styles.breakdownRow}>
              <Ionicons name="water" size={16} color={Colors.info} />
              <Text style={styles.breakdownLabel}>Hydration</Text>
            </View>
            <Text style={styles.breakdownValue}>{breakdown.hydration}%</Text>
          </View>

          {breakdown.sleep && (
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownRow}>
                <Ionicons name="moon" size={16} color={Colors.secondary} />
                <Text style={styles.breakdownLabel}>Sleep</Text>
              </View>
              <Text style={styles.breakdownValue}>{breakdown.sleep}%</Text>
            </View>
          )}

          {breakdown.habits && (
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownRow}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.warning} />
                <Text style={styles.breakdownLabel}>Habits</Text>
              </View>
              <Text style={styles.breakdownValue}>{breakdown.habits}%</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
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
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circularProgress: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
    position: 'relative',
  },
  circleBackground: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 8,
    borderColor: Colors.border,
  },
  circleProgress: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 8,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  scoreContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  scoreValue: {
    fontSize: FontSizes.xxxl,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  breakdown: {
    flex: 1,
  },
  breakdownTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  breakdownValue: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text,
  },
});