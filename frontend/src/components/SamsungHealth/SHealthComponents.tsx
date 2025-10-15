import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import SamsungHealthTheme from '../../constants/samsungHealthTheme';

// Health Card Component - Main container for health metrics
interface HealthCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: boolean;
  gradientColors?: string[];
}

export const HealthCard: React.FC<HealthCardProps> = ({ 
  children, 
  style, 
  gradient = false, 
  gradientColors 
}) => {
  if (gradient && gradientColors && gradientColors.length >= 2) {
    return (
      <LinearGradient
        colors={[gradientColors[0], gradientColors[1], ...(gradientColors.slice(2) || [])]}
        style={[
          SamsungHealthTheme.components.card,
          SamsungHealthTheme.elevation.level2,
          style
        ]}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        SamsungHealthTheme.components.card,
        SamsungHealthTheme.elevation.level2,
        { backgroundColor: SamsungHealthTheme.colors.surface },
        style
      ]}
    >
      {children}
    </View>
  );
};

// Health Metric Display Component
interface HealthMetricProps {
  title: string;
  value: string | number;
  unit: string;
  icon: string;
  color: string;
  target?: number;
  progress?: number;
}

export const HealthMetric: React.FC<HealthMetricProps> = ({
  title,
  value,
  unit,
  icon,
  color,
  target,
  progress
}) => {
  return (
    <View style={{ alignItems: 'center', padding: SamsungHealthTheme.spacing.md }}>
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: SamsungHealthTheme.radius.full,
          backgroundColor: color + '20',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: SamsungHealthTheme.spacing.sm,
        }}
      >
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      
      <Text
        style={[
          SamsungHealthTheme.typography.titleLarge,
          { color: SamsungHealthTheme.colors.onSurface }
        ]}
      >
        {value}
        <Text
          style={[
            SamsungHealthTheme.typography.bodySmall,
            { color: SamsungHealthTheme.colors.onSurfaceVariant }
          ]}
        >
          {' '}{unit}
        </Text>
      </Text>
      
      <Text
        style={[
          SamsungHealthTheme.typography.bodySmall,
          { color: SamsungHealthTheme.colors.onSurfaceVariant }
        ]}
      >
        {title}
      </Text>
      
      {target && progress && (
        <View style={{ marginTop: SamsungHealthTheme.spacing.xs }}>
          <Text
            style={[
              SamsungHealthTheme.typography.labelSmall,
              { color: SamsungHealthTheme.colors.onSurfaceVariant }
            ]}
          >
            {Math.round(progress * 100)}% of {target} {unit}
          </Text>
        </View>
      )}
    </View>
  );
};

// Progress Ring Component - Samsung Health style circular progress
interface ProgressRingProps {
  size?: 'small' | 'medium' | 'large';
  progress: number; // 0 to 1
  color: string;
  strokeWidth?: number;
  children?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  size = 'medium',
  progress,
  color,
  strokeWidth,
  children
}) => {
  const ringSize = SamsungHealthTheme.components.progressRing.size[size];
  const stroke = strokeWidth || SamsungHealthTheme.components.progressRing.strokeWidth;

  return (
    <View
      style={{
        width: ringSize,
        height: ringSize,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Background ring */}
      <View
        style={{
          position: 'absolute',
          width: ringSize,
          height: ringSize,
          borderRadius: ringSize / 2,
          borderWidth: stroke,
          borderColor: SamsungHealthTheme.colors.progressBackground,
        }}
      />
      
      {/* Progress ring */}
      <View
        style={{
          position: 'absolute',
          width: ringSize,
          height: ringSize,
          borderRadius: ringSize / 2,
          borderWidth: stroke,
          borderColor: color,
          borderLeftColor: 'transparent',
          borderBottomColor: 'transparent',
          transform: [{ rotate: `${progress * 360 - 90}deg` }],
        }}
      />
      
      {/* Center content */}
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </View>
    </View>
  );
};

// Samsung Health Button Component
interface SHealthButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export const SHealthButton: React.FC<SHealthButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  disabled = false,
  style
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: SamsungHealthTheme.radius.md,
    };

    switch (size) {
      case 'small':
        baseStyle.paddingVertical = SamsungHealthTheme.spacing.sm;
        baseStyle.paddingHorizontal = SamsungHealthTheme.spacing.md;
        break;
      case 'large':
        baseStyle.paddingVertical = SamsungHealthTheme.spacing.md;
        baseStyle.paddingHorizontal = SamsungHealthTheme.spacing.xl;
        break;
      default:
        baseStyle.paddingVertical = SamsungHealthTheme.spacing.md;
        baseStyle.paddingHorizontal = SamsungHealthTheme.spacing.lg;
    }

    switch (variant) {
      case 'secondary':
        baseStyle.backgroundColor = SamsungHealthTheme.colors.surfaceVariant;
        break;
      case 'outlined':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = SamsungHealthTheme.colors.primary;
        break;
      default:
        baseStyle.backgroundColor = SamsungHealthTheme.colors.primary;
    }

    if (disabled) {
      baseStyle.opacity = 0.5;
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      ...SamsungHealthTheme.typography.labelLarge,
    };

    switch (variant) {
      case 'secondary':
        baseStyle.color = SamsungHealthTheme.colors.onSurface;
        break;
      case 'outlined':
        baseStyle.color = SamsungHealthTheme.colors.primary;
        break;
      default:
        baseStyle.color = '#FFFFFF';
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {icon && (
        <Ionicons
          name={icon as any}
          size={18}
          color={variant === 'primary' ? '#FFFFFF' : SamsungHealthTheme.colors.primary}
          style={{ marginRight: SamsungHealthTheme.spacing.sm }}
        />
      )}
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};

// Quick Action Button Component
interface QuickActionProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  color: string;
}

export const QuickAction: React.FC<QuickActionProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  color
}) => {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: SamsungHealthTheme.colors.surface,
        borderRadius: SamsungHealthTheme.radius.lg,
        padding: SamsungHealthTheme.spacing.md,
        alignItems: 'center',
        minWidth: 100,
        ...SamsungHealthTheme.elevation.level1,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: SamsungHealthTheme.radius.full,
          backgroundColor: color + '20',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: SamsungHealthTheme.spacing.sm,
        }}
      >
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      
      <Text
        style={[
          SamsungHealthTheme.typography.labelMedium,
          { 
            color: SamsungHealthTheme.colors.onSurface,
            textAlign: 'center'
          }
        ]}
      >
        {title}
      </Text>
      
      {subtitle && (
        <Text
          style={[
            SamsungHealthTheme.typography.bodySmall,
            { 
              color: SamsungHealthTheme.colors.onSurfaceVariant,
              textAlign: 'center',
              marginTop: 2
            }
          ]}
        >
          {subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// Section Header Component
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    title: string;
    onPress: () => void;
  };
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action
}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SamsungHealthTheme.spacing.md,
        paddingVertical: SamsungHealthTheme.spacing.sm,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={[
            SamsungHealthTheme.typography.titleMedium,
            { color: SamsungHealthTheme.colors.onSurface }
          ]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              SamsungHealthTheme.typography.bodySmall,
              { color: SamsungHealthTheme.colors.onSurfaceVariant }
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      
      {action && (
        <TouchableOpacity onPress={action.onPress} activeOpacity={0.7}>
          <Text
            style={[
              SamsungHealthTheme.typography.labelMedium,
              { color: SamsungHealthTheme.colors.primary }
            ]}
          >
            {action.title}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default {
  HealthCard,
  HealthMetric,
  ProgressRing,
  SHealthButton,
  QuickAction,
  SectionHeader,
};