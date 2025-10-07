import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
  Extrapolate,
  FadeInLeft,
  SlideInRight,
  BounceIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

interface AnimatedInsightCardProps {
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'tip';
  icon?: string;
  actionText?: string;
  onAction?: () => void;
  delay?: number;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function AnimatedInsightCard({
  title,
  message,
  type,
  icon,
  actionText,
  onAction,
  delay = 0,
}: AnimatedInsightCardProps) {
  const scaleValue = useSharedValue(0.9);
  const iconScale = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const shimmerTranslateX = useSharedValue(-200);

  useEffect(() => {
    // Card entrance animation
    scaleValue.value = withDelay(
      delay,
      withSpring(1, {
        damping: 15,
        stiffness: 200,
      })
    );

    // Icon bounce animation
    iconScale.value = withDelay(
      delay + 200,
      withSequence(
        withSpring(1.2, { damping: 10, stiffness: 200 }),
        withSpring(1, { damping: 15, stiffness: 200 })
      )
    );

    // Pulse animation for important insights
    if (type === 'warning' || type === 'info') {
      pulseScale.value = withDelay(
        delay + 800,
        withSequence(
          withTiming(1.02, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        )
      );
    }

    // Shimmer effect for success type
    if (type === 'success') {
      shimmerTranslateX.value = withDelay(
        delay + 600,
        withTiming(400, { duration: 1500 })
      );
    }
  }, [delay, type]);

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scaleValue.value },
        { scale: pulseScale.value },
      ],
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: iconScale.value }],
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shimmerTranslateX.value }],
    };
  });

  const handleActionPress = () => {
    if (onAction) {
      // Button press animation
      buttonScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withSpring(1, { damping: 15, stiffness: 300 })
      );
      
      // Icon celebration
      iconScale.value = withSequence(
        withTiming(1.3, { duration: 200 }),
        withSpring(1, { damping: 15, stiffness: 200 })
      );
      
      onAction();
    }
  };

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: Colors.success,
          gradientColors: [`${Colors.success}15`, `${Colors.success}10`],
          iconName: icon || 'checkmark-circle',
          iconColor: Colors.success,
          borderColor: `${Colors.success}30`,
        };
      case 'warning':
        return {
          backgroundColor: Colors.warning,
          gradientColors: [`${Colors.warning}15`, `${Colors.warning}10`],
          iconName: icon || 'warning',
          iconColor: Colors.warning,
          borderColor: `${Colors.warning}30`,
        };
      case 'info':
        return {
          backgroundColor: Colors.info,
          gradientColors: [`${Colors.info}15`, `${Colors.info}10`],
          iconName: icon || 'information-circle',
          iconColor: Colors.info,
          borderColor: `${Colors.info}30`,
        };
      case 'tip':
        return {
          backgroundColor: Colors.secondary,
          gradientColors: [`${Colors.secondary}15`, `${Colors.secondary}10`],
          iconName: icon || 'bulb',
          iconColor: Colors.secondary,
          borderColor: `${Colors.secondary}30`,
        };
      default:
        return {
          backgroundColor: Colors.primary,
          gradientColors: ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)'],
          iconName: 'information-circle',
          iconColor: Colors.primary,
          borderColor: `${Colors.primary}30`,
        };
    }
  };

  const typeConfig = getTypeConfig();

  return (
    <Animated.View
      style={[styles.container, cardAnimatedStyle]}
      entering={FadeInLeft.delay(delay).springify()}
    >
      <LinearGradient
        colors={typeConfig.gradientColors}
        style={[
          styles.card,
          {
            borderLeftColor: typeConfig.backgroundColor,
            borderLeftWidth: 4,
          }
        ]}
      >
        {/* Shimmer effect for success cards */}
        {type === 'success' && (
          <Animated.View 
            style={[styles.shimmer, shimmerAnimatedStyle]}
          />
        )}
        
        <View style={styles.content}>
          <View style={styles.header}>
            {/* Icon */}
            <Animated.View 
              style={[
                styles.iconContainer, 
                { backgroundColor: `${typeConfig.iconColor}20` },
                iconAnimatedStyle
              ]}
              entering={BounceIn.delay(delay + 100)}
            >
              <Ionicons 
                name={typeConfig.iconName as any} 
                size={24} 
                color={typeConfig.iconColor} 
              />
            </Animated.View>

            {/* Title and Message */}
            <View style={styles.textContainer}>
              <Animated.Text 
                style={styles.title}
                entering={SlideInRight.delay(delay + 200)}
              >
                {title}
              </Animated.Text>
              <Animated.Text 
                style={styles.message}
                entering={SlideInRight.delay(delay + 300)}
              >
                {message}
              </Animated.Text>
            </View>
          </View>

          {/* Action Button */}
          {actionText && onAction && (
            <Animated.View 
              style={[styles.actionContainer, buttonAnimatedStyle]}
              entering={SlideInRight.delay(delay + 400)}
            >
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: typeConfig.backgroundColor }
                ]}
                onPress={handleActionPress}
                activeOpacity={0.8}
              >
                <Text style={styles.actionButtonText}>{actionText}</Text>
                <Ionicons 
                  name="arrow-forward" 
                  size={16} 
                  color="white" 
                  style={styles.actionIcon}
                />
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        {/* Floating decoration for tips */}
        {type === 'tip' && (
          <Animated.View 
            style={styles.tipDecoration}
            entering={BounceIn.delay(delay + 600).springify()}
          >
            <Ionicons name="star" size={12} color={Colors.secondary} />
          </Animated.View>
        )}

        {/* Priority indicator for warnings */}
        {type === 'warning' && (
          <Animated.View 
            style={styles.priorityIndicator}
            entering={BounceIn.delay(delay + 500)}
          >
            <View style={[styles.priorityDot, { backgroundColor: Colors.warning }]} />
            <View style={[styles.priorityDot, { backgroundColor: Colors.warning }]} />
            <View style={[styles.priorityDot, { backgroundColor: Colors.warning }]} />
          </Animated.View>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    position: 'relative',
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    width: 200,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    transform: [{ skewX: '-45deg' }],
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
    paddingTop: Spacing.xs,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
    lineHeight: FontSizes.lg * 1.3,
  },
  message: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    lineHeight: FontSizes.md * 1.4,
    fontWeight: '500',
  },
  actionContainer: {
    marginTop: Spacing.lg,
    alignSelf: 'flex-start',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: 'white',
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  actionIcon: {
    marginLeft: Spacing.sm,
  },
  tipDecoration: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: `${Colors.secondary}20`,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityIndicator: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
  },
  priorityDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginLeft: 2,
  },
});