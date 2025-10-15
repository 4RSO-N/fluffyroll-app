// Samsung Health Design System
// Replicating Samsung Health's visual language and design patterns

export const SamsungHealthTheme = {
  // Primary Colors - Samsung Health Color Palette
  colors: {
    // Primary brand colors
    primary: '#2196F3',        // Samsung Health blue
    primaryDark: '#1976D2',    // Darker blue for pressed states
    primaryLight: '#BBDEFB',   // Light blue for backgrounds
    
    // Accent colors for different health metrics
    steps: '#4CAF50',          // Green for steps
    exercise: '#FF5722',       // Orange-red for exercise
    sleep: '#673AB7',          // Purple for sleep
    heartRate: '#E91E63',      // Pink for heart rate
    nutrition: '#FF9800',      // Orange for nutrition
    water: '#2196F3',          // Blue for water
    weight: '#795548',         // Brown for weight
    stress: '#9C27B0',         // Purple for stress
    
    // Background colors
    background: '#FAFAFA',     // Light gray background
    surface: '#FFFFFF',        // White card surfaces
    surfaceVariant: '#F5F5F5', // Slightly gray surface
    
    // Text colors
    onSurface: '#212121',      // Primary text
    onSurfaceVariant: '#757575', // Secondary text
    onSurfaceDisabled: '#BDBDBD', // Disabled text
    
    // Status colors
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    
    // Dividers and borders
    outline: '#E0E0E0',
    outlineVariant: '#F5F5F5',
    
    // Special surfaces
    progressBackground: '#E0E0E0',
    cardShadow: 'rgba(0, 0, 0, 0.1)',
  },

  // Typography matching Samsung Health
  typography: {
    // Headlines
    headlineLarge: {
      fontSize: 32,
      fontWeight: '400' as const,
      lineHeight: 40,
      letterSpacing: 0,
    },
    headlineMedium: {
      fontSize: 28,
      fontWeight: '400' as const,
      lineHeight: 36,
      letterSpacing: 0,
    },
    headlineSmall: {
      fontSize: 24,
      fontWeight: '400' as const,
      lineHeight: 32,
      letterSpacing: 0,
    },
    
    // Titles
    titleLarge: {
      fontSize: 22,
      fontWeight: '500' as const,
      lineHeight: 28,
      letterSpacing: 0,
    },
    titleMedium: {
      fontSize: 16,
      fontWeight: '500' as const,
      lineHeight: 24,
      letterSpacing: 0.15,
    },
    titleSmall: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    
    // Body text
    bodyLarge: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
      letterSpacing: 0.15,
    },
    bodyMedium: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
      letterSpacing: 0.25,
    },
    bodySmall: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
      letterSpacing: 0.4,
    },
    
    // Labels
    labelLarge: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    labelMedium: {
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 16,
      letterSpacing: 0.5,
    },
    labelSmall: {
      fontSize: 11,
      fontWeight: '500' as const,
      lineHeight: 16,
      letterSpacing: 0.5,
    },
  },

  // Spacing system
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border radius
  radius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
  },

  // Elevation (shadows)
  elevation: {
    level0: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    level1: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.12,
      shadowRadius: 2,
      elevation: 1,
    },
    level2: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.14,
      shadowRadius: 4,
      elevation: 2,
    },
    level3: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 6,
      elevation: 3,
    },
    level4: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 4,
    },
  },

  // Component specific styles
  components: {
    // Card styles
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
    },
    
    // Button styles
    button: {
      primary: {
        backgroundColor: '#2196F3',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
      },
      secondary: {
        backgroundColor: 'transparent',
        borderColor: '#2196F3',
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
      },
    },
    
    // Progress ring styles
    progressRing: {
      strokeWidth: 8,
      backgroundColor: '#E0E0E0',
      size: {
        small: 60,
        medium: 80,
        large: 120,
      },
    },
    
    // Chart styles
    chart: {
      gridColor: '#E0E0E0',
      axisColor: '#BDBDBD',
      backgroundColor: '#FAFAFA',
    },
  },

  // Animation timings
  animation: {
    fast: 200,
    normal: 300,
    slow: 500,
  },

  // Health metric specific gradients
  gradients: {
    steps: ['#4CAF50', '#8BC34A'],
    exercise: ['#FF5722', '#FF7043'],
    sleep: ['#673AB7', '#9C27B0'],
    heartRate: ['#E91E63', '#EC407A'],
    nutrition: ['#FF9800', '#FFB74D'],
    water: ['#2196F3', '#42A5F5'],
    weight: ['#795548', '#8D6E63'],
    stress: ['#9C27B0', '#BA68C8'],
  },
};

// Health metric icons mapping
export const HealthIcons = {
  steps: 'walk-outline',
  exercise: 'fitness-outline',
  sleep: 'bed-outline',
  heartRate: 'heart-outline',
  nutrition: 'restaurant-outline',
  water: 'water-outline',
  weight: 'scale-outline',
  stress: 'pulse-outline',
  bodyComposition: 'body-outline',
  bloodPressure: 'medical-outline',
  temperature: 'thermometer-outline',
  glucose: 'medical-outline',
  oxygen: 'leaf-outline',
};

// Health metric units
export const HealthUnits = {
  steps: 'steps',
  exercise: 'min',
  sleep: 'hr',
  heartRate: 'bpm',
  nutrition: 'kcal',
  water: 'ml',
  weight: 'kg',
  stress: 'level',
  bloodPressure: 'mmHg',
  temperature: '°C',
  glucose: 'mg/dL',
  oxygen: '%',
};

export default SamsungHealthTheme;