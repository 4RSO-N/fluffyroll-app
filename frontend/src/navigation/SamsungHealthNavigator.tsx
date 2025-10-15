import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SamsungHealthTheme from '../constants/samsungHealthTheme';

// Import screens
import SamsungHealthDashboard from '../screens/Dashboard/SamsungHealthDashboard';
import HealthMonitoringScreen from '../screens/Health/HealthMonitoringScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Placeholder screens to match Samsung Health structure
const TogetherScreen = () => (
  <View style={{ 
    flex: 1, 
    backgroundColor: SamsungHealthTheme.colors.background,
    justifyContent: 'center', 
    alignItems: 'center' 
  }}>
    <Ionicons 
      name="people-outline" 
      size={48} 
      color={SamsungHealthTheme.colors.onSurfaceVariant} 
    />
    <Text
      style={[
        SamsungHealthTheme.typography.titleLarge,
        { color: SamsungHealthTheme.colors.onSurface, marginTop: 16 }
      ]}
    >
      Together
    </Text>
    <Text
      style={[
        SamsungHealthTheme.typography.bodyMedium,
        { color: SamsungHealthTheme.colors.onSurfaceVariant, marginTop: 8, textAlign: 'center' }
      ]}
    >
      Connect with friends and join challenges
    </Text>
  </View>
);

const DiscoverScreen = () => (
  <View style={{ 
    flex: 1, 
    backgroundColor: SamsungHealthTheme.colors.background,
    justifyContent: 'center', 
    alignItems: 'center' 
  }}>
    <Ionicons 
      name="compass-outline" 
      size={48} 
      color={SamsungHealthTheme.colors.onSurfaceVariant} 
    />
    <Text
      style={[
        SamsungHealthTheme.typography.titleLarge,
        { color: SamsungHealthTheme.colors.onSurface, marginTop: 16 }
      ]}
    >
      Discover
    </Text>
    <Text
      style={[
        SamsungHealthTheme.typography.bodyMedium,
        { color: SamsungHealthTheme.colors.onSurfaceVariant, marginTop: 8, textAlign: 'center' }
      ]}
    >
      Explore new workouts and health content
    </Text>
  </View>
);

const MyPageScreen = () => (
  <View style={{ 
    flex: 1, 
    backgroundColor: SamsungHealthTheme.colors.background,
    justifyContent: 'center', 
    alignItems: 'center' 
  }}>
    <Ionicons 
      name="person-outline" 
      size={48} 
      color={SamsungHealthTheme.colors.onSurfaceVariant} 
    />
    <Text
      style={[
        SamsungHealthTheme.typography.titleLarge,
        { color: SamsungHealthTheme.colors.onSurface, marginTop: 16 }
      ]}
    >
      My Page
    </Text>
    <Text
      style={[
        SamsungHealthTheme.typography.bodyMedium,
        { color: SamsungHealthTheme.colors.onSurfaceVariant, marginTop: 8, textAlign: 'center' }
      ]}
    >
      Personal settings and profile
    </Text>
  </View>
);

// Stack navigator for Home tab (to allow navigation within the home section)
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Dashboard" component={SamsungHealthDashboard} />
    <Stack.Screen name="HealthMonitoring" component={HealthMonitoringScreen} />
  </Stack.Navigator>
);

// Tab bar icon component
const getTabBarIcon = (route: any, focused: boolean, color: string, size: number) => {
  let iconName: string;

  switch (route.name) {
    case 'Home':
      iconName = focused ? 'home' : 'home-outline';
      break;
    case 'Together':
      iconName = focused ? 'people' : 'people-outline';
      break;
    case 'Discover':
      iconName = focused ? 'compass' : 'compass-outline';
      break;
    case 'My Page':
      iconName = focused ? 'person' : 'person-outline';
      break;
    default:
      iconName = 'home-outline';
  }

  return <Ionicons name={iconName as any} size={size} color={color} />;
};

const SamsungHealthNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => getTabBarIcon(route, focused, color, size),
        tabBarActiveTintColor: SamsungHealthTheme.colors.primary,
        tabBarInactiveTintColor: SamsungHealthTheme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: SamsungHealthTheme.colors.surface,
          borderTopColor: SamsungHealthTheme.colors.outline,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 85 : 65,
          ...SamsungHealthTheme.elevation.level2,
        },
        tabBarLabelStyle: {
          ...SamsungHealthTheme.typography.labelSmall,
          fontSize: 11,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Together" 
        component={TogetherScreen}
        options={{
          tabBarLabel: 'Together',
        }}
      />
      <Tab.Screen 
        name="Discover" 
        component={DiscoverScreen}
        options={{
          tabBarLabel: 'Discover',
        }}
      />
      <Tab.Screen 
        name="My Page" 
        component={MyPageScreen}
        options={{
          tabBarLabel: 'My Page',
        }}
      />
    </Tab.Navigator>
  );
};

export default SamsungHealthNavigator;