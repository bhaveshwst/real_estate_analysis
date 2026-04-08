import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import {
  VictoryChart,
  VictoryBar,
  VictoryAxis,
} from 'victory-native';
import { palette, spacing, typography } from '@/theme';
import type { TrendSeries } from '../utils/transformers';

interface BarChartProps {
  series: TrendSeries;
  height?: number;
  horizontal?: boolean;
  yTickFormat?: (value: number) => string;
  barWidth?: number;
}

const CHART_WIDTH = Dimensions.get('window').width - spacing.xl * 2;

export function BarChart({
  series,
  height = 200,
  horizontal = false,
  yTickFormat,
  barWidth = 24,
}: BarChartProps) {
  const data = series.data.map((pt, i) => ({
    x: pt.x,
    y: pt.y,
    label: pt.label ?? '',
  }));

  const defaultYFormat = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${Math.round(v / 1000)}K`;
    return String(Math.round(v));
  };

  return (
    <View>
      <VictoryChart
        width={CHART_WIDTH}
        height={height}
        padding={{ top: 16, bottom: 40, left: 56, right: 16 }}
        domainPadding={{ x: barWidth }}
        horizontal={horizontal}
      >
        <VictoryAxis
          style={{
            axis: { stroke: palette.gray200, strokeWidth: 0.5 },
            tickLabels: { fontSize: 10, fill: palette.gray500, padding: 6 },
            grid: { stroke: 'transparent' },
          }}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={yTickFormat ?? defaultYFormat}
          style={{
            axis: { stroke: 'transparent' },
            tickLabels: { fontSize: 10, fill: palette.gray500, padding: 4 },
            grid: {
              stroke: palette.gray100,
              strokeWidth: 0.5,
              strokeDasharray: '4,4',
            },
          }}
        />
        <VictoryBar
          data={data}
          style={{
            data: {
              fill: series.color,
              opacity: 0.85,
              width: barWidth,
            },
          }}
          cornerRadius={{ topLeft: 4, topRight: 4 }}
          animate={{ duration: 400, onLoad: { duration: 300 } }}
        />
      </VictoryChart>
    </View>
  );
}
