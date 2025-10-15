import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Platform, StatusBar as RNStatusBar, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { deactivateKeepAwake } from 'expo-keep-awake';
import { Colors } from './src/constants/theme';
import * as NavigationBar from 'expo-navigation-bar';

// Auth Context
import { AuthProvider } from './src/contexts/AuthContext';
import { ActivityProvider } from './src/contexts/ActivityContext';
import { UserDataProvider } from './src/contexts/UserDataContext';
import { ThemeProvider } from './src/contexts/ThemeContext';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    // Disable keep awake to allow screen timeout
    deactivateKeepAwake();

    // Configure system UI on Android
    if (Platform.OS === 'android') {
      // Configure status bar
      RNStatusBar.setTranslucent(true);
      RNStatusBar.setBackgroundColor('transparent');
      
      // Configure navigation bar and system UI
      async function configureSystemUI() {
        try {
          // Configure navigation bar - only set what's supported with edge-to-edge
          await NavigationBar.setVisibilityAsync('hidden');
          await NavigationBar.setButtonStyleAsync('light');
          
          // Note: setBehaviorAsync and setBackgroundColorAsync are not supported with edge-to-edge
          // SystemUI.setBackgroundColorAsync is also not supported with edge-to-edge
        } catch (error) {
          console.warn('System UI configuration not supported with edge-to-edge mode:', error);
        }
      }
      configureSystemUI();
    }
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={{ 
        flex: 1, 
        backgroundColor: Colors.background,
        paddingTop: Platform.OS === 'android' ? 0 : undefined
      }}>
        <ThemeProvider>
          <AuthProvider>
            <UserDataProvider>
              <ActivityProvider>
                <AppNavigator />
              </ActivityProvider>
            </UserDataProvider>
          </AuthProvider>
        </ThemeProvider>
      </View>
    </SafeAreaProvider>
  );
}
