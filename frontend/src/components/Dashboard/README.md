# Dashboard Components Library

A comprehensive collection of reusable, perfectly styled dashboard components for the FluffyRoll wellness app. These components are designed for easy copying to other screens while maintaining visual consistency.

## 🎨 Color Scheme

The dashboard uses a modern wellness-focused color palette:

- **Primary**: #6366F1 (Indigo)
- **Secondary**: #06B6D4 (Cyan) 
- **Accent**: #F59E0B (Amber)
- **Success**: #10B981 (Emerald)
- **Background Gradient**: Indigo → Violet → Cyan

## 📦 Components

### DashboardCard
Base card component with gradient background and consistent styling.

```tsx
import { DashboardCard } from '../components/Dashboard';

<DashboardCard 
  gradient={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.08)']}
  padding="lg"
  shadow={true}
>
  <Text>Your content here</Text>
</DashboardCard>
```

### DashboardHeader
Complete header with greeting, stats, and notifications.

```tsx
import { DashboardHeader } from '../components/Dashboard';

<DashboardHeader
  greeting="Good Morning"
  userName="Alex"
  date="Monday, October 10"
  quickStats={[
    { label: "Day Streak", value: 5 },
    { label: "Workouts", value: 12 },
    { label: "Wellness", value: "85%" }
  ]}
  notificationCount={3}
  onNotificationPress={() => console.log('Notifications')}
/>
```

### WellnessScoreCard
Displays wellness score with breakdown metrics.

```tsx
import { WellnessScoreCard } from '../components/Dashboard';

<WellnessScoreCard
  healthData={{
    score: 85,
    breakdown: {
      fitness: 90,
      nutrition: 75,
      hydration: 80
    }
  }}
  animationDelay={500}
/>
```

### QuickActionsCard
Grid of action buttons with icons.

```tsx
import { QuickActionsCard } from '../components/Dashboard';

<QuickActionsCard
  title="Quick Actions"
  actions={[
    {
      id: 'water',
      title: 'Water',
      icon: 'water',
      color: Colors.secondary,
      onPress: () => setWaterModalVisible(true)
    },
    {
      id: 'meal',
      title: 'Meal',
      icon: 'restaurant', 
      color: Colors.accent,
      onPress: () => setMealModalVisible(true)
    }
  ]}
  animationDelay={600}
/>
```

### ProgressCard
Progress tracking with animated bars.

```tsx
import { ProgressCard } from '../components/Dashboard';

<ProgressCard
  title="Today's Progress"
  items={[
    {
      id: 'calories',
      label: 'Calories',
      current: 1200,
      target: 2000,
      unit: 'cal',
      icon: 'flame',
      color: Colors.accent
    },
    {
      id: 'water',
      label: 'Water',
      current: 6,
      target: 8,
      unit: 'glasses',
      icon: 'water',
      color: Colors.secondary
    }
  ]}
  animationDelay={700}
/>
```

## 🚀 Quick Implementation

### 1. Import the theme
```tsx
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '../constants/theme';
```

### 2. Add the background gradient
```tsx
<LinearGradient
  colors={Colors.gradient.background as [string, string, ...string[]]}
  style={StyleSheet.absoluteFillObject}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
/>
```

### 3. Use the components
```tsx
import {
  DashboardHeader,
  WellnessScoreCard,
  QuickActionsCard,
  ProgressCard
} from '../components/Dashboard';

// Implement in your screen...
```

## 🎯 Perfect Home Screen Layout

```tsx
<View style={styles.container}>
  {/* Background */}
  <LinearGradient colors={Colors.gradient.background} style={StyleSheet.absoluteFillObject} />
  
  <ScrollView>
    {/* Header */}
    <DashboardHeader {...headerProps} />
    
    {/* Main Content */}
    <View style={styles.mainContent}>
      {/* Top Row */}
      <View style={styles.topRow}>
        <WellnessScoreCard healthData={healthData} animationDelay={500} />
        <QuickActionsCard actions={quickActions} animationDelay={600} />
      </View>
      
      {/* Progress */}
      <ProgressCard title="Today's Progress" items={progressItems} animationDelay={700} />
    </View>
  </ScrollView>
</View>
```

## 🔧 Key Styles

```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  topRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
});
```

## ✨ Features

- **Consistent Design**: All components follow the same design system
- **Smooth Animations**: Built-in Reanimated animations with staggered delays  
- **Responsive**: Adapts to different screen sizes
- **TypeScript**: Full type safety
- **Modular**: Mix and match components as needed
- **Easy Theming**: Uses centralized theme constants

## 📱 Ready for Other Screens

Simply copy the components you need to any other screen:

1. Import the components
2. Add the background gradient
3. Pass your data props
4. Customize colors and animations as needed

The components are designed to work seamlessly across different parts of the app while maintaining the perfect home screen aesthetic.