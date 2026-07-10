/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ChartDataItem } from '../types';
import { parseChartData, validateChartData, ValidationResult } from '../utils';
import { Plus, Trash2, ListFilter, Grid3X3, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

interface DataTextEditorProps {
  labelsString: string;
  valuesString: string;
  onDataChange: (labels: string, values: string) => void;
  validation: ValidationResult;
}

type EditMode = 'text' | 'grid';

export default function DataTextEditor({
  labelsString,
  valuesString,
  onDataChange,
  validation,
}: DataTextEditorProps) {
  const [activeMode, setActiveMode] = useState<EditMode>('text');
  
  // Local rows for grid editor to make edits snappy and smooth
  const [gridRows, setGridRows] = useState<{ id: string; label: string; value: string }[]>([]);

  // Synchronize gridRows when parent props change, but only if we are not actively typing in grid
  useEffect(() => {
    const rawLabels = labelsString
      .split(/,|\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const rawValues = valuesString
      .split(/,|\n/)
      .map(v => v.trim())
      .filter(v => v.length > 0);

    const maxLength = Math.max(rawLabels.length, rawValues.length);
    const rows = [];
    for (let i = 0; i < maxLength; i++) {
      rows.push({
        id: `row-${i}-${Date.now()}`,
        label: rawLabels[i] || '',
        value: rawValues[i] || '',
      });
    }
    
    // Simple state synchronization
    setGridRows(rows);
  }, [labelsString, valuesString]);

  // Handle grid row modification and push back to parent
  const handleUpdateGridRow = (index: number, field: 'label' | 'value', val: string) => {
    const updated = [...gridRows];
    updated[index] = { ...updated[index], [field]: val };
    setGridRows(updated);

    const labels = updated.map(r => r.label).filter(l => l !== '').join(', ');
    const values = updated.map(r => r.value).filter(v => v !== '').join(', ');
    onDataChange(labels, values);
  };

  const handleAddGridRow = () => {
    const updated = [...gridRows, { id: `row-new-${Date.now()}`, label: `Etiqueta ${gridRows.length + 1}`, value: '10' }];
    setGridRows(updated);
    
    const labels = updated.map(r => r.label).join(', ');
    const values = updated.map(r => r.value).join(', ');
    onDataChange(labels, values);
  };

  const handleDeleteGridRow = (index: number) => {
    const updated = gridRows.filter((_, i) => i !== index);
    setGridRows(updated);

    const labels = updated.map(r => r.label).join(', ');
    const values = updated.map(r => r.value).join(', ');
    onDataChange(labels, values);
  };

  const handleClearAll = () => {
    onDataChange('', '');
    setGridRows([]);
  };

  return (
    <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-5 flex flex-col h-full">
      {/* Tab Selectors */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800/80">
          <button
            id="tab-edit-mode-text"
            onClick={() => setActiveMode('text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeMode === 'text'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            Pegado Rápido (Texto)
          </button>
          <button
            id="tab-edit-mode-grid"
            onClick={() => setActiveMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeMode === 'grid'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            Tabla Interactiva
          </button>
        </div>

        <button
          id="btn-clear-data"
          onClick={handleClearAll}
          className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1 px-2 py-1 hover:bg-slate-800/40 rounded border border-transparent hover:border-slate-800"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Limpiar Todo
        </button>
      </div>

      {/* Validation Banner */}
      <div className="mb-4">
        {validation.error ? (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-950/30 border border-red-500/20 text-red-300 text-xs leading-relaxed animate-pulse">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{validation.error}</span>
          </div>
        ) : validation.warning ? (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-950/20 border border-amber-500/20 text-amber-300 text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-bounce" />
            <span>{validation.warning}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-950/20 border border-emerald-500/25 text-emerald-400 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-medium">
              Datos Sincronizados y Válidos: {validation.labelsCount} categorías mapeadas.
            </span>
          </div>
        )}
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 min-h-[250px] flex flex-col justify-between">
        {activeMode === 'text' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full flex-1">
            {/* Labels Input */}
            <div className="flex flex-col gap-1.5 h-full">
              <label htmlFor="labels-textarea" className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
                Categorías / Etiquetas
              </label>
              <textarea
                id="labels-textarea"
                rows={8}
                className="w-full flex-1 p-3 text-xs font-mono bg-slate-950 border border-slate-800 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 rounded-lg text-slate-100 placeholder-slate-600 outline-none resize-none transition-all scrollbar-thin"
                placeholder="Escribe tus categorías separadas por comas o saltos de línea (ej: Enero, Febrero, Marzo)"
                value={labelsString}
                onChange={(e) => onDataChange(e.target.value, valuesString)}
              />
              <span className="text-[10px] text-slate-500 self-end font-mono">
                {validation.labelsCount} detectadas
              </span>
            </div>

            {/* Values Input */}
            <div className="flex flex-col gap-1.5 h-full">
              <label htmlFor="values-textarea" className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
                Valores Numéricos
              </label>
              <textarea
                id="values-textarea"
                rows={8}
                className="w-full flex-1 p-3 text-xs font-mono bg-slate-950 border border-slate-800 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 rounded-lg text-slate-100 placeholder-slate-600 outline-none resize-none transition-all scrollbar-thin"
                placeholder="Escribe los valores numéricos correspondientes (ej: 120, 240, 180)"
                value={valuesString}
                onChange={(e) => onDataChange(labelsString, e.target.value)}
              />
              <span className="text-[10px] text-slate-500 self-end font-mono">
                {validation.valuesCount} detectados
              </span>
            </div>
          </div>
        ) : (
          /* Grid Edit Mode */
          <div className="flex flex-col flex-1 h-full">
            <div className="flex-1 max-h-[320px] overflow-y-auto border border-slate-800/80 rounded-lg bg-slate-950/40 divide-y divide-slate-800/50 scrollbar-thin pr-1 mb-3">
              {gridRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-xs text-slate-500 mb-2">No hay datos en la tabla.</p>
                  <button
                    id="btn-add-initial-row"
                    onClick={handleAddGridRow}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar primera fila
                  </button>
                </div>
              ) : (
                gridRows.map((row, index) => (
                  <div key={row.id} className="flex items-center gap-2 p-2 group hover:bg-slate-900/40 transition-colors">
                    <span className="w-6 text-[10px] font-mono text-slate-600 text-center">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      id={`grid-label-${index}`}
                      className="flex-1 min-w-[100px] px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded text-slate-200 placeholder-slate-600 outline-none transition-all font-sans"
                      placeholder="Ej. Categoría"
                      value={row.label}
                      onChange={(e) => handleUpdateGridRow(index, 'label', e.target.value)}
                    />
                    <input
                      type="text"
                      id={`grid-value-${index}`}
                      className="w-24 px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded text-slate-200 placeholder-slate-600 outline-none transition-all text-right font-mono"
                      placeholder="0.0"
                      value={row.value}
                      onChange={(e) => handleUpdateGridRow(index, 'value', e.target.value)}
                    />
                    <button
                      id={`btn-delete-row-${index}`}
                      onClick={() => handleDeleteGridRow(index)}
                      className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors shrink-0"
                      title="Eliminar fila"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-800/60">
              <button
                id="btn-add-grid-row"
                onClick={handleAddGridRow}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 border border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/5 rounded-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Añadir Fila
              </button>
              
              <span className="text-[10px] text-slate-500">
                Fila añadida al final de la colección
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
