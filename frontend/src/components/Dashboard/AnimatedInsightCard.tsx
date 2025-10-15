import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

interface Props {
  readonly title: string;
  readonly message: string;
  readonly type: 'success' | 'warning' | 'info' | 'tip';
  readonly icon?: string;
  readonly actionText?: string;
  readonly onAction?: () => void;
  readonly delay?: number;
}

export default function AnimatedInsightCard({
  title,
  message,
  type,
  icon,
  actionText,
  onAction,
  delay = 0,
}: Props) {
  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: `${Colors.success}10`,
          borderColor: Colors.success,
          iconColor: Colors.success,
          defaultIcon: 'checkmark-circle',
        };
      case 'warning':
        return {
          backgroundColor: `${Colors.warning}10`,
          borderColor: Colors.warning,
          iconColor: Colors.warning,
          defaultIcon: 'warning',
        };
      case 'info':
        return {
          backgroundColor: `${Colors.info}10`,
          borderColor: Colors.info,
          iconColor: Colors.info,
          defaultIcon: 'information-circle',
        };
      case 'tip':
        return {
          backgroundColor: `${Colors.primary}10`,
          borderColor: Colors.primary,
          iconColor: Colors.primary,
          defaultIcon: 'bulb',
        };
      default:
        return {
          backgroundColor: `${Colors.primary}10`,
          borderColor: Colors.primary,
          iconColor: Colors.primary,
          defaultIcon: 'information-circle',
        };
    }
  };

  const config = getTypeConfig();

  return (
    <Animated.View 
      entering={FadeInUp.delay(delay)} 
      style={styles.outerContainer}
    >
      <View 
        style={[
          styles.container,
          {
            backgroundColor: config.backgroundColor,
            borderLeftColor: config.borderColor,
          }
        ]}
      >
        <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons 
            name={(icon || config.defaultIcon) as any} 
            size={24} 
            color={config.iconColor} 
          />
          <Text style={styles.title}>{title}</Text>
        </View>
        
        <Text style={styles.message}>{message}</Text>
        
        {actionText && onAction && (
          <TouchableOpacity style={styles.actionButton} onPress={onAction}>
            <Text style={[styles.actionText, { color: config.iconColor }]}>
              {actionText}
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={16} 
              color={config.iconColor} 
              style={styles.actionIcon}
            />
          </TouchableOpacity>
        )}
      </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  container: {
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  message: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: FontSizes.lg,
    marginBottom: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  actionText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  actionIcon: {
    marginLeft: Spacing.xs,
  },
});
