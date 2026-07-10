/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ChartConfig, PresetDataset } from './types';
import { PRESETS } from './presets';
import { parseChartData, validateChartData } from './utils';
import SidebarPresets from './components/SidebarPresets';
import DataTextEditor from './components/DataTextEditor';
import ChartCustomizer from './components/ChartCustomizer';
import ChartVisualizer from './components/ChartVisualizer';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Sliders,
  Database,
  Undo2,
  Save,
  Cpu,
  BarChart4,
  Clock,
  ExternalLink,
} from 'lucide-react';

const DEFAULT_CONFIG: ChartConfig = {
  type: 'bar',
  title: 'Venta de Consolas de Videojuegos (Millones)',
  xAxisTitle: 'Dispositivos',
  yAxisTitle: 'Unidades Vendidas (M)',
  height: 380,
  isResponsive: true,
  showGrid: true,
  showLegend: true,
  showTooltip: true,
  showValuesOnChart: false,
  colorTheme: 'electric-blue',
  gradientFill: true,
  isAnimated: true,
  labelsString: 'PlayStation 5, Nintendo Switch, Xbox Series X/S, Steam Deck, PC Handhelds',
  valuesString: '22.4, 18.2, 11.5, 3.2, 1.8',
};

export default function App() {
  const [config, setConfig] = useState<ChartConfig>(() => {
    try {
      const saved = localStorage.getItem('chart_generator_config_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved config from localStorage', e);
    }
    return DEFAULT_CONFIG;
  });

  const [activePresetName, setActivePresetName] = useState<string | undefined>(() => {
    // See if current data matches any preset
    const match = PRESETS.find(
      (p) => p.labels === config.labelsString && p.values === config.valuesString
    );
    return match ? match.name : undefined;
  });

  const [savingStatus, setSavingStatus] = useState<'saved' | 'saving'>('saved');

  // Auto-save to localStorage when configuration changes
  useEffect(() => {
    setSavingStatus('saving');
    const timer = setTimeout(() => {
      localStorage.setItem('chart_generator_config_v1', JSON.stringify(config));
      setSavingStatus('saved');
    }, 500);

    return () => clearTimeout(timer);
  }, [config]);

  // Synchronize state when presets are selected
  const handleSelectPreset = (preset: PresetDataset) => {
    setConfig({
      ...config,
      type: preset.type,
      title: preset.title,
      xAxisTitle: preset.xAxisTitle,
      yAxisTitle: preset.yAxisTitle,
      labelsString: preset.labels,
      valuesString: preset.values,
      colorTheme: preset.colorTheme,
    });
    setActivePresetName(preset.name);
  };

  const handleDataChange = (labels: string, values: string) => {
    setConfig((prev) => {
      const updated = { ...prev, labelsString: labels, valuesString: values };
      
      // Check if this matches a preset
      const match = PRESETS.find((p) => p.labels === labels && p.values === values);
      setActivePresetName(match ? match.name : undefined);
      
      return updated;
    });
  };

  const handleConfigChange = (newConfig: ChartConfig) => {
    setConfig(newConfig);
    // If text parameters changed, check matching presets
    const match = PRESETS.find(
      (p) => p.labels === newConfig.labelsString && p.values === newConfig.valuesString
    );
    setActivePresetName(match ? match.name : undefined);
  };

  const handleResetToDefault = () => {
    setConfig(DEFAULT_CONFIG);
    setActivePresetName(PRESETS[0].name);
  };

  // Memoized data structures to optimize performance
  const chartData = useMemo(() => {
    return parseChartData(config.labelsString, config.valuesString);
  }, [config.labelsString, config.valuesString]);

  const validationResult = useMemo(() => {
    return validateChartData(config.labelsString, config.valuesString);
  }, [config.labelsString, config.valuesString]);

  // Tab state for left settings column ('data' vs 'style')
  const [activeSettingsTab, setActiveSettingsTab] = useState<'data' | 'style'>('data');

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden pb-12 relative">
      {/* Decorative ambient glowing grids and spheres */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-900/10 via-slate-950/0 to-slate-950/0 pointer-events-none" />
      <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Cyberpunk network grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

      {/* Main Header */}
      <header className="sticky top-0 z-40 h-16 px-6 md:px-8 flex items-center justify-between border-b border-slate-800 bg-slate-950/50 backdrop-blur-md shrink-0">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          {/* Logo with Glow */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)] border border-blue-400/20 shrink-0">
              <BarChart4 className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-base md:text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  CHART<span className="text-blue-500">PRO</span>
                </span>
                <span className="text-[9px] font-mono font-semibold px-1 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  v2.0
                </span>
              </div>
            </div>
          </div>

          {/* Actions & Auto-save tracker */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Auto-Save indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">
                {savingStatus === 'saving' ? 'Saving...' : 'Sync: Active'}
              </span>
            </div>

            {/* Reset to defaults button */}
            <button
              id="btn-reset-app"
              onClick={handleResetToDefault}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-md transition-all cursor-pointer"
              title="Restablecer todos los datos"
            >
              <Undo2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="max-w-7xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (Presets & Controls) - lg:col-span-5 */}
          <div className="lg:col-span-5 space-y-6 flex flex-col h-full">
            
            {/* Presets Sidebar Widget */}
            <SidebarPresets
              onSelectPreset={handleSelectPreset}
              activePresetName={activePresetName}
            />

            {/* Main Tabs Card (Data Editor & Customizer unified) */}
            <div className="glass-panel neon-border-blue rounded-2xl p-1.5 shadow-2xl flex flex-col">
              
              {/* Tab Selector Buttons */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950/80 rounded-xl border-b border-slate-800/60">
                <button
                  id="tab-settings-data"
                  onClick={() => setActiveSettingsTab('data')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeSettingsTab === 'data'
                      ? 'bg-slate-900 text-white shadow-md border-b border-blue-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Database className="w-4 h-4 text-blue-400" />
                  <span>1. ENTRADA DE DATOS</span>
                </button>
                <button
                  id="tab-settings-style"
                  onClick={() => setActiveSettingsTab('style')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeSettingsTab === 'style'
                      ? 'bg-slate-900 text-white shadow-md border-b border-emerald-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>2. ESTILO Y AJUSTES</span>
                </button>
              </div>

              {/* Dynamic Tab Panel */}
              <div className="p-3">
                <AnimatePresence mode="wait">
                  {activeSettingsTab === 'data' ? (
                    <motion.div
                      key="data-tab"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                    >
                      <DataTextEditor
                        labelsString={config.labelsString}
                        valuesString={config.valuesString}
                        onDataChange={handleDataChange}
                        validation={validationResult}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="style-tab"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                    >
                      <ChartCustomizer
                        config={config}
                        onChangeConfig={handleConfigChange}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

          {/* Right Column (Hero Chart Preview & Live Rendering) - lg:col-span-7 */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Hero Interactive Chart Visualizer */}
            <ChartVisualizer
              config={config}
              data={chartData}
            />

            {/* Quick Helper Tips Panel */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex gap-3 items-start">
              <Cpu className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-slate-300">
                  Consejo de Producción
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                  Puedes exportar gráficos en formato <strong className="text-slate-300">SVG vectoriales</strong> para conservar resoluciones infinitas en impresiones y webs responsivas, o como imágenes de alta calidad <strong className="text-slate-300">PNG de doble densidad (Retina)</strong> listas para tus reportes de negocios o presentaciones.
                </p>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Global Compact Footer */}
      <footer className="mt-16 text-center text-xs text-slate-600 border-t border-slate-900/60 pt-6">
        <p className="font-mono">
          © 2026 Chart Generator. Inspirado en ChartGo con tecnología React y Tailwind CSS v4.
        </p>
      </footer>
    </div>
  );
}
