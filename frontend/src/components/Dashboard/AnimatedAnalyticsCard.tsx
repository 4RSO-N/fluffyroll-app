import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

const screenWidth = Dimensions.get('window').width;

interface Props {
  title: string;
  data: any;
  chartType: 'line' | 'bar';
  color: string;
  suffix?: string;
  delay?: number;
}

export default function AnimatedAnalyticsCard({
  title,
  data,
  chartType,
  color,
  suffix = '',
  delay = 0,
}: Props) {
  const chartConfig = {
    backgroundColor: Colors.surface,
    backgroundGradientFrom: Colors.surface,
    backgroundGradientTo: Colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `${color}${Math.round(opacity * 255).toString(16)}`,
    labelColor: (opacity = 1) => `${Colors.textSecondary}${Math.round(opacity * 255).toString(16)}`,
    style: {
      borderRadius: BorderRadius.lg,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: color,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: Colors.borderLight,
    },
  };

  const chartWidth = screenWidth - (Spacing.lg * 4);

  return (
    <Animated.View entering={FadeInUp.delay(delay)} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.colorIndicator, { backgroundColor: color }]} />
      </View>
      
      <View style={styles.chartContainer}>
        {chartType === 'line' ? (
          <LineChart
            data={data}
            width={chartWidth}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            yAxisLabel=""
            yAxisSuffix={suffix}
            withInnerLines={false}
            withVerticalLabels={true}
            withHorizontalLabels={true}
          />
        ) : (
          <BarChart
            data={data}
            width={chartWidth}
            height={180}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
            yAxisLabel=""
            yAxisSuffix={suffix}
            withInnerLines={false}
            withVerticalLabels={true}
            withHorizontalLabels={true}
          />
        )}
      </View>
      
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          7-day average: {Math.round(data.datasets[0].data.reduce((a: number, b: number) => a + b, 0) / 7)}{suffix}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  chart: {
    borderRadius: BorderRadius.lg,
  },
  summary: {
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  summaryText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
