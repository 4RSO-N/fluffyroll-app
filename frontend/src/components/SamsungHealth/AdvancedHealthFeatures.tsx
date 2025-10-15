import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SamsungHealthTheme from '../../constants/samsungHealthTheme';
import { HealthCard, SHealthButton } from './SHealthComponents';

const { width: screenWidth } = Dimensions.get('window');

interface HeartRateMonitorProps {
  onHeartRateRecorded: (heartRate: number) => void;
}

export const HeartRateMonitor: React.FC<HeartRateMonitorProps> = ({
  onHeartRateRecorded
}) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentHeartRate, setCurrentHeartRate] = useState<number | null>(null);
  const [heartRateHistory, setHeartRateHistory] = useState<number[]>([]);
  const [pulseAnimation] = useState(new Animated.Value(1));

  useEffect(() => {
    if (isMonitoring) {
      // Simulate heart rate monitoring with animation
      const pulseAnimationLoop = () => {
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isMonitoring) {
            pulseAnimationLoop();
          }
        });
      };
      pulseAnimationLoop();

      // Simulate heart rate measurement
      const measurementTimer = setTimeout(() => {
        const simulatedHeartRate = Math.floor(Math.random() * (100 - 60) + 60); // 60-100 bpm
        setCurrentHeartRate(simulatedHeartRate);
        setHeartRateHistory(prev => [...prev.slice(-9), simulatedHeartRate]);
        onHeartRateRecorded(simulatedHeartRate);
        setIsMonitoring(false);
      }, 15000); // 15 seconds measurement

      return () => {
        clearTimeout(measurementTimer);
        pulseAnimation.setValue(1);
      };
    }
  }, [isMonitoring]);

  const startMonitoring = () => {
    Alert.alert(
      'Heart Rate Measurement',
      'Place your finger on the camera lens and stay still for 15 seconds.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start', onPress: () => setIsMonitoring(true) },
      ]
    );
  };

  const getHeartRateCategory = (bpm: number): { category: string; color: string } => {
    if (bpm < 60) return { category: 'Low', color: SamsungHealthTheme.colors.info };
    if (bpm <= 100) return { category: 'Normal', color: SamsungHealthTheme.colors.success };
    if (bpm <= 120) return { category: 'Elevated', color: SamsungHealthTheme.colors.warning };
    return { category: 'High', color: SamsungHealthTheme.colors.error };
  };

  return (
    <HealthCard
      gradient
      gradientColors={[SamsungHealthTheme.colors.heartRate + '10', SamsungHealthTheme.colors.surface]}
    >
      <View style={{ alignItems: 'center', padding: SamsungHealthTheme.spacing.md }}>
        <Text
          style={[
            SamsungHealthTheme.typography.titleLarge,
            { color: SamsungHealthTheme.colors.onSurface, marginBottom: SamsungHealthTheme.spacing.sm }
          ]}
        >
          Heart Rate
        </Text>

        {/* Heart Rate Display */}
        <Animated.View
          style={{
            transform: [{ scale: isMonitoring ? pulseAnimation : 1 }],
            alignItems: 'center',
            marginBottom: SamsungHealthTheme.spacing.lg,
          }}
        >
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: SamsungHealthTheme.colors.heartRate + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: SamsungHealthTheme.spacing.md,
            }}
          >
            <Ionicons 
              name="heart" 
              size={40} 
              color={SamsungHealthTheme.colors.heartRate} 
            />
          </View>

          {currentHeartRate ? (
            <View style={{ alignItems: 'center' }}>
              <Text
                style={[
                  SamsungHealthTheme.typography.headlineLarge,
                  { color: getHeartRateCategory(currentHeartRate).color }
                ]}
              >
                {currentHeartRate}
                <Text
                  style={[
                    SamsungHealthTheme.typography.titleMedium,
                    { color: SamsungHealthTheme.colors.onSurfaceVariant }
                  ]}
                >
                  {' '}bpm
                </Text>
              </Text>
              <Text
                style={[
                  SamsungHealthTheme.typography.bodyMedium,
                  { color: getHeartRateCategory(currentHeartRate).color }
                ]}
              >
                {getHeartRateCategory(currentHeartRate).category}
              </Text>
            </View>
          ) : (
            <Text
              style={[
                SamsungHealthTheme.typography.bodyLarge,
                { color: SamsungHealthTheme.colors.onSurfaceVariant }
              ]}
            >
              {isMonitoring ? 'Measuring...' : 'Tap to measure'}
            </Text>
          )}
        </Animated.View>

        {/* History Chart */}
        {heartRateHistory.length > 0 && (
          <View style={{ width: '100%', marginBottom: SamsungHealthTheme.spacing.lg }}>
            <Text
              style={[
                SamsungHealthTheme.typography.titleSmall,
                { color: SamsungHealthTheme.colors.onSurface, marginBottom: SamsungHealthTheme.spacing.sm }
              ]}
            >
              Recent Measurements
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                height: 60,
                paddingHorizontal: SamsungHealthTheme.spacing.sm,
              }}
            >
              {heartRateHistory.map((hr, index) => (
                <View
                  key={`hr-${index}-${hr}`}
                  style={{
                    width: 15,
                    height: Math.max((hr - 40) / 2, 10), // Scale height based on heart rate
                    backgroundColor: getHeartRateCategory(hr).color,
                    borderRadius: 2,
                    marginHorizontal: 1,
                  }}
                />
              ))}
            </View>
          </View>
        )}

        <SHealthButton
          title={isMonitoring ? 'Measuring...' : 'Measure Heart Rate'}
          onPress={startMonitoring}
          disabled={isMonitoring}
          icon="heart"
          style={{ width: '100%' }}
        />
      </View>
    </HealthCard>
  );
};

// Blood Pressure Monitor Component
interface BloodPressureMonitorProps {
  onBloodPressureRecorded: (systolic: number, diastolic: number) => void;
}

export const BloodPressureMonitor: React.FC<BloodPressureMonitorProps> = ({
  onBloodPressureRecorded
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [systolic] = useState('120');
  const [diastolic] = useState('80');
  const [lastReading, setLastReading] = useState<{ systolic: number; diastolic: number } | null>(null);

  const saveBP = () => {
    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);
    
    if (sys > 0 && dia > 0 && sys > dia) {
      setLastReading({ systolic: sys, diastolic: dia });
      onBloodPressureRecorded(sys, dia);
      setModalVisible(false);
    } else {
      Alert.alert('Invalid Values', 'Please enter valid blood pressure values.');
    }
  };

  const getBPCategory = (sys: number, dia: number): { category: string; color: string } => {
    if (sys < 120 && dia < 80) return { category: 'Normal', color: SamsungHealthTheme.colors.success };
    if (sys < 130 && dia < 80) return { category: 'Elevated', color: SamsungHealthTheme.colors.warning };
    if (sys < 140 || dia < 90) return { category: 'Stage 1 High', color: SamsungHealthTheme.colors.warning };
    return { category: 'Stage 2 High', color: SamsungHealthTheme.colors.error };
  };

  return (
    <>
      <HealthCard>
        <View style={{ alignItems: 'center', padding: SamsungHealthTheme.spacing.md }}>
          <Text
            style={[
              SamsungHealthTheme.typography.titleLarge,
              { color: SamsungHealthTheme.colors.onSurface, marginBottom: SamsungHealthTheme.spacing.sm }
            ]}
          >
            Blood Pressure
          </Text>

          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: SamsungHealthTheme.colors.info + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: SamsungHealthTheme.spacing.md,
            }}
          >
            <Ionicons 
              name="medical-outline" 
              size={36} 
              color={SamsungHealthTheme.colors.info} 
            />
          </View>

          {lastReading ? (
            <View style={{ alignItems: 'center', marginBottom: SamsungHealthTheme.spacing.lg }}>
              <Text
                style={[
                  SamsungHealthTheme.typography.headlineMedium,
                  { color: getBPCategory(lastReading.systolic, lastReading.diastolic).color }
                ]}
              >
                {lastReading.systolic}/{lastReading.diastolic}
                <Text
                  style={[
                    SamsungHealthTheme.typography.titleMedium,
                    { color: SamsungHealthTheme.colors.onSurfaceVariant }
                  ]}
                >
                  {' '}mmHg
                </Text>
              </Text>
              <Text
                style={[
                  SamsungHealthTheme.typography.bodyMedium,
                  { color: getBPCategory(lastReading.systolic, lastReading.diastolic).color }
                ]}
              >
                {getBPCategory(lastReading.systolic, lastReading.diastolic).category}
              </Text>
            </View>
          ) : (
            <Text
              style={[
                SamsungHealthTheme.typography.bodyLarge,
                { 
                  color: SamsungHealthTheme.colors.onSurfaceVariant,
                  marginBottom: SamsungHealthTheme.spacing.lg 
                }
              ]}
            >
              No recent measurements
            </Text>
          )}

          <SHealthButton
            title="Record Blood Pressure"
            onPress={() => setModalVisible(true)}
            icon="add"
            style={{ width: '100%' }}
          />
        </View>
      </HealthCard>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: SamsungHealthTheme.colors.surface,
              borderRadius: SamsungHealthTheme.radius.lg,
              padding: SamsungHealthTheme.spacing.lg,
              width: screenWidth - 60,
              ...SamsungHealthTheme.elevation.level4,
            }}
          >
            <Text
              style={[
                SamsungHealthTheme.typography.titleLarge,
                { 
                  color: SamsungHealthTheme.colors.onSurface,
                  textAlign: 'center',
                  marginBottom: SamsungHealthTheme.spacing.lg 
                }
              ]}
            >
              Blood Pressure Reading
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SamsungHealthTheme.spacing.lg }}>
              {/* Systolic Input */}
              <View style={{ flex: 1, marginRight: SamsungHealthTheme.spacing.sm }}>
                <Text style={[SamsungHealthTheme.typography.bodyMedium, { marginBottom: 8 }]}>
                  Systolic
                </Text>
                <TouchableOpacity
                  style={{
                    borderWidth: 1,
                    borderColor: SamsungHealthTheme.colors.outline,
                    borderRadius: SamsungHealthTheme.radius.md,
                    padding: SamsungHealthTheme.spacing.md,
                    alignItems: 'center',
                  }}
                >
                  <Text style={[SamsungHealthTheme.typography.titleMedium]}>
                    {systolic}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Diastolic Input */}
              <View style={{ flex: 1, marginLeft: SamsungHealthTheme.spacing.sm }}>
                <Text style={[SamsungHealthTheme.typography.bodyMedium, { marginBottom: 8 }]}>
                  Diastolic
                </Text>
                <TouchableOpacity
                  style={{
                    borderWidth: 1,
                    borderColor: SamsungHealthTheme.colors.outline,
                    borderRadius: SamsungHealthTheme.radius.md,
                    padding: SamsungHealthTheme.spacing.md,
                    alignItems: 'center',
                  }}
                >
                  <Text style={[SamsungHealthTheme.typography.titleMedium]}>
                    {diastolic}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <SHealthButton
                title="Cancel"
                variant="outlined"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1, marginRight: SamsungHealthTheme.spacing.sm }}
              />
              <SHealthButton
                title="Save"
                onPress={saveBP}
                style={{ flex: 1, marginLeft: SamsungHealthTheme.spacing.sm }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

// Sleep Tracker Component
interface SleepTrackerProps {
  sleepData: {
    bedtime?: string;
    wakeTime?: string;
    duration?: number;
    quality?: number;
  };
  onSleepUpdated: (sleepData: any) => void;
}

export const SleepTracker: React.FC<SleepTrackerProps> = ({
  sleepData,
  onSleepUpdated
}) => {
  const getSleepQualityColor = (quality: number) => {
    if (quality >= 80) return SamsungHealthTheme.colors.success;
    if (quality >= 60) return SamsungHealthTheme.colors.warning;
    return SamsungHealthTheme.colors.error;
  };

  return (
    <HealthCard
      gradient
      gradientColors={[SamsungHealthTheme.colors.sleep + '10', SamsungHealthTheme.colors.surface]}
    >
      <View style={{ padding: SamsungHealthTheme.spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SamsungHealthTheme.spacing.lg }}>
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: SamsungHealthTheme.colors.sleep + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: SamsungHealthTheme.spacing.md,
            }}
          >
            <Ionicons 
              name="bed-outline" 
              size={24} 
              color={SamsungHealthTheme.colors.sleep} 
            />
          </View>
          
          <View style={{ flex: 1 }}>
            <Text
              style={[
                SamsungHealthTheme.typography.titleLarge,
                { color: SamsungHealthTheme.colors.onSurface }
              ]}
            >
              Sleep
            </Text>
            <Text
              style={[
                SamsungHealthTheme.typography.bodyMedium,
                { color: SamsungHealthTheme.colors.onSurfaceVariant }
              ]}
            >
              Last night
            </Text>
          </View>
        </View>

        {sleepData.duration ? (
          <View>
            <Text
              style={[
                SamsungHealthTheme.typography.headlineMedium,
                { color: SamsungHealthTheme.colors.sleep, textAlign: 'center', marginBottom: SamsungHealthTheme.spacing.sm }
              ]}
            >
              {Math.floor(sleepData.duration)}h {Math.round((sleepData.duration % 1) * 60)}m
            </Text>
            
            {sleepData.bedtime && sleepData.wakeTime && (
              <Text
                style={[
                  SamsungHealthTheme.typography.bodyMedium,
                  { color: SamsungHealthTheme.colors.onSurfaceVariant, textAlign: 'center', marginBottom: SamsungHealthTheme.spacing.md }
                ]}
              >
                {sleepData.bedtime} - {sleepData.wakeTime}
              </Text>
            )}

            {sleepData.quality && (
              <View style={{ alignItems: 'center', marginBottom: SamsungHealthTheme.spacing.lg }}>
                <Text
                  style={[
                    SamsungHealthTheme.typography.bodySmall,
                    { color: SamsungHealthTheme.colors.onSurfaceVariant, marginBottom: 4 }
                  ]}
                >
                  Sleep Quality
                </Text>
                <Text
                  style={[
                    SamsungHealthTheme.typography.titleMedium,
                    { color: getSleepQualityColor(sleepData.quality) }
                  ]}
                >
                  {sleepData.quality}%
                </Text>
              </View>
            )}
          </View>
        ) : (
          <Text
            style={[
              SamsungHealthTheme.typography.bodyLarge,
              { 
                color: SamsungHealthTheme.colors.onSurfaceVariant,
                textAlign: 'center',
                marginBottom: SamsungHealthTheme.spacing.lg 
              }
            ]}
          >
            No sleep data recorded
          </Text>
        )}

        <SHealthButton
          title="Record Sleep"
          onPress={() => console.log('Record sleep pressed')}
          icon="add"
          style={{ width: '100%' }}
        />
      </View>
    </HealthCard>
  );
};

export default {
  HeartRateMonitor,
  BloodPressureMonitor,
  SleepTracker,
};