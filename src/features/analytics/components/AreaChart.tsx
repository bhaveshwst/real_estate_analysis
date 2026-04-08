import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import {
  VictoryChart,
  VictoryArea,
  VictoryAxis,
  VictoryTooltip,
  VictoryVoronoiContainer,
  VictoryLine,
  VictoryScatter,
} from 'victory-native';
import { Defs, LinearGradient, Stop } from 'react-native-svg';
import { palette, spacing, typography, radius } from '@/theme';
import type { TrendSeries } from '../utils/transformers';

interface AreaChartProps {
  series: TrendSeries;
  height?: number;
  showArea?: boolean;
  showDots?: boolean;
  yTickFormat?: (value: number) => string;
}

const CHART_WIDTH = Dimensions.get('window').width - spacing.xl * 2;

export function AreaChart({
  series,
  height = 220,
  showArea = true,
  showDots = true,
  yTickFormat,
}: AreaChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const data = series.data.map((pt, i) => ({
    x: i,
    y: pt.y,
    label: pt.label ?? '',
    xLabel: pt.x,
  }));

  const defaultYFormat = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${Math.round(v / 1000)}K`;
    return String(Math.round(v));
  };

  const formatY = yTickFormat ?? defaultYFormat;

  // Show every Nth x-axis label to prevent overlap
  const tickInterval = Math.max(1, Math.floor(data.length / 5));
  const xTickValues = data
    .filter((_, i) => i % tickInterval === 0 || i === data.length - 1)
    .map((d) => d.x);

  return (
    <View style={styles.container}>
      {/* Active point readout */}
      {activeIndex !== null && data[activeIndex] && (
        <View style={styles.readout}>
          <Text style={styles.readoutValue}>{data[activeIndex].label}</Text>
          <Text style={styles.readoutDate}>{data[activeIndex].xLabel}</Text>
        </View>
      )}

      <VictoryChart
        width={CHART_WIDTH}
        height={height}
        padding={{ top: 20, bottom: 36, left: 52, right: 16 }}
        domainPadding={{ y: [0, 20] }}
        containerComponent={
          <VictoryVoronoiContainer
            voronoiDimension="x"
            onActivated={(points) => {
              if (points.length > 0) {
                setActiveIndex(points[0]._x as number);
              }
            }}
            onDeactivated={() => setActiveIndex(null)}
          />
        }
      >
        {/* Gradient fill definition */}
        <Defs>
          <LinearGradient id={`grad-${series.key}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={series.color} stopOpacity={0.2} />
            <Stop offset="100%" stopColor={series.color} stopOpacity={0.02} />
          </LinearGradient>
        </Defs>

        {/* X axis */}
        <VictoryAxis
          tickValues={xTickValues}
          tickFormat={(t: number) => data[t]?.xLabel ?? ''}
          style={{
            axis: { stroke: palette.gray200, strokeWidth: 0.5 },
            tickLabels: { fontSize: 10, fill: palette.gray500, padding: 6 },
            grid: { stroke: 'transparent' },
          }}
        />

        {/* Y axis */}
        <VictoryAxis
          dependentAxis
          tickFormat={formatY}
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

        {/* Area fill */}
        {showArea && (
          <VictoryArea
            data={data}
            style={{
              data: { fill: `url(#grad-${series.key})`, stroke: 'transparent' },
            }}
            interpolation="monotoneX"
          />
        )}

        {/* Line */}
        <VictoryLine
          data={data}
          style={{
            data: {
              stroke: series.color,
              strokeWidth: 2,
              strokeLinecap: 'round',
            },
          }}
          interpolation="monotoneX"
        />

        {/* Active point dot */}
        {showDots && activeIndex !== null && data[activeIndex] && (
          <VictoryScatter
            data={[data[activeIndex]]}
            size={5}
            style={{
              data: {
                fill: palette.white,
                stroke: series.color,
                strokeWidth: 2.5,
              },
            }}
          />
        )}
      </VictoryChart>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative' },
  readout: {
    position: 'absolute',
    top: 0,
    right: spacing.lg,
    alignItems: 'flex-end',
    zIndex: 10,
  },
  readoutValue: { ...typography.headingSm, color: palette.navy },
  readoutDate: { ...typography.bodySm, color: palette.gray500 },
});
