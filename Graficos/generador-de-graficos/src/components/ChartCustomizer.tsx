/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChartConfig, ChartType } from '../types';
import { COLOR_THEMES } from '../presets';
import {
  BarChart,
  LineChart,
  AreaChart,
  PieChart,
  Sliders,
  Type,
  Palette,
  Eye,
} from 'lucide-react';

interface ChartCustomizerProps {
  config: ChartConfig;
  onChangeConfig: (newConfig: ChartConfig) => void;
}

export default function ChartCustomizer({ config, onChangeConfig }: ChartCustomizerProps) {
  const handleTypeSelect = (type: ChartType) => {
    onChangeConfig({ ...config, type });
  };

  const handleTextChange = (field: keyof ChartConfig, value: string) => {
    onChangeConfig({ ...config, [field]: value });
  };

  const handleToggleChange = (field: keyof ChartConfig, value: boolean) => {
    onChangeConfig({ ...config, [field]: value });
  };

  const handleSliderChange = (field: keyof ChartConfig, value: number) => {
    onChangeConfig({ ...config, [field]: value });
  };

  const types: { id: ChartType; label: string; icon: React.ReactNode }[] = [
    { id: 'bar', label: 'Barras', icon: <BarChart className="w-4 h-4" /> },
    { id: 'line', label: 'Líneas', icon: <LineChart className="w-4 h-4" /> },
    { id: 'area', label: 'Área', icon: <AreaChart className="w-4 h-4" /> },
    { id: 'pie', label: 'Tarta', icon: <PieChart className="w-4 h-4" /> },
    { id: 'donut', label: 'Donut', icon: <PieChart className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-5 space-y-6">
      {/* Chart Type Selection */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-blue-500" />
          Tipo de Gráfico
        </label>
        <div className="grid grid-cols-5 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800/80">
          {types.map((t) => {
            const isSelected = config.type === t.id;
            return (
              <button
                key={t.id}
                id={`btn-chart-type-${t.id}`}
                onClick={() => handleTypeSelect(t.id)}
                className={`flex flex-col items-center gap-1.5 py-2 px-1 rounded-lg transition-all text-[10px] md:text-xs font-medium cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-102'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
                title={t.label}
              >
                {t.icon}
                <span className="truncate max-w-full text-[10px]">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Labels and Titles */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
          <Type className="w-3.5 h-3.5 text-emerald-400" />
          Títulos y Ejes
        </label>
        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="title-input" className="text-[11px] font-medium text-slate-400">Título del Gráfico</label>
            <input
              type="text"
              id="title-input"
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="Ej. Consumo Energético 2026"
              value={config.title}
              onChange={(e) => handleTextChange('title', e.target.value)}
            />
          </div>

          {/* Hide Axis titles for circular chart types */}
          {config.type !== 'pie' && config.type !== 'donut' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="xaxis-input" className="text-[11px] font-medium text-slate-400">Eje X (Categorías)</label>
                <input
                  type="text"
                  id="xaxis-input"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="Meses, Trimestres..."
                  value={config.xAxisTitle}
                  onChange={(e) => handleTextChange('xAxisTitle', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="yaxis-input" className="text-[11px] font-medium text-slate-400">Eje Y (Valores)</label>
                <input
                  type="text"
                  id="yaxis-input"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="Ventas, %, Cantidades..."
                  value={config.yAxisTitle}
                  onChange={(e) => handleTextChange('yAxisTitle', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Colors & Visual Themes */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
          <Palette className="w-3.5 h-3.5 text-pink-400" />
          Estilo y Paleta de Color
        </label>
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2">
            {COLOR_THEMES.map((theme) => {
              const isSelected = config.colorTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  id={`btn-color-theme-${theme.id}`}
                  onClick={() => handleTextChange('colorTheme', theme.id)}
                  className={`flex items-center justify-between p-2 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/80 border-blue-500/50 shadow-md shadow-blue-500/5 text-slate-100'
                      : 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${theme.gradient.join(' ')}`} />
                    {theme.name}
                  </span>
                  <div className="flex gap-0.5">
                    {theme.colors.slice(0, 4).map((c, i) => (
                      <span key={i} className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Gradients Toggles */}
          {['line', 'area', 'bar'].includes(config.type) && (
            <label className="flex items-center gap-2 cursor-pointer group mt-2">
              <input
                type="checkbox"
                id="toggle-gradient-fill"
                checked={config.gradientFill}
                onChange={(e) => handleToggleChange('gradientFill', e.target.checked)}
                className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
              />
              <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                Relleno de degradado brillante
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Visibility and Toggles */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
          <Eye className="w-3.5 h-3.5 text-orange-400" />
          Componentes del Gráfico
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              id="toggle-show-grid"
              checked={config.showGrid}
              onChange={(e) => handleToggleChange('showGrid', e.target.checked)}
              className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
            />
            <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">Cuadrícula</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              id="toggle-show-legend"
              checked={config.showLegend}
              onChange={(e) => handleToggleChange('showLegend', e.target.checked)}
              className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
            />
            <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">Leyenda</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              id="toggle-show-tooltip"
              checked={config.showTooltip}
              onChange={(e) => handleToggleChange('showTooltip', e.target.checked)}
              className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
            />
            <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">Tooltip</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              id="toggle-show-labels"
              checked={config.showValuesOnChart}
              onChange={(e) => handleToggleChange('showValuesOnChart', e.target.checked)}
              className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
            />
            <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">Etiquetas</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer group col-span-2">
            <input
              type="checkbox"
              id="toggle-is-animated"
              checked={config.isAnimated}
              onChange={(e) => handleToggleChange('isAnimated', e.target.checked)}
              className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
            />
            <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
              Animaciones fluidas al cargar
            </span>
          </label>
        </div>
      </div>

      {/* Dimensions Adjustment */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase flex items-center justify-between border-b border-slate-800 pb-1.5">
          <span>Dimensiones (Alto)</span>
          <span className="text-[10px] text-slate-500 font-mono">{config.height}px</span>
        </label>
        <div className="space-y-3">
          <input
            type="range"
            id="height-range-slider"
            min={250}
            max={600}
            step={10}
            value={config.height}
            onChange={(e) => handleSliderChange('height', parseInt(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-950 rounded-lg appearance-none"
          />
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>250px (Compacto)</span>
            <span>600px (Grande)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
