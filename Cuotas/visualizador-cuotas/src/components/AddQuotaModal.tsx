import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { X, Sparkles, Database, Cpu, Map, Settings, Save } from 'lucide-react';
import { Quota } from '../types';

interface AddQuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddQuotaModal: React.FC<AddQuotaModalProps> = ({ isOpen, onClose }) => {
  const { addQuota } = useDashboard();
  
  const [serviceName, setServiceName] = useState('');
  const [metricName, setMetricName] = useState('');
  const [currentUsage, setCurrentUsage] = useState(0);
  const [limit, setLimit] = useState(100);
  const [unit, setUnit] = useState('Requests');
  const [dailyRate, setDailyRate] = useState(5);
  const [category, setCategory] = useState<Quota['category']>('custom');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim() || !metricName.trim() || limit <= 0) return;

    addQuota({
      serviceName: serviceName.trim(),
      metricName: metricName.trim(),
      currentUsage,
      limit,
      unit: unit.trim() || 'Units',
      dailyRate,
      category
    });

    // Reset Form
    setServiceName('');
    setMetricName('');
    setCurrentUsage(0);
    setLimit(100);
    setUnit('Requests');
    setDailyRate(5);
    setCategory('custom');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        id="add_quota_modal_container"
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 tracking-tight">Crear Nueva Cuota Personalizada</h3>
          <button
            id="modal_close_btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-250 p-1.5 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
          
          {/* Category selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Categoría del Servicio</label>
            <div className="grid grid-cols-5 gap-1">
              {(['ai', 'storage', 'compute', 'maps', 'custom'] as const).map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-2 px-1 rounded-lg border text-[10px] font-bold text-center flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/15 text-blue-300'
                        : 'border-slate-800 bg-slate-950/40 text-slate-500 hover:border-slate-700/80 hover:text-slate-350'
                    }`}
                  >
                    {cat === 'ai' && <Sparkles className="w-3.5 h-3.5" />}
                    {cat === 'storage' && <Database className="w-3.5 h-3.5" />}
                    {cat === 'compute' && <Cpu className="w-3.5 h-3.5" />}
                    {cat === 'maps' && <Map className="w-3.5 h-3.5" />}
                    {cat === 'custom' && <Settings className="w-3.5 h-3.5" />}
                    <span className="capitalize">{cat === 'ai' ? 'Vertex AI' : cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Service Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-400">Nombre del Servicio GCP / API</label>
            <input
              type="text"
              required
              placeholder="e.g. Vertex AI Auto-labeling, BigQuery Slots"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/60 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none transition-stroke"
            />
          </div>

          {/* Metric Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-400">Métrica del Límite</label>
            <input
              type="text"
              required
              placeholder="e.g. Consultas Concurrentes, Gigabytes Consultados"
              value={metricName}
              onChange={(e) => setMetricName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/60 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none transition-stroke"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Limit */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-400">Límite Permitido</label>
              <input
                type="number"
                min="0.1"
                step="any"
                required
                value={limit}
                onChange={(e) => setLimit(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/60 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono outline-none"
              />
            </div>

            {/* Current Usage */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-400">Uso Inicial</label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={currentUsage}
                onChange={(e) => setCurrentUsage(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/60 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Unit */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-400">Unidad de Medida</label>
              <input
                type="text"
                placeholder="e.g. RPM, TB, Cores, Calls"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/60 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono outline-none"
              />
            </div>

            {/* Daily consumption velocity */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-400">Uso Diario Promedio</label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={dailyRate}
                onChange={(e) => setDailyRate(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/60 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono outline-none"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 justify-end pt-4 border-t border-slate-800/80 mt-2">
            <button
              id="modal_cancel_btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-800 hover:bg-slate-800/50 hover:text-slate-200 rounded-xl text-xs font-semibold text-slate-400 cursor-pointer transition-all"
            >
              Cancelar
            </button>
            <button
              id="modal_submit_btn"
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/15"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Registrar Cuota</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
