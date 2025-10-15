// Samsung Health integration - fallback for Expo managed workflow
let healthConnect: any = null;

try {
  healthConnect = require('react-native-health-connect');
} catch (error) {
  console.warn('Health Connect not available in Expo managed workflow:', error);
  healthConnect = null;
}

export interface HealthData {
  steps: number;
  distance: number; // in meters
  calories: number;
  heartRate?: number;
}

class HealthService {
  private isInitialized = false;

  async initialize(): Promise<boolean> {
    try {
      if (!healthConnect) {
        console.log('Samsung Health not available - using manual tracking mode');
        return false;
      }
      const isInitialized = await healthConnect.initialize();
      this.isInitialized = isInitialized;
      return isInitialized;
    } catch (error) {
      console.warn('Samsung Health initialization failed - using manual tracking mode:', error);
      this.isInitialized = false;
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      if (!healthConnect) return false;
      
      if (!this.isInitialized) {
        await this.initialize();
      }

      const permissions = [
        'Steps',
        'Distance',
        'CaloriesBurned',
        'HeartRate'
      ];

      const granted = await healthConnect.requestPermission(permissions);
      return granted;
    } catch (error) {
      console.warn('Failed to request health permissions - using manual mode:', error);
      return false;
    }
  }

  async getTodaysSteps(): Promise<number> {
    try {
      if (!healthConnect) return 0;
      
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) return 0;
      }

      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const stepsData = await healthConnect.readRecords('Steps', {
        timeRangeFilter: {
          operator: 'between',
          startTime: startOfDay.toISOString(),
          endTime: endOfDay.toISOString(),
        },
      });

      // Sum up all step counts for today
      const totalSteps = stepsData.reduce((total: number, record: any) => {
        return total + (record.count || 0);
      }, 0);

      return totalSteps;
    } catch (error) {
      console.error('Failed to get today\'s steps:', error);
      return 0;
    }
  }

  async getTodaysHealthData(): Promise<HealthData> {
    try {
      if (!healthConnect) {
        return { steps: 0, distance: 0, calories: 0 };
      }
      
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          return { steps: 0, distance: 0, calories: 0 };
        }
      }

      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const timeFilter = {
        timeRangeFilter: {
          operator: 'between',
          startTime: startOfDay.toISOString(),
          endTime: endOfDay.toISOString(),
        },
      };

      // Get steps
      const stepsData = await healthConnect.readRecords('Steps', timeFilter);
      const totalSteps = stepsData.reduce((total: number, record: any) => {
        return total + (record.count || 0);
      }, 0);

      // Get distance
      const distanceData = await healthConnect.readRecords('Distance', timeFilter);
      const totalDistance = distanceData.reduce((total: number, record: any) => {
        return total + (record.distance || 0);
      }, 0);

      // Get calories burned
      const caloriesData = await healthConnect.readRecords('CaloriesBurned', timeFilter);
      const totalCalories = caloriesData.reduce((total: number, record: any) => {
        return total + (record.energy || 0);
      }, 0);

      return {
        steps: totalSteps,
        distance: totalDistance,
        calories: totalCalories,
      };
    } catch (error) {
      console.error('Failed to get health data:', error);
      return { steps: 0, distance: 0, calories: 0 };
    }
  }

  // Convert steps to approximate exercise minutes (rough estimation)
  stepsToExerciseMinutes(steps: number): number {
    // Rough estimation: 1000 steps ≈ 10 minutes of light activity
    // This varies greatly by person and walking speed
    return Math.round(steps / 100);
  }

  // Check if Samsung Health is available on device
  async isAvailable(): Promise<boolean> {
    try {
      if (!healthConnect) return false;
      const types = await healthConnect.getSupportedTypes();
      return types.length > 0;
    } catch (error) {
      console.warn('Samsung Health not available - using manual tracking:', error);
      return false;
    }
  }
}

export const healthService = new HealthService();