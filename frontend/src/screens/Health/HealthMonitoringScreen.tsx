import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useActivity } from '../../contexts/ActivityContext';
import SamsungHealthTheme from '../../constants/samsungHealthTheme';
import { SectionHeader } from '../../components/SamsungHealth/SHealthComponents';
import {
  HeartRateMonitor,
  BloodPressureMonitor,
  SleepTracker
} from '../../components/SamsungHealth/AdvancedHealthFeatures';

const HealthMonitoringScreen: React.FC = () => {
  const { updateSleepHours } = useActivity();

  const handleHeartRateRecorded = (heartRate: number) => {
    // Heart rate data can be stored separately or added to context later
    console.log('Heart rate recorded:', heartRate);
  };

  const handleBloodPressureRecorded = (systolic: number, diastolic: number) => {
    // Blood pressure data can be stored separately or added to context later
    console.log('Blood pressure recorded:', systolic, diastolic);
  };

  const handleSleepUpdated = (sleepData: any) => {
    if (sleepData.duration) {
      updateSleepHours(sleepData.duration);
    }
  };

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
              SamsungHealthTheme.typography.headlineSmall,
              { color: SamsungHealthTheme.colors.onSurface }
            ]}
          >
            Health Monitoring
          </Text>
          <Text
            style={[
              SamsungHealthTheme.typography.bodyMedium,
              { color: SamsungHealthTheme.colors.onSurfaceVariant }
            ]}
          >
            Track your vital signs
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
            name="settings-outline" 
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
        {/* Heart Rate Section */}
        <SectionHeader
          title="Heart Rate"
          subtitle="Monitor your heart health"
          action={{
            title: "History",
            onPress: () => console.log('Heart rate history pressed')
          }}
        />
        
        <HeartRateMonitor onHeartRateRecorded={handleHeartRateRecorded} />

        {/* Blood Pressure Section */}
        <SectionHeader
          title="Blood Pressure"
          subtitle="Track your blood pressure readings"
          action={{
            title: "History",
            onPress: () => console.log('BP history pressed')
          }}
        />
        
        <BloodPressureMonitor onBloodPressureRecorded={handleBloodPressureRecorded} />

        {/* Sleep Section */}
        <SectionHeader
          title="Sleep Analysis"
          subtitle="Monitor your sleep patterns"
          action={{
            title: "Details",
            onPress: () => console.log('Sleep details pressed')
          }}
        />
        
        <SleepTracker
          sleepData={{
            bedtime: '11:30 PM',
            wakeTime: '7:00 AM',
            duration: 7.5,
            quality: 85
          }}
          onSleepUpdated={handleSleepUpdated}
        />

        {/* Additional Health Metrics */}
        <SectionHeader
          title="More Health Metrics"
          subtitle="Additional monitoring options"
        />

        <View style={{ 
          flexDirection: 'row', 
          flexWrap: 'wrap', 
          justifyContent: 'space-between',
          marginBottom: SamsungHealthTheme.spacing.lg 
        }}>
          {[
            { icon: 'thermometer-outline', title: 'Body Temperature', color: SamsungHealthTheme.colors.warning },
            { icon: 'leaf-outline', title: 'Blood Oxygen', color: SamsungHealthTheme.colors.info },
            { icon: 'pulse-outline', title: 'Stress Level', color: SamsungHealthTheme.colors.stress },
            { icon: 'scale-outline', title: 'Body Composition', color: SamsungHealthTheme.colors.weight },
          ].map((metric, index) => (
            <TouchableOpacity
              key={metric.title}
              style={{
                width: '48%',
                backgroundColor: SamsungHealthTheme.colors.surface,
                borderRadius: SamsungHealthTheme.radius.lg,
                padding: SamsungHealthTheme.spacing.md,
                marginBottom: SamsungHealthTheme.spacing.sm,
                alignItems: 'center',
                ...SamsungHealthTheme.elevation.level1,
              }}
              onPress={() => console.log(`${metric.title} pressed`)}
            >
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: metric.color + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: SamsungHealthTheme.spacing.sm,
                }}
              >
                <Ionicons 
                  name={metric.icon as any} 
                  size={24} 
                  color={metric.color} 
                />
              </View>
              <Text
                style={[
                  SamsungHealthTheme.typography.bodyMedium,
                  { 
                    color: SamsungHealthTheme.colors.onSurface,
                    textAlign: 'center'
                  }
                ]}
              >
                {metric.title}
              </Text>
              <Text
                style={[
                  SamsungHealthTheme.typography.bodySmall,
                  { 
                    color: SamsungHealthTheme.colors.onSurfaceVariant,
                    textAlign: 'center',
                    marginTop: 4
                  }
                ]}
              >
                Coming soon
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Health Insights */}
        <SectionHeader title="Health Insights" />
        
        <View
          style={{
            backgroundColor: SamsungHealthTheme.colors.surface,
            borderRadius: SamsungHealthTheme.radius.lg,
            padding: SamsungHealthTheme.spacing.md,
            ...SamsungHealthTheme.elevation.level1,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SamsungHealthTheme.spacing.sm }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: SamsungHealthTheme.colors.primary + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: SamsungHealthTheme.spacing.md,
              }}
            >
              <Ionicons 
                name="bulb-outline" 
                size={20} 
                color={SamsungHealthTheme.colors.primary} 
              />
            </View>
            <Text
              style={[
                SamsungHealthTheme.typography.titleMedium,
                { color: SamsungHealthTheme.colors.onSurface }
              ]}
            >
              Health Tip
            </Text>
          </View>
          
          <Text
            style={[
              SamsungHealthTheme.typography.bodyMedium,
              { color: SamsungHealthTheme.colors.onSurfaceVariant, lineHeight: 20 }
            ]}
          >
            Regular monitoring of your vital signs can help detect health issues early. 
            Try to measure your heart rate and blood pressure at the same time each day for the most accurate trends.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HealthMonitoringScreen;