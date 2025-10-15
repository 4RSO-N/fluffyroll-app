import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

export default function WelcomeScreen({ navigation }: any) {
  const { updateOnboardingStatus } = useAuth();
  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    try {
      const userProfile = await AsyncStorage.getItem('user_profile');
      const userData = await AsyncStorage.getItem('userData');
      
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        // Check if user has filled basic info (name, birthday, gender, height, weight)
        if (profile.name && profile.birthday && profile.gender && profile.height && profile.currentWeight) {
          setHasExistingProfile(true);
        }
      } else if (userData) {
        const data = JSON.parse(userData);
        // Check if user has filled basic info from old userData format
        if (data.name && data.age && data.gender && data.height && data.weight) {
          setHasExistingProfile(true);
        }
      }
    } catch (error) {
      console.error('Error checking existing profile:', error);
    }
  };

  const handleGetStarted = async () => {
    if (hasExistingProfile) {
      // User already has profile data, skip onboarding
      await updateOnboardingStatus(true);
    } else {
      // New user, start onboarding
      navigation.navigate('BasicInfo', { goals: [] });
    }
  };

  const handleSkip = async () => {
    try {
      await updateOnboardingStatus(true);
    } catch (error) {
      console.error('Skip error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>�</Text>
        <Text style={styles.title}>Welcome to FluffyRoll!</Text>
        <Text style={styles.subtitle}>
          Let's personalize your wellness journey in just a few steps
        </Text>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureText}>Set your health goals</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>Track your progress</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💪</Text>
            <Text style={styles.featureText}>Build healthy habits</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleGetStarted}
        >
          <Text style={styles.primaryButtonText}>
            {hasExistingProfile ? 'Continue to Dashboard' : 'Get Started'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleSkip}
        >
          <Text style={styles.secondaryButtonText}>Skip for Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  features: {
    width: '100%',
    marginTop: Spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  featureText: {
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  buttons: {
    width: '100%',
    paddingBottom: Spacing.lg,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },
});
