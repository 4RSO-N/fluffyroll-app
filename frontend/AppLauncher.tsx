import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Import both app versions
import OriginalApp from './App';
import SamsungHealthApp from './SamsungHealthApp';

// Theme constants
const LauncherTheme = {
  colors: {
    primary: '#2196F3',
    primaryDark: '#1976D2',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    onSurface: '#212121',
    onSurfaceVariant: '#757575',
    warm: '#F5E6D3',
    warmAccent: '#E8B86D',
  },
  spacing: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    md: 8,
    lg: 12,
    xl: 16,
  },
};

const AppLauncher: React.FC = () => {
  const [selectedApp, setSelectedApp] = useState<'original' | 'samsung' | null>(null);

  if (selectedApp === 'original') {
    return <OriginalApp />;
  }

  if (selectedApp === 'samsung') {
    return <SamsungHealthApp />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={LauncherTheme.colors.background} />
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>FluffyRoll</Text>
          <Text style={styles.subtitle}>Choose Your Experience</Text>
        </View>

        {/* App Options */}
        <View style={styles.optionsContainer}>
          {/* Original FluffyRoll */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => setSelectedApp('original')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[LauncherTheme.colors.warm, LauncherTheme.colors.warmAccent]}
              style={styles.optionGradient}
            >
              <View style={styles.optionContent}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
                  <Ionicons name="leaf" size={32} color="#FFFFFF" />
                </View>
                <Text style={styles.optionTitle}>Original FluffyRoll</Text>
                <Text style={styles.optionDescription}>
                  Warm, wellness-focused design with comprehensive health tracking
                </Text>
                <View style={styles.featureList}>
                  <Text style={styles.featureItem}>• Warm beige theme</Text>
                  <Text style={styles.featureItem}>• Wellness dashboard</Text>
                  <Text style={styles.featureItem}>• Habit tracking</Text>
                  <Text style={styles.featureItem}>• Journaling</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Samsung Health Style */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => setSelectedApp('samsung')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[LauncherTheme.colors.primary, LauncherTheme.colors.primaryDark]}
              style={styles.optionGradient}
            >
              <View style={styles.optionContent}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
                  <Ionicons name="fitness" size={32} color="#FFFFFF" />
                </View>
                <Text style={styles.optionTitle}>Samsung Health Style</Text>
                <Text style={styles.optionDescription}>
                  Clean, modern design inspired by Samsung Health
                </Text>
                <View style={styles.featureList}>
                  <Text style={styles.featureItem}>• Samsung Health design</Text>
                  <Text style={styles.featureItem}>• Health monitoring</Text>
                  <Text style={styles.featureItem}>• Advanced analytics</Text>
                  <Text style={styles.featureItem}>• Social features</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Both versions share the same core functionality with different visual styles
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LauncherTheme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: LauncherTheme.spacing.lg,
    paddingVertical: LauncherTheme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: LauncherTheme.spacing.xl * 2,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: LauncherTheme.colors.onSurface,
    marginBottom: LauncherTheme.spacing.sm,
  },
  subtitle: {
    fontSize: 18,
    color: LauncherTheme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: LauncherTheme.spacing.lg,
  },
  optionCard: {
    borderRadius: LauncherTheme.radius.xl,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  optionGradient: {
    padding: LauncherTheme.spacing.lg,
    minHeight: 200,
  },
  optionContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: LauncherTheme.spacing.md,
  },
  optionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: LauncherTheme.spacing.sm,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: LauncherTheme.spacing.md,
    opacity: 0.9,
  },
  featureList: {
    alignItems: 'flex-start',
  },
  featureItem: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
    opacity: 0.8,
  },
  footer: {
    alignItems: 'center',
    marginTop: LauncherTheme.spacing.xl,
  },
  footerText: {
    fontSize: 14,
    color: LauncherTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default AppLauncher;