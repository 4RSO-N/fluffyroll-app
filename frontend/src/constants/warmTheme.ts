// Warm Theme Configuration for Consistent UI
export const WarmTheme = {
  // Primary Colors
  colors: {
    // Text Colors
    primary: '#8B4513',           // Warm brown for main text
    secondary: '#A0522D',         // Darker brown for secondary text
    light: '#D2691E',            // Lighter brown for accents
    
    // Background Colors
    panelBackground: {
      primary: 'rgba(255,248,240,0.95)',    // Main panel background
      secondary: 'rgba(255,248,240,0.85)',  // Secondary panel background
      modal: 'rgba(255,248,240,0.98)',      // Modal background
    },
    
    // Action Button Colors
    actionButtons: {
      water: '#4682B4',          // Steel blue for water (richer than light blue)
      meal: '#FF6B35',           // Vibrant orange for meals  
      journal: '#B8860B',        // Dark golden rod for journal
      fitness: '#DC143C',        // Crimson for fitness (richer than tomato)
    },
    
    // Status/Accent Colors
    accent: {
      primary: '#FF8C42',        // Primary warm orange
      secondary: '#FF7F50',      // Secondary coral
      tertiary: '#D2691E',       // Tertiary chocolate
    },
    
    // Icon Colors
    icons: {
      onBackground: '#8B4513',   // Dark brown icons on light backgrounds
      onAccent: 'white',         // White icons on colored backgrounds
    }
  },
  
  // Gradient Definitions
  gradients: {
    // Background Gradients
    pageBackground: ['#FFF8F0', '#FAF0E6', '#F5F5DC'], // Soft warm page background
    panelBackground: ['rgba(255,248,240,0.95)', 'rgba(255,248,240,0.85)'],
    modalBackground: ['rgba(255,248,240,0.98)', 'rgba(255,248,240,0.95)'],
    
    // Button Gradients
    primaryButton: ['#FF8C42', '#FF7F50'],
    secondaryButton: ['#D2691E', '#A0522D'],
    cancelButton: ['#A0522D', '#8B4513'],
    
    // Alert/Notification Gradients
    success: ['#FF8C42', '#FF7F50'],
    warning: ['#D2691E', '#A0522D'],
    error: ['#CD853F', '#A0522D'],
    info: ['#FF7F50', '#D2691E'],
  },
  
  // Component Styles
  components: {
    // Card/Panel Styles
    card: {
      backgroundColor: 'rgba(255,248,240,0.95)',
      borderRadius: 16,
      padding: 24,
    },
    
    // Button Styles
    button: {
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    
    // Text Styles
    text: {
      primary: {
        color: '#8B4513',
        fontWeight: '600',
      },
      secondary: {
        color: '#8B4513',
        fontWeight: '500',
      },
      title: {
        color: '#8B4513',
        fontWeight: '700',
      }
    },
    
    // Header Styles
    header: {
      greeting: {
        color: '#8B4513',
        fontSize: 24,
        fontWeight: 'bold',
      },
      date: {
        color: '#8B4513',
        fontSize: 14,
        fontWeight: '500',
      },
      icon: {
        color: '#8B4513',
        backgroundColor: 'rgba(255,255,255,0.05)',
      }
    }
  }
};

// Helper functions for easy usage
export const getWarmGradient = (type: keyof typeof WarmTheme.gradients) => {
  return WarmTheme.gradients[type];
};

export const getWarmColor = (path: string) => {
  const keys = path.split('.');
  let value: any = WarmTheme.colors;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) return '#8B4513'; // fallback
  }
  
  return value;
};

// Pre-defined component configurations
export const WarmComponents = {
  // Modal Button Configuration
  modalButton: {
    primary: {
      gradient: WarmTheme.gradients.primaryButton,
      textColor: 'white',
    },
    secondary: {
      gradient: WarmTheme.gradients.secondaryButton, 
      textColor: 'white',
    },
    cancel: {
      gradient: WarmTheme.gradients.cancelButton,
      textColor: 'white',
    }
  },
  
  // Alert Configuration
  alert: {
    background: WarmTheme.gradients.modalBackground,
    textColor: WarmTheme.colors.primary,
    iconColors: {
      success: WarmTheme.colors.accent.primary,
      warning: WarmTheme.colors.accent.tertiary,
      error: WarmTheme.colors.secondary,
      info: WarmTheme.colors.accent.secondary,
    }
  },
  
  // Panel Configuration
  panel: {
    background: WarmTheme.gradients.panelBackground,
    textColor: WarmTheme.colors.primary,
    titleColor: WarmTheme.colors.primary,
  }
};

export default WarmTheme;