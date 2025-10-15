import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { WarmTheme } from '../constants/warmTheme';

interface WarmModalButton {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'cancel';
}

interface WarmModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  children?: React.ReactNode;
  buttons?: WarmModalButton[];
}

const WarmModal: React.FC<WarmModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  icon,
  iconColor = WarmTheme.colors.accent.primary,
  children,
  buttons = [{ title: 'Close', onPress: onClose, type: 'cancel' }],
}) => {
  const getButtonGradient = (type: string): [string, string] => {
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
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <BlurView intensity={100} style={styles.modalOverlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <Animated.View 
            style={styles.modalContent}
            entering={ZoomIn.springify()}
            exiting={ZoomOut.springify()}
          >
            <LinearGradient
              colors={WarmTheme.gradients.modalBackground as [string, string]}
              style={styles.modalGradient}
            >
              {/* Header with Icon */}
              {icon && (
                <View style={styles.modalHeader}>
                  <View style={[styles.modalIconContainer, { backgroundColor: iconColor }]}>
                    <Ionicons name={icon as any} size={24} color="white" />
                  </View>
                </View>
              )}
              
              {/* Title */}
              <Text style={styles.modalTitle}>{title}</Text>
              
              {/* Subtitle */}
              {subtitle && (
                <Text style={styles.modalSubtitle}>{subtitle}</Text>
              )}

              {/* Content */}
              {children && (
                <View style={styles.modalContent}>
                  {children}
                </View>
              )}

              {/* Buttons */}
              <View style={styles.modalButtons}>
                {buttons.map((button, index) => (
                  <TouchableOpacity
                    key={`${button.title}-${index}`}
                    style={[styles.modalButton, buttons.length === 1 && styles.singleButton]}
                    onPress={button.onPress}
                  >
                    <LinearGradient
                      colors={getButtonGradient(button.type || 'cancel')}
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.buttonText}>{button.title}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </LinearGradient>
          </Animated.View>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
};

// Reusable Input Component for modals
interface WarmInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  multiline?: boolean;
}

export const WarmInput: React.FC<WarmInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.multilineInput]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={WarmTheme.colors.secondary}
      keyboardType={keyboardType}
      multiline={multiline}
    />
  </View>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  modalGradient: {
    padding: 24,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: WarmTheme.colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: WarmTheme.colors.primary,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: WarmTheme.colors.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: WarmTheme.colors.primary,
    borderWidth: 1,
    borderColor: 'rgba(139,69,19,0.2)',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  singleButton: {
    flex: 1,
  },
  buttonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default WarmModal;