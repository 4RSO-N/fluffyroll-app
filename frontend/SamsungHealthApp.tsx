import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Platform, StatusBar as RNStatusBar, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { deactivateKeepAwake } from 'expo-keep-awake';
import SamsungHealthTheme from './src/constants/samsungHealthTheme';
import * as NavigationBar from 'expo-navigation-bar';

// Context Providers
import { AuthProvider } from './src/contexts/AuthContext';
import { ActivityProvider } from './src/contexts/ActivityContext';

// Samsung Health Navigation
import SamsungHealthNavigator from './src/navigation/SamsungHealthNavigator';

export default function SamsungHealthApp() {
  useEffect(() => {
    // Disable keep awake to allow screen timeout
    deactivateKeepAwake();

    // Configure system UI on Android
    if (Platform.OS === 'android') {
      // Configure status bar for Samsung Health theme
      RNStatusBar.setTranslucent(true);
      RNStatusBar.setBackgroundColor('transparent');
      RNStatusBar.setBarStyle('dark-content');
      
      // Configure navigation bar
      async function configureSystemUI() {
        try {
          await NavigationBar.setVisibilityAsync('visible');
          await NavigationBar.setButtonStyleAsync('dark');
        } catch (error) {
          console.warn('System UI configuration error:', error);
        }
      }
      configureSystemUI();
    }
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <View style={{ 
        flex: 1, 
        backgroundColor: SamsungHealthTheme.colors.background,
        paddingTop: Platform.OS === 'android' ? 0 : undefined
      }}>
        <NavigationContainer>
          <AuthProvider>
            <ActivityProvider>
              <SamsungHealthNavigator />
            </ActivityProvider>
          </AuthProvider>
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}