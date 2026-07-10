/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartConfig, ChartDataItem } from '../types';
import { COLOR_THEMES } from '../presets';
import { exportChart } from '../utils';
import {
  Download,
  Copy,
  Check,
  FileImage,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

interface ChartVisualizerProps {
  config: ChartConfig;
  data: ChartDataItem[];
}

export default function ChartVisualizer({ config, data }: ChartVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  const activeTheme = COLOR_THEMES.find((t) => t.id === config.colorTheme) || COLOR_THEMES[0];

  const handleCopyConfig = () => {
    const configData = {
      titulo: config.title,
      tipo: config.type,
      categorias: data.map((d) => d.label),
      valores: data.map((d) => d.value),
      paleta: activeTheme.name,
    };
    navigator.clipboard.writeText(JSON.stringify(configData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async (type: 'png' | 'svg') => {
    setExporting(type);
    const sanitizedFilename = config.title
      ? config.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      : 'chart_export';
    
    // Tiny delay to ensure UI threads don't block
    setTimeout(() => {
      exportChart('#chart-svg-element', sanitizedFilename, type, config.title);
      setExporting(null);
    }, 150);
  };

  // Custom tooltips matching the dashboard aesthetic
  const renderTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataColor = payload[0].payload.color || activeTheme.primary;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 p-3 rounded-lg shadow-2xl text-xs flex flex-col gap-1 shadow-slate-950/80">
          <p className="font-semibold text-slate-200">{label || payload[0].name}</p>
          <p className="font-mono flex items-center gap-1.5" style={{ color: dataColor }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dataColor }} />
            <span className="text-slate-400">Valor:</span>
            {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  // Render the specific charts based on current configuration
  const renderChartElement = () => {
    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center text-slate-500">
          <Info className="w-8 h-8 mb-2 text-slate-600" />
          <p className="text-sm">No hay datos válidos para previsualizar.</p>
          <p className="text-xs text-slate-600 mt-1">Ingresa etiquetas y valores correspondientes a la izquierda.</p>
        </div>
      );
    }

    // Prepare custom colorful item data for Pie Charts
    const coloredData = data.map((item, index) => ({
      ...item,
      color: activeTheme.colors[index % activeTheme.colors.length],
    }));

    // Glow and gradient references
    const primaryId = `grad-primary-${config.colorTheme}`;
    const secondaryId = `grad-secondary-${config.colorTheme}`;
    const fillGradId = `grad-fill-${config.colorTheme}`;

    switch (config.type) {
      case 'bar':
        return (
          <BarChart
            id="chart-svg-element"
            data={coloredData}
            margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
          >
            <defs>
              <linearGradient id={primaryId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={activeTheme.primary} stopOpacity={1} />
                <stop offset="100%" stopColor={activeTheme.secondary} stopOpacity={0.6} />
              </linearGradient>
            </defs>
            {config.showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            )}
            <XAxis
              dataKey="label"
              stroke="#475569"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tick={{ fill: '#94a3b8' }}
              dy={10}
            />
            <YAxis
              stroke="#475569"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tick={{ fill: '#94a3b8' }}
              dx={-5}
            />
            {config.showTooltip && <Tooltip content={renderTooltip} />}
            {config.showLegend && <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} />}
            <Bar
              dataKey="value"
              name={config.yAxisTitle || 'Valores'}
              fill={config.gradientFill ? `url(#${primaryId})` : activeTheme.primary}
              radius={[6, 6, 0, 0]}
              isAnimationActive={config.isAnimated}
              animationDuration={1000}
            >
              {/* Optional values shown right on the chart */}
              {config.showValuesOnChart && (
                <Cell key="bar-cell">
                  <div className="text-[10px] text-slate-400 font-mono" />
                </Cell>
              )}
            </Bar>
          </BarChart>
        );

      case 'line':
        return (
          <LineChart
            id="chart-svg-element"
            data={coloredData}
            margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
          >
            {config.showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            )}
            <XAxis
              dataKey="label"
              stroke="#475569"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tick={{ fill: '#94a3b8' }}
              dy={10}
            />
            <YAxis
              stroke="#475569"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tick={{ fill: '#94a3b8' }}
              dx={-5}
            />
            {config.showTooltip && <Tooltip content={renderTooltip} />}
            {config.showLegend && <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} />}
            <Line
              type="monotone"
              dataKey="value"
              name={config.yAxisTitle || 'Valores'}
              stroke={activeTheme.primary}
              strokeWidth={3}
              activeDot={{ r: 6, strokeWidth: 0, fill: activeTheme.secondary }}
              dot={{ r: 4, stroke: activeTheme.primary, strokeWidth: 2, fill: '#0f172a' }}
              isAnimationActive={config.isAnimated}
              animationDuration={1000}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart
            id="chart-svg-element"
            data={coloredData}
            margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
          >
            <defs>
              <linearGradient id={fillGradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={activeTheme.primary} stopOpacity={0.4} />
                <stop offset="95%" stopColor={activeTheme.primary} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            {config.showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            )}
            <XAxis
              dataKey="label"
              stroke="#475569"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tick={{ fill: '#94a3b8' }}
              dy={10}
            />
            <YAxis
              stroke="#475569"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tick={{ fill: '#94a3b8' }}
              dx={-5}
            />
            {config.showTooltip && <Tooltip content={renderTooltip} />}
            {config.showLegend && <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} />}
            <Area
              type="monotone"
              dataKey="value"
              name={config.yAxisTitle || 'Valores'}
              stroke={activeTheme.primary}
              strokeWidth={3}
              fill={config.gradientFill ? `url(#${fillGradId})` : `${activeTheme.primary}33`}
              isAnimationActive={config.isAnimated}
              animationDuration={1000}
            />
          </AreaChart>
        );

      case 'pie':
      case 'donut':
        const isDonut = config.type === 'donut';
        return (
          <PieChart id="chart-svg-element">
            {config.showTooltip && <Tooltip content={renderTooltip} />}
            {config.showLegend && <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />}
            <Pie
              data={coloredData}
              cx="50%"
              cy="45%"
              labelLine={config.showValuesOnChart}
              label={
                config.showValuesOnChart
                  ? ({ label, value }) => `${label}: ${value}`
                  : undefined
              }
              innerRadius={isDonut ? '50%' : 0}
              outerRadius="75%"
              paddingAngle={isDonut ? 4 : 0}
              dataKey="value"
              nameKey="label"
              isAnimationActive={config.isAnimated}
              animationDuration={1000}
            >
              {coloredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#090d16" strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className="glass-panel neon-border-blue rounded-2xl p-6 shadow-2xl flex flex-col justify-between h-full relative group transition-all duration-300">
      {/* Visual neon grid header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-200 tracking-wide">
              Previsualización en Vivo
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800/60">
          <span>{config.type.toUpperCase()}</span>
          <span>•</span>
          <span>{activeTheme.name}</span>
        </div>
      </div>

      {/* Actual Chart Visual Area */}
      <div className="flex-1 flex flex-col justify-center relative py-4">
        {config.title && (
          <h2 className="text-center text-sm md:text-base font-semibold text-slate-100 tracking-tight mb-2 uppercase">
            {config.title}
          </h2>
        )}

        {/* X/Y Axes Helper Titles for Visual Representation */}
        {['bar', 'line', 'area'].includes(config.type) && config.yAxisTitle && (
          <div className="absolute left-0 top-1/2 -rotate-90 origin-left text-[10px] text-slate-500 font-mono tracking-widest translate-x-4">
            {config.yAxisTitle}
          </div>
        )}

        <div
          ref={containerRef}
          className="w-full flex justify-center items-center relative overflow-hidden"
          style={{ height: `${config.height}px` }}
        >
          {config.isResponsive ? (
            <ResponsiveContainer width="100%" height="100%">
              {renderChartElement()}
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full" style={{ maxWidth: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                {renderChartElement()}
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {['bar', 'line', 'area'].includes(config.type) && config.xAxisTitle && (
          <p className="text-center text-[10px] text-slate-500 font-mono tracking-widest mt-2">
            {config.xAxisTitle}
          </p>
        )}
      </div>

      {/* Actions and Exportation Options */}
      <div className="grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-4 mt-4">
        <button
          id="btn-export-png"
          disabled={data.length === 0 || exporting !== null}
          onClick={() => handleExport('png')}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-950/60 hover:bg-blue-600/10 border border-slate-800 hover:border-blue-500/40 rounded-lg transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          <FileImage className="w-3.5 h-3.5 text-blue-400" />
          <span>PNG</span>
        </button>

        <button
          id="btn-export-svg"
          disabled={data.length === 0 || exporting !== null}
          onClick={() => handleExport('svg')}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-950/60 hover:bg-emerald-600/10 border border-slate-800 hover:border-emerald-500/40 rounded-lg transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>SVG</span>
        </button>

        <button
          id="btn-copy-json"
          disabled={data.length === 0}
          onClick={handleCopyConfig}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold border rounded-lg transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${
            copied
              ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50'
              : 'text-slate-300 hover:text-white bg-slate-950/60 hover:bg-purple-600/10 border-slate-800 hover:border-purple-500/40'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-purple-400" />
              <span>Config JSON</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
