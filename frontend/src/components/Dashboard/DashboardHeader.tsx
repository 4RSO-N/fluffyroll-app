import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '../../constants/theme';

interface QuickStat {
  label: string;
  value: string | number;
}

interface DashboardHeaderProps {
  greeting: string;
  userName: string;
  date: string;
  quickStats: QuickStat[];
  notificationCount?: number;
  onNotificationPress: () => void;
  backgroundGradient?: string[];
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  greeting,
  userName,
  date,
  quickStats,
  notificationCount = 0,
  onNotificationPress,
  backgroundGradient = Colors.gradient.background,
}) => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={backgroundGradient as [string, string, ...string[]]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <Animated.View entering={FadeInDown.delay(100)}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {/* Main Header Info */}
            <View style={styles.headerMain}>
              <Animated.Text 
                style={styles.greeting}
                entering={FadeInUp.delay(200)}
              >
                {greeting}, {userName}!
              </Animated.Text>
              <Animated.Text 
                style={styles.date}
                entering={FadeInUp.delay(300)}
              >
                {date}
              </Animated.Text>
            </View>
            
            {/* Header Actions */}
            <Animated.View style={styles.headerActions} entering={FadeInUp.delay(300)}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={onNotificationPress}
              >
                <Ionicons name="notifications-outline" size={20} color="white" />
                {notificationCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.badgeText}>{notificationCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
          
          {/* Quick Stats Bar */}
          <Animated.View style={styles.quickStatsContainer} entering={FadeInUp.delay(400)}>
            <View style={styles.quickStatsCard}>
              {quickStats.map((stat, index) => (
                <React.Fragment key={stat.label}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                  {index < quickStats.length - 1 && (
                    <View style={styles.statDivider} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerMain: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.lg,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    ...Shadows.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  greeting: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: Spacing.xs,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  date: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  quickStatsContainer: {
    marginTop: Spacing.lg,
  },
  quickStatsCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: 'white',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: Spacing.sm,
  },
});

export default DashboardHeader;