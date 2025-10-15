import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Colors, Spacing, FontSizes } from '../constants/theme';
import LoadingScreen from '../components/LoadingScreen';

// Import screens
import AnimatedDashboardScreen from '../screens/Dashboard/AnimatedDashboardScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import FitnessScreen from '../screens/Fitness/FitnessScreen';
import HabitsScreen from '../screens/Habits/HabitsScreen';
import ComprehensiveProfileScreen from '../screens/Dashboard/ComprehensiveProfileScreen';
import SettingsScreen from '../screens/Dashboard/SettingsScreen';
import WelcomeScreen from '../screens/Onboarding/WelcomeScreen';
import BasicInfoScreen from '../screens/Onboarding/BasicInfoScreen';
import FitnessProfileScreen from '../screens/Onboarding/FitnessProfileScreen';
import GoalsScreen from '../screens/Onboarding/GoalsScreen';
import CompleteScreen from '../screens/Onboarding/CompleteScreen';

const Tab = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();
const OnboardingStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// Tab bar icons
const ProfileTabIcon = ({ focused, color, size }: { focused: boolean; color: string; size: number }) => (
  <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
);

// Profile Stack Navigator
function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ComprehensiveProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
}

// Onboarding Stack Navigator
function OnboardingNavigator() {
  return (
    <OnboardingStack.Navigator 
      screenOptions={{ 
        headerShown: false,
        contentStyle: {
          backgroundColor: Colors.background
        }
      }}
    >
      <OnboardingStack.Screen 
        name="Welcome" 
        component={WelcomeScreen}
        options={{
          contentStyle: {
            backgroundColor: Colors.background
          }
        }}
      />
      <OnboardingStack.Screen 
        name="BasicInfo" 
        component={BasicInfoScreen}
        options={{
          contentStyle: {
            backgroundColor: Colors.background
          }
        }}
      />
      <OnboardingStack.Screen 
        name="FitnessProfile" 
        component={FitnessProfileScreen}
        options={{
          contentStyle: {
            backgroundColor: Colors.background
          }
        }}
      />
      <OnboardingStack.Screen 
        name="Goals" 
        component={GoalsScreen}
        options={{
          contentStyle: {
            backgroundColor: Colors.background
          }
        }}
      />
      <OnboardingStack.Screen 
        name="Complete" 
        component={CompleteScreen}
        options={{
          contentStyle: {
            backgroundColor: Colors.background
          }
        }}
      />
    </OnboardingStack.Navigator>
  );
}

// Auth Stack Navigator
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

// Tab Bar Icon Component
const TabBarIcon = ({ focused, color, size, route }: { focused: boolean; color: string; size: number; route: any }) => {
  let iconName: string;

  if (route.name === 'Dashboard') {
    iconName = focused ? 'home' : 'home-outline';
  } else if (route.name === 'Fitness') {
    iconName = focused ? 'barbell' : 'barbell-outline';
  } else if (route.name === 'Habits') {
    iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
  } else if (route.name === 'Profile') {
    iconName = focused ? 'person-circle' : 'person-circle-outline';
  } else {
    iconName = 'home-outline';
  }

  return <Ionicons name={iconName as any} size={size} color={color} />;
};

// Tab bar icon renderer
const renderTabBarIcon = (route: any) => (props: any) => (
  <TabBarIcon {...props} route={route} />
);

// Main Tab Navigator
function MainTabNavigator() {

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: renderTabBarIcon(route),
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: {
          backgroundColor: 'rgba(255,248,240,0.98)',
          borderTopColor: 'rgba(139,69,19,0.1)',
          paddingTop: Platform.OS === 'android' ? 12 : 8,
          height: Platform.OS === 'android' ? 70 : 60,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          shadowOpacity: 0,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'android' ? 12 : 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
                component={AnimatedDashboardScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Fitness" 
        component={FitnessScreen}
        options={{
          tabBarLabel: 'Fitness',
        }}
      />
      <Tab.Screen 
        name="Habits" 
        component={HabitsScreen}
        options={{
          tabBarLabel: 'Habits',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ProfileTabIcon,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading: isLoading, hasCompletedOnboarding } = useAuth();
  const { colors, isDarkMode } = useTheme();

  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
    dark: isDarkMode,
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  const renderNavigator = () => {
    if (!isAuthenticated) {
      return <AuthNavigator />;
    }
    if (!hasCompletedOnboarding) {
      return <OnboardingNavigator />;
    }
    return <MainTabNavigator />;
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <SafeAreaView 
        edges={['right', 'left', 'bottom']} 
        style={[
          styles.container,
          { 
            paddingTop: 0,
            backgroundColor: colors.background,
          }
        ]}
      >
        {renderNavigator()}
      </SafeAreaView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  loadingSubtext: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  placeholderTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: FontSizes.xl,
  },
});