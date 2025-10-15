import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WarmTheme } from '../constants/warmTheme';

const { width, height } = Dimensions.get('window');

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "Loading your wellness journey..." }: LoadingScreenProps) {
  const dot1Anim = useRef(new Animated.Value(0.4)).current;
  const dot2Anim = useRef(new Animated.Value(0.4)).current;
  const dot3Anim = useRef(new Animated.Value(0.4)).current;
  const logoBreathAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start loading dots animation immediately
    const animateDots = () => {
      Animated.sequence([
        Animated.timing(dot1Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(dot2Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(dot3Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(dot1Anim, { toValue: 0.4, duration: 400, useNativeDriver: true }),
          Animated.timing(dot2Anim, { toValue: 0.4, duration: 400, useNativeDriver: true }),
          Animated.timing(dot3Anim, { toValue: 0.4, duration: 400, useNativeDriver: true }),
        ]),
      ]).start(() => animateDots());
    };

    // Subtle breathing animation for logo
    const breatheAnimation = () => {
      Animated.sequence([
        Animated.timing(logoBreathAnim, { toValue: 1.02, duration: 2000, useNativeDriver: true }),
        Animated.timing(logoBreathAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ]).start(() => breatheAnimation());
    };

    // Start animations immediately
    animateDots();
    breatheAnimation();
  }, [dot1Anim, dot2Anim, dot3Anim, logoBreathAnim]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      {/* Warm Background Gradient */}
      <LinearGradient
        colors={WarmTheme.gradients.pageBackground as [string, string, string]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Animated.View 
            style={[
              styles.logoBackground,
              {
                transform: [{ scale: logoBreathAnim }],
              },
            ]}
          >
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="cover"
            />
          </Animated.View>
        </View>

        {/* App Name */}
        <View style={styles.textContainer}>
          <Text style={styles.appName}>FluffyRoll</Text>
          <Text style={styles.tagline}>Wellness Journey</Text>
          <Text style={styles.loadingMessage}>{message}</Text>
        </View>

        {/* Loading indicator dots */}
        <View style={styles.dotsContainer}>
          <View style={styles.dots}>
            <Animated.View style={[styles.dot, { opacity: dot1Anim }]} />
            <Animated.View style={[styles.dot, { opacity: dot2Anim }]} />
            <Animated.View style={[styles.dot, { opacity: dot3Anim }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WarmTheme.colors.panelBackground.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logoBackground: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 70, // Make the image itself circular
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: WarmTheme.colors.primary,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 18,
    color: WarmTheme.colors.secondary,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.8,
  },
  loadingMessage: {
    fontSize: 16,
    color: WarmTheme.colors.secondary,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.7,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: WarmTheme.colors.accent.primary,
    marginHorizontal: 6,
  },
});