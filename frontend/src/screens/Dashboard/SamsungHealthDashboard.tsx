import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useActivity } from '../../contexts/ActivityContext';
import SamsungHealthTheme from '../../constants/samsungHealthTheme';
import {
  HealthCard,
  HealthMetric,
  ProgressRing,
  SHealthButton,
  QuickAction,
  SectionHeader
} from '../../components/SamsungHealth/SHealthComponents';

const { width: screenWidth } = Dimensions.get('window');

// Main Progress Ring Component
interface MainProgressRingProps {
  stepsProgress: number;
  exerciseProgress: number;
  sleepProgress: number;
  waterProgress: number;
  achievementsCount: number;
}

const MainProgressRing: React.FC<MainProgressRingProps> = ({
  stepsProgress,
  exerciseProgress,
  sleepProgress,
  waterProgress,
  achievementsCount
}) => (
  <View style={{ alignItems: 'center', marginVertical: SamsungHealthTheme.spacing.lg }}>
    <View style={{ position: 'relative' }}>
      {/* Outer rings for different metrics */}
      <View style={{ position: 'absolute', top: -20, left: -20 }}>
        <ProgressRing
          size="large"
          progress={stepsProgress}
          color={SamsungHealthTheme.colors.steps}
          strokeWidth={6}
        />
      </View>
      <View style={{ position: 'absolute', top: -10, left: -10 }}>
        <ProgressRing
          size="medium"
          progress={exerciseProgress}
          color={SamsungHealthTheme.colors.exercise}
          strokeWidth={6}
        />
      </View>
      
      {/* Center content */}
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: SamsungHealthTheme.colors.surface,
          justifyContent: 'center',
          alignItems: 'center',
          ...SamsungHealthTheme.elevation.level2,
        }}
      >
        <Text
          style={[
            SamsungHealthTheme.typography.titleLarge,
            { color: SamsungHealthTheme.colors.onSurface }
          ]}
        >
          {Math.round((stepsProgress + exerciseProgress + sleepProgress + waterProgress) * 25)}%
        </Text>
        <Text
          style={[
            SamsungHealthTheme.typography.labelSmall,
            { color: SamsungHealthTheme.colors.onSurfaceVariant }
          ]}
        >
          Today
        </Text>
      </View>
    </View>
    
    <Text
      style={[
        SamsungHealthTheme.typography.titleMedium,
        { 
          color: SamsungHealthTheme.colors.onSurface,
          marginTop: SamsungHealthTheme.spacing.md
        }
      ]}
    >
      {achievementsCount} of 4 goals completed
    </Text>
  </View>
);

const SamsungHealthDashboard: React.FC = () => {
  const { todaysActivity } = useActivity();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Calculate progress percentages
  const stepsProgress = Math.min((todaysActivity.stepsCount || 0) / 10000, 1);
  const exerciseProgress = Math.min((todaysActivity.exerciseMinutes || 0) / 30, 1);
  const sleepProgress = Math.min((todaysActivity.sleepHours || 0) / 8, 1);
  const waterProgress = Math.min((todaysActivity.waterIntake || 0) / 2000, 1);

  // Today's achievements
  const achievements = [
    { met: stepsProgress >= 1, name: 'Steps Goal' },
    { met: exerciseProgress >= 1, name: 'Exercise Goal' },
    { met: sleepProgress >= 1, name: 'Sleep Goal' },
    { met: waterProgress >= 1, name: 'Hydration Goal' },
  ];
  
  const achievementsCount = achievements.filter(a => a.met).length;

  const quickActions = [
    {
      icon: 'walk-outline',
      title: 'Steps',
      subtitle: `${todaysActivity.stepsCount || 0}`,
      color: SamsungHealthTheme.colors.steps,
      onPress: () => console.log('Steps pressed')
    },
    {
      icon: 'fitness-outline',
      title: 'Exercise',
      subtitle: `${todaysActivity.exerciseMinutes || 0} min`,
      color: SamsungHealthTheme.colors.exercise,
      onPress: () => console.log('Exercise pressed')
    },
    {
      icon: 'bed-outline',
      title: 'Sleep',
      subtitle: `${todaysActivity.sleepHours || 0}h`,
      color: SamsungHealthTheme.colors.sleep,
      onPress: () => console.log('Sleep pressed')
    },
    {
      icon: 'heart-outline',
      title: 'Heart Rate',
      subtitle: '-- bpm',
      color: SamsungHealthTheme.colors.heartRate,
      onPress: () => console.log('Heart Rate pressed')
    },
  ];



  return (
    <SafeAreaView style={{ 
      flex: 1, 
      backgroundColor: SamsungHealthTheme.colors.background 
    }}>
      <StatusBar barStyle="dark-content" backgroundColor={SamsungHealthTheme.colors.background} />
      
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: SamsungHealthTheme.spacing.md,
          paddingVertical: SamsungHealthTheme.spacing.sm,
        }}
      >
        <View>
          <Text
            style={[
              SamsungHealthTheme.typography.titleSmall,
              { color: SamsungHealthTheme.colors.onSurfaceVariant }
            ]}
          >
            {greeting}
          </Text>
          <Text
            style={[
              SamsungHealthTheme.typography.headlineSmall,
              { color: SamsungHealthTheme.colors.onSurface }
            ]}
          >
            Health Summary
          </Text>
        </View>
        
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: SamsungHealthTheme.colors.surface,
            justifyContent: 'center',
            alignItems: 'center',
            ...SamsungHealthTheme.elevation.level1,
          }}
        >
          <Ionicons 
            name="notifications-outline" 
            size={20} 
            color={SamsungHealthTheme.colors.onSurface} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: SamsungHealthTheme.spacing.md,
          paddingBottom: SamsungHealthTheme.spacing.xl,
        }}
      >
        {/* Main Progress Display */}
        <HealthCard>
          <MainProgressRing
            stepsProgress={stepsProgress}
            exerciseProgress={exerciseProgress}
            sleepProgress={sleepProgress}
            waterProgress={waterProgress}
            achievementsCount={achievementsCount}
          />
        </HealthCard>

        {/* Quick Actions */}
        <SectionHeader
          title="Today's Activity"
          action={{
            title: "View All",
            onPress: () => console.log('View all pressed')
          }}
        />
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: SamsungHealthTheme.spacing.lg }}
          contentContainerStyle={{
            paddingHorizontal: SamsungHealthTheme.spacing.sm,
          }}
        >
          {quickActions.map((action) => (
            <View key={action.title} style={{ marginHorizontal: SamsungHealthTheme.spacing.xs }}>
              <QuickAction {...action} />
            </View>
          ))}
        </ScrollView>

        {/* Detailed Metrics */}
        <SectionHeader title="Health Metrics" />
        
        <HealthCard style={{ marginBottom: SamsungHealthTheme.spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <HealthMetric
              title="Steps"
              value={todaysActivity.stepsCount || 0}
              unit="steps"
              icon="walk-outline"
              color={SamsungHealthTheme.colors.steps}
              target={10000}
              progress={stepsProgress}
            />
            <HealthMetric
              title="Exercise"
              value={todaysActivity.exerciseMinutes || 0}
              unit="min"
              icon="fitness-outline"
              color={SamsungHealthTheme.colors.exercise}
              target={30}
              progress={exerciseProgress}
            />
          </View>
        </HealthCard>

        <HealthCard style={{ marginBottom: SamsungHealthTheme.spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <HealthMetric
              title="Sleep"
              value={todaysActivity.sleepHours || 0}
              unit="hr"
              icon="bed-outline"
              color={SamsungHealthTheme.colors.sleep}
              target={8}
              progress={sleepProgress}
            />
            <HealthMetric
              title="Water"
              value={todaysActivity.waterIntake || 0}
              unit="ml"
              icon="water-outline"
              color={SamsungHealthTheme.colors.water}
              target={2000}
              progress={waterProgress}
            />
          </View>
        </HealthCard>

        {/* Heart Rate Card */}
        <HealthCard
          gradient
          gradientColors={[SamsungHealthTheme.colors.heartRate + '20', SamsungHealthTheme.colors.surface]}
          style={{ marginBottom: SamsungHealthTheme.spacing.md }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text
                style={[
                  SamsungHealthTheme.typography.titleMedium,
                  { color: SamsungHealthTheme.colors.onSurface }
                ]}
              >
                Heart Rate
              </Text>
              <Text
                style={[
                  SamsungHealthTheme.typography.headlineMedium,
                  { color: SamsungHealthTheme.colors.heartRate }
                ]}
              >
                -- bpm
              </Text>
              <Text
                style={[
                  SamsungHealthTheme.typography.bodySmall,
                  { color: SamsungHealthTheme.colors.onSurfaceVariant }
                ]}
              >
                Tap to measure
              </Text>
            </View>
            <TouchableOpacity
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: SamsungHealthTheme.colors.heartRate,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="heart" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </HealthCard>

        {/* Achievements */}
        <SectionHeader title="Today's Achievements" />
        <HealthCard>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {achievements.map((achievement) => (
              <View
                key={achievement.name}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: '48%',
                  marginBottom: SamsungHealthTheme.spacing.sm,
                }}
              >
                <Ionicons
                  name={achievement.met ? "checkmark-circle" : "ellipse-outline"}
                  size={20}
                  color={achievement.met ? SamsungHealthTheme.colors.success : SamsungHealthTheme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    SamsungHealthTheme.typography.bodyMedium,
                    {
                      color: achievement.met ? SamsungHealthTheme.colors.onSurface : SamsungHealthTheme.colors.onSurfaceVariant,
                      marginLeft: SamsungHealthTheme.spacing.sm,
                    }
                  ]}
                >
                  {achievement.name}
                </Text>
              </View>
            ))}
          </View>
        </HealthCard>

        {/* Action Buttons */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: SamsungHealthTheme.spacing.lg,
          }}
        >
          <SHealthButton
            title="Add Data"
            icon="add"
            onPress={() => console.log('Add data pressed')}
            style={{ flex: 1, marginRight: SamsungHealthTheme.spacing.sm }}
          />
          <SHealthButton
            title="View Reports"
            variant="outlined"
            icon="analytics-outline"
            onPress={() => console.log('View reports pressed')}
            style={{ flex: 1, marginLeft: SamsungHealthTheme.spacing.sm }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SamsungHealthDashboard;