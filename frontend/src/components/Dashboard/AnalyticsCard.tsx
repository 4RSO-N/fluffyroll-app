import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

interface AnalyticsCardProps {
  title: string;
  data: any;
  chartType: 'line' | 'bar';
  color: string;
  suffix?: string;
}

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsCard({ 
  title, 
  data, 
  chartType, 
  color,
  suffix = '' 
}: AnalyticsCardProps) {
  const chartConfig = {
    backgroundColor: Colors.surface,
    backgroundGradientFrom: Colors.surface,
    backgroundGradientTo: Colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => color + Math.floor(opacity * 255).toString(16).padStart(2, '0'),
    labelColor: (opacity = 1) => Colors.textSecondary + Math.floor(opacity * 255).toString(16).padStart(2, '0'),
    style: {
      borderRadius: BorderRadius.md,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: color,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: Colors.border,
      strokeWidth: 1,
    },
  };

  const chartWidth = screenWidth - (Spacing.lg * 4);
  const chartHeight = 160;

  const renderChart = () => {
    if (chartType === 'line') {
      return (
        <LineChart
          data={data}
          width={chartWidth}
          height={chartHeight}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={false}
          withOuterLines={false}
          withHorizontalLabels={true}
          withVerticalLabels={true}
          fromZero
        />
      );
    } else {
      return (
        <BarChart
          data={data}
          width={chartWidth}
          height={chartHeight}
          chartConfig={chartConfig}
          style={styles.chart}
          withInnerLines={false}
          withHorizontalLabels={true}
          withVerticalLabels={false}
          fromZero
          showBarTops={false}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {data.datasets?.[0]?.data && (
          <Text style={[styles.currentValue, { color }]}>
            {data.datasets[0].data[data.datasets[0].data.length - 1]}{suffix}
          </Text>
        )}
      </View>
      
      <View style={styles.chartContainer}>
        {renderChart()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    paddingBottom: 0,
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  currentValue: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
  },
  chartContainer: {
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 0,
  },
});