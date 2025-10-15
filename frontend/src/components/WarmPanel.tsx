import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { WarmTheme } from '../constants/warmTheme';

interface WarmPanelProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  delay?: number;
  gradient?: [string, string];
}

const WarmPanel: React.FC<WarmPanelProps> = ({
  title,
  children,
  style,
  titleStyle,
  delay = 0,
  gradient = WarmTheme.gradients.panelBackground as [string, string],
}) => {
  return (
    <Animated.View 
      entering={FadeInUp.delay(delay)} 
      style={[styles.container, style]}
    >
      <LinearGradient
        colors={gradient}
        style={styles.gradient}
      >
        {title && (
          <Text style={[styles.title, titleStyle]}>{title}</Text>
        )}
        {children}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  gradient: {
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: WarmTheme.colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default WarmPanel;