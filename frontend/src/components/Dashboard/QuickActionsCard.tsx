import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import DashboardCard from './DashboardCard';

interface QuickAction {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

interface QuickActionsCardProps {
  actions: QuickAction[];
  animationDelay?: number;
  title?: string;
}

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  actions,
  animationDelay = 0,
  title = 'Quick Actions',
}) => {
  return (
    <Animated.View entering={FadeInUp.delay(animationDelay)} style={styles.container}>
      <DashboardCard gradient={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.08)']}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.actionsGrid}>
          {actions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.action}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${action.color}20` }]}>
                <Ionicons name={action.icon} size={18} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </DashboardCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: Spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  action: {
    alignItems: 'center',
    width: '48%',
    paddingVertical: Spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  actionLabel: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
});

export default QuickActionsCard;