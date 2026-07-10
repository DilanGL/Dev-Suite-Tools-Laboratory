/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PRESETS } from '../presets';
import { PresetDataset } from '../types';
import { BarChart, AreaChart, PieChart, LineChart, Sparkles } from 'lucide-react';

interface SidebarPresetsProps {
  onSelectPreset: (preset: PresetDataset) => void;
  activePresetName?: string;
}

export default function SidebarPresets({ onSelectPreset, activePresetName }: SidebarPresetsProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'bar':
        return <BarChart className="w-4 h-4 text-blue-400" />;
      case 'area':
        return <AreaChart className="w-4 h-4 text-pink-400" />;
      case 'pie':
      case 'donut':
        return <PieChart className="w-4 h-4 text-orange-400" />;
      case 'line':
      default:
        return <LineChart className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 shadow-2xl relative overflow-hidden group">
      {/* Background ambient light */}
      <div className="absolute -top-12 -left-12 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/15 transition-all duration-300" />
      
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
        <h3 className="font-semibold text-sm text-slate-200 uppercase tracking-wider">
          Plantillas Rápidas
        </h3>
      </div>
      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        Elige un conjunto de datos prediseñado para explorar diferentes estilos y tipos de gráficos al instante.
      </p>

      <div className="space-y-3">
        {PRESETS.map((preset) => {
          const isActive = activePresetName === preset.name;
          return (
            <button
              key={preset.name}
              id={`preset-${preset.name.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => onSelectPreset(preset)}
              className={`w-full text-left p-3 rounded-lg border transition-all duration-200 relative group/btn flex flex-col gap-1 ${
                isActive
                  ? 'bg-slate-800/80 border-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.15)] text-slate-100'
                  : 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700/80 hover:bg-slate-800/20 text-slate-300 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-medium text-xs md:text-sm flex items-center gap-1.5">
                  {preset.name}
                </span>
                <span className="p-1 rounded bg-slate-950/80 border border-slate-800 group-hover/btn:border-slate-700 transition-colors">
                  {getIcon(preset.type)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 group-hover/btn:text-slate-300 transition-colors line-clamp-2 mt-0.5 leading-relaxed">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
