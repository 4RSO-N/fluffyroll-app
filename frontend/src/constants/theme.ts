import { Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export const Colors = {
  // Modern wellness app color palette
  primary: '#6366F1',      // Indigo - modern, trustworthy
  primaryLight: '#818CF8',  // Light indigo
  primaryDark: '#4F46E5',   // Dark indigo
  
  // Secondary colors - wellness focused
  secondary: '#06B6D4',     // Cyan - refreshing, water-like
  secondaryLight: '#22D3EE', // Light cyan
  secondaryDark: '#0891B2',  // Dark cyan
  
  // Tertiary accent
  accent: '#F59E0B',        // Amber - energy, vitality
  accentLight: '#FCD34D',   // Light amber
  accentDark: '#D97706',    // Dark amber
  
  // Status colors - refined
  success: '#10B981',       // Emerald
  successLight: '#34D399',  // Light emerald
  warning: '#F59E0B',       // Amber
  warningLight: '#FCD34D',  // Light amber
  error: '#EF4444',         // Red
  errorLight: '#F87171',    // Light red
  info: '#3B82F6',          // Blue
  infoLight: '#60A5FA',     // Light blue
  
  // Neutral colors - modern and clean
  background: '#FAFAFA',    // Very light gray
  surface: '#FFFFFF',       // Pure white
  surfaceElevated: '#FFFFFF', // Elevated surfaces
  card: '#FFFFFF',          // Cards
  
  // Text colors - improved hierarchy
  text: '#111827',          // Near black
  textSecondary: '#6B7280', // Gray
  textLight: '#9CA3AF',     // Light gray
  textOnPrimary: '#FFFFFF', // White on primary
  
  // Border colors
  border: '#E5E7EB',        // Light gray border
  borderLight: '#F3F4F6',   // Very light border
  borderFocus: '#6366F1',   // Focus border (primary)
  
  // Glass/blur effects
  glass: 'rgba(255,255,255,0.1)',
  glassStrong: 'rgba(255,255,255,0.2)',
  
  // Shadows
  shadow: 'rgba(0,0,0,0.1)',
  shadowStrong: 'rgba(0,0,0,0.15)',

  // Gradients - wellness themed
  gradient: {
    primary: ['#6366F1', '#8B5CF6'],      // Indigo to violet
    secondary: ['#06B6D4', '#3B82F6'],    // Cyan to blue
    wellness: ['#10B981', '#06B6D4'],     // Emerald to cyan
    energy: ['#F59E0B', '#EF4444'],       // Amber to red
    calm: ['#8B5CF6', '#06B6D4'],         // Violet to cyan
    success: ['#10B981', '#059669'],      // Emerald shades
    warning: ['#F59E0B', '#D97706'],      // Amber shades
    error: ['#EF4444', '#DC2626'],        // Red shades
    info: ['#3B82F6', '#2563EB'],         // Blue shades
    background: ['#FFF8F0', '#FAF0E6', '#F5F5DC'], // Soft warm background - off-white to linen to beige
  }
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
};
