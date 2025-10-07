import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

interface InsightCardProps {
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'tip';
  actionText?: string;
  onAction?: () => void;
}

export default function InsightCard({ 
  title, 
  message, 
  type, 
  actionText, 
  onAction 
}: InsightCardProps) {
  const getInsightStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: Colors.success + '15',
          borderColor: Colors.success + '30',
          iconColor: Colors.success,
          iconName: 'checkmark-circle' as const,
        };
      case 'warning':
        return {
          backgroundColor: Colors.warning + '15',
          borderColor: Colors.warning + '30',
          iconColor: Colors.warning,
          iconName: 'warning' as const,
        };
      case 'info':
        return {
          backgroundColor: Colors.info + '15',
          borderColor: Colors.info + '30',
          iconColor: Colors.info,
          iconName: 'information-circle' as const,
        };
      case 'tip':
        return {
          backgroundColor: Colors.primary + '15',
          borderColor: Colors.primary + '30',
          iconColor: Colors.primary,
          iconName: 'bulb' as const,
        };
      default:
        return {
          backgroundColor: Colors.primary + '15',
          borderColor: Colors.primary + '30',
          iconColor: Colors.primary,
          iconName: 'bulb' as const,
        };
    }
  };

  const style = getInsightStyle();

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
      }
    ]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons 
            name={style.iconName} 
            size={20} 
            color={style.iconColor} 
            style={styles.icon}
          />
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>
      
      <Text style={styles.message}>{message}</Text>
      
      {actionText && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={[styles.actionText, { color: style.iconColor }]}>
            {actionText}
          </Text>
          <Ionicons 
            name="arrow-forward" 
            size={16} 
            color={style.iconColor} 
            style={styles.actionIcon}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  message: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
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