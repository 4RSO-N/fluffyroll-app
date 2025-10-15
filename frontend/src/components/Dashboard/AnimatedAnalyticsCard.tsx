import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

const screenWidth = Dimensions.get('window').width;

interface Props {
  readonly title: string;
  readonly data: any;
  readonly chartType: 'line' | 'bar';
  readonly color: string;
  readonly suffix?: string;
  readonly delay?: number;
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
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'rgba(255,255,255,0.1)',
    backgroundGradientTo: 'rgba(255,255,255,0.05)',
    decimalPlaces: 0,
    color: (opacity = 1) => `${color}${Math.round(opacity * 255).toString(16)}`,
    labelColor: (opacity = 1) => `rgba(255,255,255,${opacity * 0.9})`,
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
    <Animated.View entering={FadeInUp.delay(delay)} style={styles.outerContainer}>
      <View style={styles.container}>
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
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  container: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
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
    color: 'white',
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
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  summaryText: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
});
