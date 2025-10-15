import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Spacing, BorderRadius, Shadows } from '../../constants/theme';

interface DashboardCardProps {
  children: React.ReactNode;
  gradient?: [string, string];
  style?: ViewStyle;
  padding?: keyof typeof Spacing;
  shadow?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  children,
  gradient = ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.08)'],
  style,
  padding = 'lg',
  shadow = false,
}) => {
  return (
    <View style={[styles.container, shadow && Shadows.md, style]}>
      <LinearGradient
        colors={gradient as [string, string, ...string[]]}
        style={[styles.gradient, { padding: Spacing[padding] }]}
      >
        {children}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: BorderRadius.xl,
  },
});

export default DashboardCard;