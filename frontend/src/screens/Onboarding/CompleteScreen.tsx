import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fitnessAPI } from '../../services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';

export default function CompleteScreen({ navigation, route }: any) {
  const [saving, setSaving] = useState(false);
  const { updateOnboardingStatus } = useAuth();
  const userData = route.params;

  const saveUserData = async () => {
    try {
      // Save that onboarding is complete
      await AsyncStorage.setItem('onboardingComplete', 'true');

      // If fitness goals exist, save fitness profile
      if (userData?.dailyCalorieGoal) {
        await fitnessAPI.updateProfile({
          currentWeightKg: userData.currentWeightKg,
          targetWeightKg: userData.targetWeightKg,
          heightCm: userData.heightCm,
          dailyCalorieGoal: userData.dailyCalorieGoal,
          dailyProteinG: userData.dailyProteinG,
          dailyCarbsG: 200,
          dailyFatG: 65,
          dailyWaterGlasses: userData.dailyWaterGlasses,
          activityLevel: userData.activityLevel,
        });
      }

      setSaving(false);
    } catch (error) {
      console.error('Save user data error:', error);
      setSaving(false);
    }
  };

  if (saving) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Setting up your profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>You're All Set!</Text>
        <Text style={styles.subtitle}>
          Your personalized wellness journey starts now
        </Text>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
            <Text style={styles.featureText}>Profile created</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
            <Text style={styles.featureText}>Goals set</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
            <Text style={styles.featureText}>Ready to track</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={async () => {
            try {
              setSaving(true);
              await saveUserData();
              await updateOnboardingStatus(true);
            } catch (error) {
              console.error('Error completing onboarding:', error);
            }
          }}
        >
          <Text style={styles.primaryButtonText}>
            {saving ? 'Setting up...' : 'Go to Dashboard'}
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
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
  checkCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  checkmark: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
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
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
