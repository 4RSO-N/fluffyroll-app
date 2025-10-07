import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/theme';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

// Onboarding Screens
import WelcomeScreen from '../screens/Onboarding/WelcomeScreen';
import GoalsScreen from '../screens/Onboarding/GoalsScreen';
import BasicInfoScreen from '../screens/Onboarding/BasicInfoScreen';
import FitnessProfileScreen from '../screens/Onboarding/FitnessProfileScreen';
import CompleteScreen from '../screens/Onboarding/CompleteScreen';

// Main Screens
import SimplifiedDashboardScreen from '../screens/Dashboard/SimplifiedDashboardScreen';
import FitnessScreen from '../screens/Fitness/FitnessScreen';
import HabitsScreen from '../screens/Habits/HabitsScreen';
import ProfileScreen from '../screens/Dashboard/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OnboardingWelcome" component={WelcomeScreen} />
      <Stack.Screen name="OnboardingGoals" component={GoalsScreen} />
      <Stack.Screen name="OnboardingBasicInfo" component={BasicInfoScreen} />
      <Stack.Screen name="OnboardingFitnessProfile" component={FitnessProfileScreen} />
      <Stack.Screen name="OnboardingComplete" component={CompleteScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Fitness') {
            iconName = focused ? 'fitness' : 'fitness-outline';
          } else if (route.name === 'Habits') {
            iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={SimplifiedDashboardScreen} />
      <Tab.Screen name="Fitness" component={FitnessScreen} />
      <Tab.Screen name="Habits" component={HabitsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function MainAppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboarding();
  }, [user]);

  const checkOnboarding = async () => {
    try {
      const completed = await AsyncStorage.getItem('onboardingComplete');
      setOnboardingComplete(completed === 'true');
    } catch (error) {
      console.error('Check onboarding error:', error);
      setOnboardingComplete(false);
    }
  };

  if (loading || onboardingComplete === null) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : !onboardingComplete ? (
          <Stack.Screen name="Onboarding" component={OnboardingStack} />
        ) : (
          <Stack.Screen name="MainApp" component={MainAppStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}