import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  userInfo?: {
    email: string;
    hashedPassword: string;
  };
}

class BiometricAuthService {
  private static readonly BIOMETRIC_ENABLED_KEY = 'biometricEnabled';
  private static readonly BIOMETRIC_USER_KEY = 'biometricUserInfo';

  /**
   * Check if biometric authentication is available on the device
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  /**
   * Check if biometric authentication is enabled for the current user
   */
  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(this.BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking biometric enabled status:', error);
      return false;
    }
  }

  /**
   * Enable biometric authentication for the current user
   */
  static async enableBiometric(email: string, password: string): Promise<BiometricAuthResult> {
    try {
      // First check if biometric is available
      const available = await this.isAvailable();
      if (!available) {
        return {
          success: false,
          error: 'Biometric authentication is not available on this device'
        };
      }

      // Test biometric authentication
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify your identity to enable biometric authentication',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
      });

      if (!authResult.success) {
        return {
          success: false,
          error: 'Biometric authentication failed'
        };
      }

      // Store user credentials securely (in a real app, you'd want to hash/encrypt these)
      const userInfo = {
        email: email,
        hashedPassword: password // In production, this should be properly hashed
      };

      await SecureStore.setItemAsync(this.BIOMETRIC_USER_KEY, JSON.stringify(userInfo));
      await AsyncStorage.setItem(this.BIOMETRIC_ENABLED_KEY, 'true');

      return {
        success: true,
        userInfo
      };
    } catch (error) {
      console.error('Error enabling biometric authentication:', error);
      return {
        success: false,
        error: 'Failed to enable biometric authentication'
      };
    }
  }

  /**
   * Disable biometric authentication
   */
  static async disableBiometric(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.BIOMETRIC_ENABLED_KEY, 'false');
      await SecureStore.deleteItemAsync(this.BIOMETRIC_USER_KEY);
    } catch (error) {
      console.error('Error disabling biometric authentication:', error);
    }
  }

  /**
   * Authenticate using biometrics and return stored user credentials
   */
  static async authenticateWithBiometrics(): Promise<BiometricAuthResult> {
    try {
      // Check if biometric is enabled
      const enabled = await this.isBiometricEnabled();
      if (!enabled) {
        return {
          success: false,
          error: 'Biometric authentication is not enabled'
        };
      }

      // Check if biometric is available
      const available = await this.isAvailable();
      if (!available) {
        return {
          success: false,
          error: 'Biometric authentication is not available'
        };
      }

      // Perform biometric authentication
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Sign in with your fingerprint or face',
        fallbackLabel: 'Use password',
        cancelLabel: 'Cancel',
      });

      if (!authResult.success) {
        return {
          success: false,
          error: 'Biometric authentication was cancelled or failed'
        };
      }

      // Retrieve stored user credentials
      const storedUserInfo = await SecureStore.getItemAsync(this.BIOMETRIC_USER_KEY);
      if (!storedUserInfo) {
        return {
          success: false,
          error: 'No biometric credentials found'
        };
      }

      const userInfo = JSON.parse(storedUserInfo);
      return {
        success: true,
        userInfo
      };
    } catch (error) {
      console.error('Error authenticating with biometrics:', error);
      return {
        success: false,
        error: 'Biometric authentication failed'
      };
    }
  }

  /**
   * Get supported biometric types
   */
  static async getSupportedBiometricTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.error('Error getting supported biometric types:', error);
      return [];
    }
  }

  /**
   * Get a user-friendly string for the available biometric types
   */
  static async getBiometricTypeString(): Promise<string> {
    try {
      const types = await this.getSupportedBiometricTypes();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'Face ID';
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'Fingerprint';
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        return 'Iris';
      } else {
        return 'Biometric';
      }
    } catch (error) {
      console.error('Error getting biometric type string:', error);
      return 'Biometric';
    }
  }
}

export default BiometricAuthService;