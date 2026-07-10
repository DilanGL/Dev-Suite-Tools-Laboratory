/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'donut';

export interface ChartDataItem {
  label: string;
  value: number;
  color?: string;
}

export interface ChartConfig {
  type: ChartType;
  title: string;
  xAxisTitle: string;
  yAxisTitle: string;
  height: number;
  isResponsive: boolean;
  showGrid: boolean;
  showLegend: boolean;
  showTooltip: boolean;
  showValuesOnChart: boolean;
  colorTheme: string; // 'electric-blue' | 'emerald-glow' | 'cyberpunk' | 'sunset-neon' | 'monochrome'
  gradientFill: boolean;
  isAnimated: boolean;
  labelsString: string;
  valuesString: string;
}

export interface PresetDataset {
  name: string;
  description: string;
  type: ChartType;
  title: string;
  xAxisTitle: string;
  yAxisTitle: string;
  labels: string;
  values: string;
  colorTheme: string;
}
