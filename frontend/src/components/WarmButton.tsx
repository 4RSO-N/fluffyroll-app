import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { WarmTheme } from '../constants/warmTheme';

interface WarmButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'cancel';
  icon?: string;
  iconSize?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

const WarmButton: React.FC<WarmButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  icon,
  iconSize = 20,
  style,
  textStyle,
  disabled = false,
}) => {
  const getGradient = (): [string, string] => {
    if (disabled) {
      return ['#D1D5DB', '#9CA3AF'];
    }
    
    switch (type) {
      case 'primary':
        return WarmTheme.gradients.primaryButton as [string, string];
      case 'secondary':
        return WarmTheme.gradients.secondaryButton as [string, string];
      case 'cancel':
      default:
        return WarmTheme.gradients.cancelButton as [string, string];
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <LinearGradient
        colors={getGradient()}
        style={styles.gradient}
      >
        {icon && (
          <Ionicons 
            name={icon as any} 
            size={iconSize} 
            color="white" 
            style={styles.icon}
          />
        )}
        <Text style={[styles.text, textStyle, disabled && styles.disabledText]}>
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 48,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  disabledText: {
    color: '#9CA3AF',
  },
});

export default WarmButton;