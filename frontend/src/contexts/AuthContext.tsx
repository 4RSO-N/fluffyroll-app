// frontend/src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import API_CONFIG from '../config/api';
import BiometricAuthService from '../services/biometricAuth';

interface User {
  id: string;
  email: string;
  name: string;
  displayName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  isBiometricEnabled: boolean;
  isBiometricAvailable: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithBiometrics: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateOnboardingStatus: (completed: boolean) => Promise<void>;
  enableBiometric: (email: string, password: string) => Promise<boolean>;
  disableBiometric: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  useEffect(() => {
    checkAuth();
    checkBiometricStatus();
  }, []);

  const checkBiometricStatus = async () => {
    try {
      const available = await BiometricAuthService.isAvailable();
      const enabled = await BiometricAuthService.isBiometricEnabled();
      setIsBiometricAvailable(available);
      setIsBiometricEnabled(enabled);
    } catch (error) {
      console.error('Error checking biometric status:', error);
    }
  };

  const checkAuth = async () => {
    const startTime = Date.now();
    const minimumLoadingTime = 1500; // 1.5 seconds - enough to see the loading screen
    
    try {
      const token = await SecureStore.getItemAsync('token');
      const onboardingStatus = await SecureStore.getItemAsync('onboardingCompleted');
      
      if (token) {
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // For now, just set a dummy user if token exists
        const dummyUser = { 
          id: '1', 
          email: 'user@example.com', 
          name: 'User',
          displayName: 'Test User'
        };
        setUser(dummyUser);
        setIsAuthenticated(true);
        setHasCompletedOnboarding(onboardingStatus === 'true');
      } else {
        setIsAuthenticated(false);
        setHasCompletedOnboarding(false);
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      setIsAuthenticated(false);
      setHasCompletedOnboarding(false);
    } finally {
      // Ensure minimum loading time so users can see the loading screen
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);
      
      setTimeout(() => {
        setLoading(false);
      }, remainingTime);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log(`Attempting to log in with email: ${email}`);
      
      const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/login`, {
        email,
        password,
      });
      
      const { accessToken, user } = response.data;
      await SecureStore.setItemAsync('token', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setUser(user);
      setIsAuthenticated(true);

      // Check if onboarding was completed before
      const onboardingStatus = await SecureStore.getItemAsync('onboardingCompleted');
      setHasCompletedOnboarding(onboardingStatus === 'true');

    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Login failed');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/register`, {
        email,
        password,
        displayName: name,
      });
      
      const { accessToken, user } = response.data;
      await SecureStore.setItemAsync('token', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setUser(user);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Registration failed');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('onboardingCompleted');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    setHasCompletedOnboarding(false);
  };

  const updateOnboardingStatus = async (completed: boolean) => {
    try {
      await SecureStore.setItemAsync('onboardingCompleted', completed.toString());
      setHasCompletedOnboarding(completed);
    } catch (error) {
      console.error('Failed to update onboarding status:', error);
    }
  };

  const loginWithBiometrics = async () => {
    try {
      const result = await BiometricAuthService.authenticateWithBiometrics();
      
      if (!result.success || !result.userInfo) {
        throw new Error(result.error || 'Biometric authentication failed');
      }

      // Use the stored credentials to perform regular login
      await login(result.userInfo.email, result.userInfo.hashedPassword);
    } catch (error: any) {
      console.error('Biometric login error:', error);
      throw error;
    }
  };

  const enableBiometric = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await BiometricAuthService.enableBiometric(email, password);
      
      if (result.success) {
        setIsBiometricEnabled(true);
        return true;
      } else {
        throw new Error(result.error || 'Failed to enable biometric authentication');
      }
    } catch (error: any) {
      console.error('Enable biometric error:', error);
      throw error;
    }
  };

  const disableBiometric = async () => {
    try {
      await BiometricAuthService.disableBiometric();
      setIsBiometricEnabled(false);
    } catch (error) {
      console.error('Disable biometric error:', error);
      throw error;
    }
  };

  const value = useMemo(() => ({
    user, 
    loading, 
    isAuthenticated,
    hasCompletedOnboarding,
    isBiometricEnabled,
    isBiometricAvailable,
    login,
    loginWithBiometrics,
    register, 
    logout,
    updateOnboardingStatus,
    enableBiometric,
    disableBiometric
  }), [user, loading, isAuthenticated, hasCompletedOnboarding, isBiometricEnabled, isBiometricAvailable]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
