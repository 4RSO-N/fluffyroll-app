import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useActivity } from '../contexts/ActivityContext';
import { WarmTheme } from '../constants/warmTheme';

interface StepsCounterProps {
  onPress?: () => void;
}

const StepsCounter: React.FC<StepsCounterProps> = ({ onPress }) => {
  const { todaysActivity, syncWithSamsungHealth, updateStepsCount } = useActivity();
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const handleSyncPress = async () => {
    setIsLoading(true);
    try {
      await syncWithSamsungHealth();
      setLastSyncTime(new Date());
      
      if (todaysActivity.stepsCount > 0) {
        Alert.alert(
          'Sync Complete',
          `Successfully synced ${todaysActivity.stepsCount} steps from Samsung Health!`,
          [{ text: 'OK' }]
        );
      } else {
        // Samsung Health not available, show manual entry option
        Alert.alert(
          'Manual Entry',
          'Samsung Health not available. Would you like to manually enter your steps?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Enter Steps', 
              onPress: () => showManualStepsEntry()
            }
          ]
        );
      }
    } catch (error) {
      console.warn('Samsung Health sync error:', error);
      Alert.alert(
        'Manual Entry',
        'Samsung Health not available. Would you like to manually enter your steps?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Enter Steps', 
            onPress: () => showManualStepsEntry()
          }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const showManualStepsEntry = () => {
    Alert.prompt(
      'Enter Steps',
      'How many steps have you taken today?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (value?: string) => {
            if (value && !isNaN(Number(value))) {
              const steps = Math.max(0, parseInt(value));
              await updateStepsCount(steps);
              setLastSyncTime(new Date());
              Alert.alert('Steps Updated', `Updated to ${steps} steps!`);
            }
          }
        }
      ],
      'plain-text',
      todaysActivity.stepsCount.toString()
    );
  };

  const formatSteps = (steps: number): string => {
    if (steps >= 1000) {
      return `${(steps / 1000).toFixed(1)}k`;
    }
    return steps.toString();
  };

  const getStepsIcon = (): string => {
    if (todaysActivity.stepsCount >= 10000) return 'trophy';
    if (todaysActivity.stepsCount >= 5000) return 'ribbon';
    return 'walk';
  };

  const getStepsColor = (): string => {
    if (todaysActivity.stepsCount >= 10000) return WarmTheme.colors.accent.primary;
    if (todaysActivity.stepsCount >= 5000) return WarmTheme.colors.accent.secondary;
    return WarmTheme.colors.secondary;
  };

  const stepsProgress = Math.min(100, (todaysActivity.stepsCount / 10000) * 100);

  return (
    <TouchableOpacity 
      onPress={onPress || handleSyncPress} 
      disabled={isLoading}
      style={styles.container}
    >
      <LinearGradient
        colors={WarmTheme.gradients.panelBackground as [string, string]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons 
                name={getStepsIcon() as any} 
                size={24} 
                color={getStepsColor()} 
              />
            </View>
            <TouchableOpacity 
              onPress={handleSyncPress}
              disabled={isLoading}
              style={styles.syncButton}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={WarmTheme.colors.primary} />
              ) : (
                <Ionicons name="add" size={18} color={WarmTheme.colors.primary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Steps Count */}
          <View style={styles.stepsContainer}>
            <Text style={styles.stepsCount}>{formatSteps(todaysActivity.stepsCount)}</Text>
            <Text style={styles.stepsLabel}>Steps</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[getStepsColor(), getStepsColor() + '80']}
                style={[styles.progressFill, { width: `${stepsProgress}%` }]}
              />
            </View>
            <Text style={styles.progressText}>{Math.round(stepsProgress)}%</Text>
          </View>

          {/* Goal Info */}
          <Text style={styles.goalText}>Goal: 10,000 steps</Text>
          
          {/* Last Sync Time */}
          {lastSyncTime && (
            <Text style={styles.syncTime}>
              Last sync: {lastSyncTime.toLocaleTimeString()}
            </Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: WarmTheme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  gradient: {
    padding: 20,
  },
  content: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsContainer: {
    alignItems: 'center',
  },
  stepsCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: WarmTheme.colors.primary,
  },
  stepsLabel: {
    fontSize: 16,
    color: WarmTheme.colors.secondary,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: WarmTheme.colors.primary,
    minWidth: 40,
    textAlign: 'right',
  },
  goalText: {
    fontSize: 12,
    color: WarmTheme.colors.secondary,
    textAlign: 'center',
  },
  syncTime: {
    fontSize: 10,
    color: WarmTheme.colors.secondary,
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default StepsCounter;