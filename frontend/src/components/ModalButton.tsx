import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ModalButtonProps {
  title: string;
  onPress: () => void;
  type?: 'cancel' | 'primary' | 'destructive';
  disabled?: boolean;
  style?: any;
}

const ModalButton: React.FC<ModalButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  disabled = false,
  style,
}) => {
  const getGradientColors = (): [string, string] => {
    if (disabled) {
      return ['#D1D5DB', '#9CA3AF'];
    }
    
    switch (type) {
      case 'cancel':
        return ['#D2691E', '#A0522D'];
      case 'destructive':
        return ['#CD853F', '#A0522D'];
      case 'primary':
      default:
        return ['#FF8C42', '#FF7F50'];
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <LinearGradient
        colors={getGradientColors()}
        style={styles.gradient}
      >
        <Text style={[styles.text, disabled && styles.disabledText]}>
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 6,
  },
  gradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabledText: {
    opacity: 0.6,
  },
});

export default ModalButton;