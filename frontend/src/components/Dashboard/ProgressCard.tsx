import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import DashboardCard from './DashboardCard';

interface ProgressItem {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface ProgressCardProps {
  title: string;
  items: ProgressItem[];
  animationDelay?: number;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  items,
  animationDelay = 0,
}) => {
  const getPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <Animated.View entering={FadeInUp.delay(animationDelay)} style={styles.container}>
      <DashboardCard gradient={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.08)']}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.progressGrid}>
          {items.map((item) => {
            const percentage = getPercentage(item.current, item.target);
            return (
              <View key={item.id} style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <View style={[styles.progressIcon, { backgroundColor: `${item.color}20` }]}>
                    <Ionicons name={item.icon} size={18} color={item.color} />
                  </View>
                  <Text style={styles.progressLabel}>{item.label}</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <Animated.View 
                      style={[styles.progressFill, { 
                        width: `${percentage}%`,
                        backgroundColor: item.color,
                      }]} 
                    />
                  </View>
                  <Text style={styles.progressPercentage}>
                    {Math.round(percentage)}%
                  </Text>
                </View>
                <Text style={styles.progressText}>
                  {item.current} / {item.target} {item.unit}
                </Text>
              </View>
            );
          })}
        </View>
      </DashboardCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: 'white',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  progressGrid: {
    gap: Spacing.md,
  },
  progressItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  progressIcon: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    flex: 1,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    flex: 1,
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  progressPercentage: {
    fontSize: FontSizes.xs,
    color: 'white',
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
  progressText: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
});

export default ProgressCard;