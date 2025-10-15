import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import Animated, {
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface CustomAlertProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'destructive' | 'cancel';
  }>;
  icon?: string;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  onClose,
  title,
  message,
  type = 'info',
  buttons = [{ text: 'OK', onPress: onClose }],
  icon,
}) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          colors: ['#FF8C42', '#FF7F50'],
          iconName: 'checkmark-circle',
          iconColor: '#FF8C42',
        };
      case 'error':
        return {
          colors: ['#CD853F', '#A0522D'],
          iconName: 'close-circle',
          iconColor: '#CD853F',
        };
      case 'warning':
        return {
          colors: ['#D2691E', '#A0522D'],
          iconName: 'warning',
          iconColor: '#D2691E',
        };
      default:
        return {
          colors: ['#FF7F50', '#D2691E'],
          iconName: 'information-circle',
          iconColor: '#FF7F50',
        };
    }
  };

  const typeConfig = getTypeConfig();

  const handleButtonPress = (button: any) => {
    if (button.onPress) {
      button.onPress();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          entering={SlideInDown.duration(300).springify()}
          exiting={SlideOutDown.duration(200)}
          style={styles.alertContainer}
        >
          <LinearGradient
            colors={['rgba(255,248,240,0.98)', 'rgba(255,248,240,0.95)']}
            style={styles.alertContent}
          >
              {/* Header with Icon */}
              <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: `${typeConfig.iconColor}15` }]}>
                  <Ionicons
                    name={icon || typeConfig.iconName as any}
                    size={32}
                    color={typeConfig.iconColor}
                  />
                </View>
              </View>

              {/* Content - Scrollable */}
              <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                <ScrollView 
                  style={styles.messageContainer}
                  showsVerticalScrollIndicator={true}
                  persistentScrollbar={true}
                >
                  <Text style={styles.message}>{message}</Text>
                </ScrollView>
              </View>

              {/* Buttons - Always visible at bottom */}
              <View style={styles.buttonContainer}>
                {buttons.map((button, index) => {
                  let gradientColors: [string, string];
                  let textColor: string;
                  
                  if (button.style === 'destructive') {
                    gradientColors = ['#CD853F', '#A0522D']; // Warm brown for destructive
                    textColor = '#FFFFFF';
                  } else if (button.style === 'cancel') {
                    gradientColors = ['#8B7355', '#6B5B47']; // Neutral warm brown for cancel
                    textColor = '#FFFFFF';
                  } else {
                    gradientColors = ['#FF8C42', '#FF7F50']; // Primary warm orange
                    textColor = '#FFFFFF';
                  }

                  return (
                    <TouchableOpacity
                      key={`alert-button-${button.text}-${index}`}
                      style={[
                        styles.button,
                        button.style === 'destructive' && styles.destructiveButton,
                        button.style === 'cancel' && styles.cancelButton,
                        buttons.length === 1 && styles.singleButton,
                      ]}
                      onPress={() => handleButtonPress(button)}
                    >
                      <LinearGradient
                        colors={gradientColors}
                        style={styles.buttonGradient}
                      >
                        <Text
                          style={[
                            styles.buttonText,
                            { color: textColor },
                          ]}
                        >
                          {button.text}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay to create better contrast
  },
  alertContainer: {
    width: screenWidth * 0.92,
    maxWidth: 420,
    minHeight: 280, // Increased minimum height for more space
    maxHeight: '85%', // Increased max height for more content
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12, // Android shadow
  },
  alertContent: {
    paddingVertical: 28,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    marginBottom: 28,
  },
  messageContainer: {
    maxHeight: 250,
    width: '100%',
    marginTop: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513', // Warm brown for consistency
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#8B4513', // Warm brown for consistency
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
  },
  button: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 48,
  },
  singleButton: {
    flex: 1,
  },
  buttonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  destructiveButton: {
    // Styling handled by gradient colors
  },
  cancelButton: {
    // Styling handled by gradient colors
  },
});

export default CustomAlert;