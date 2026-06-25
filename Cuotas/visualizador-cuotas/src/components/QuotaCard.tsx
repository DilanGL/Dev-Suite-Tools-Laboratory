import React, { useState } from 'react';
import { Quota } from '../types';
import { useDashboard } from '../context/DashboardContext';
import {
  Sparkles,
  Database,
  Cpu,
  Map,
  Settings,
  Edit2,
  Trash2,
  Check,
  X,
  TrendingUp,
  AlertTriangle,
  Skull,
  History,
  Activity
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface QuotaCardProps {
  quota: Quota;
}

export const QuotaCard: React.FC<QuotaCardProps> = ({ quota }) => {
  const { updateQuota, deleteQuota } = useDashboard();
  const [isEditing, setIsEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // For Edit Inputs
  const [editUsage, setEditUsage] = useState(quota.currentUsage);
  const [editLimit, setEditLimit] = useState(quota.limit);
  const [editDailyRate, setEditDailyRate] = useState(quota.dailyRate);

  const percentage = (quota.currentUsage / quota.limit) * 100;
  
  // Threshold determination
  const isCritical = percentage >= 90;
  const isWarning = percentage >= 70 && percentage < 90;
  const isNormal = percentage < 70;

  // Icon picking mapping
  const getCategoryIcon = () => {
    switch (quota.category) {
      case 'ai':
        return <Sparkles className="w-5 h-5" />;
      case 'storage':
        return <Database className="w-5 h-5" />;
      case 'compute':
        return <Cpu className="w-5 h-5" />;
      case 'maps':
        return <Map className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  // Color mapping based on state
  const getContainerStyles = () => {
    if (isCritical) {
      return 'border-red-500/40 bg-red-950/10 shadow-[0_0_20px_rgba(239,68,68,0.12)] animate-pulse';
    }
    if (isWarning) {
      return 'border-amber-500/40 bg-amber-950/5 shadow-md';
    }
    return 'border-slate-800/80 bg-slate-900/30 hover:border-slate-700/80 transition-colors';
  };

  const getPercentageColor = () => {
    if (isCritical) return 'text-red-400';
    if (isWarning) return 'text-amber-400';
    return 'text-blue-400';
  };

  const getProgressTrackColor = () => {
    if (isCritical) return 'from-red-500 to-red-600 shadow-[0_0_8px_rgba(239,68,68,0.4)]';
    if (isWarning) return 'from-amber-400 to-amber-500';
    return 'from-blue-500 to-emerald-500';
  };

  // SVG Circular Gauge calculation
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  // Capped at 100 to prevent circle wrapping over 100%
  const strokeDashoffset = circumference - (Math.min(100, percentage) / 100) * circumference;

  const handleSave = () => {
    if (editLimit <= 0) return;
    updateQuota(quota.id, editUsage, editLimit, editDailyRate);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditUsage(quota.currentUsage);
    setEditLimit(quota.limit);
    setEditDailyRate(quota.dailyRate);
    setIsEditing(false);
  };

  return (
    <div
      id={`quota_card_${quota.id}`}
      className={`relative rounded-2xl border p-5 flex flex-col justify-between overflow-hidden transition-all duration-300 ${getContainerStyles()}`}
    >
      {/* Background radial highlight gradient */}
      <div className={`absolute -right-12 -top-12 w-28 h-28 rounded-full blur-3xl opacity-15 pointer-events-none ${
        isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-blue-500'
      }`} />

      {/* Card Header information */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            isCritical 
              ? 'bg-red-500/10 border-red-500/20 text-red-400' 
              : isWarning 
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                : 'bg-slate-900 border-slate-800 text-slate-300'
          }`}>
            {getCategoryIcon()}
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono block">
              {quota.category === 'ai' ? 'Vertex / Gemini' : 'Google Cloud Platform'}
            </span>
            <h3 className="text-sm font-semibold text-slate-100 font-sans tracking-tight leading-tight mt-0.5">
              {quota.serviceName}
            </h3>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!isEditing ? (
            <>
              <button
                id={`btn_edit_quota_${quota.id}`}
                onClick={() => setIsEditing(true)}
                className="p-1 px-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all cursor-pointer text-[10px] inline-flex items-center gap-1 font-semibold"
                title="Editar límites"
              >
                <Edit2 className="w-3 h-3 text-slate-400" />
                <span>Editar</span>
              </button>
              {quota.id.startsWith('custom-') && (
                <button
                  id={`btn_delete_quota_${quota.id}`}
                  onClick={() => deleteQuota(quota.id)}
                  className="p-1.5 rounded bg-slate-900 hover:bg-red-950/30 border border-slate-800 hover:border-red-900/30 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                  title="Eliminar cuota"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </>
          ) : (
            <div className="flex gap-1">
              <button
                id={`btn_save_quota_${quota.id}`}
                onClick={handleSave}
                className="p-1.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all cursor-pointer"
                title="Guardar"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                id={`btn_cancel_quota_${quota.id}`}
                onClick={handleCancel}
                className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 transition-all cursor-pointer"
                title="Cancelar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card Content & Analytics Area */}
      <div className="mt-6 flex items-center justify-between gap-4">
        
        {/* Metric detailed values */}
        <div className="flex-1 min-w-0">
          {!isEditing ? (
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 font-medium block truncate">
                {quota.metricName}
              </span>
              
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono tracking-tight text-white leading-none">
                  {quota.currentUsage}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  / {quota.limit} {quota.unit}
                </span>
              </div>

              {/* Status Pill Badge */}
              <div className="flex items-center gap-1.5 pt-2">
                {isCritical ? (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded font-medium">
                    <Skull className="w-3 h-3 text-red-400" />
                    Crítico &gt;90%
                  </span>
                ) : isWarning ? (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-medium">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    Advertencia &gt;70%
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-medium">
                    Seguro
                  </span>
                )}

                {quota.dailyRate > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                    <TrendingUp className="w-3 h-3 text-slate-500" />
                    +{quota.dailyRate}/día
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* Editing Inline Micro-Form */
            <div className="flex flex-col gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase">Uso Actual:</label>
                <input
                  type="number"
                  step="any"
                  value={editUsage}
                  onChange={(e) => setEditUsage(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase">Límite Total:</label>
                <input
                  type="number"
                  step="any"
                  value={editLimit}
                  onChange={(e) => setEditLimit(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase">Tasa de Incremento Diaria:</label>
                <input
                  type="number"
                  step="any"
                  value={editDailyRate}
                  onChange={(e) => setEditDailyRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Circular SVG Gauge (Right column) */}
        {!isEditing && (
          <div className="relative flex-shrink-0 flex items-center justify-center">
            <svg className="w-20 h-20 transform -rotate-90">
              {/* Underlay Track */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="6.5"
                fill="transparent"
              />
              {/* Active usage track with transition */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="transition-all duration-500 ease-out"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeWidth="6.5"
                strokeLinecap="round"
                fill="transparent"
                stroke="url(#gradient-usage)" /* use styled fallback below */
                style={{
                  stroke: isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#3b82f6'
                }}
              />
            </svg>
            
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-[13px] font-bold font-mono tracking-tight ${getPercentageColor()}`}>
                {percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Visual Linear Track at bottom margin for secondary feedback */}
      <div className="mt-4.5 w-full h-1 bg-slate-900 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r rounded-full transition-all duration-500 ${getProgressTrackColor()}`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>

      {/* Historic toggle button and telemetry source badge */}
      {!isEditing && (
        <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="inline-flex items-center gap-1.5 text-[11px] text-blue-400 hover:text-blue-300 font-mono transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>{showHistory ? 'Ocultar Historial' : 'Ver Historial (Real)'}</span>
          </button>
          
          {quota.history && quota.history.length > 0 && (
            <span className="text-[9px] bg-slate-950 px-2 py-0.5 rounded border border-slate-900 text-slate-500 font-mono">
              {quota.id.startsWith('custom-') ? 'Muestra Simulada' : 'GCM Telemetría Real'}
            </span>
          )}
        </div>
      )}

      {/* Collapsible Recharts Area Chart */}
      {showHistory && !isEditing && quota.history && (
        <div className="mt-4 p-3.5 bg-slate-950/60 rounded-xl border border-slate-900/80">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
              Consumo en el Tiempo
            </span>
            <span className="text-[9px] text-slate-500 font-mono">
              Lookback 24h
            </span>
          </div>
          
          <div className="h-32 w-full text-slate-200">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={quota.history} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id={`colorUsage-${quota.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#3b82f6'} stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#3b82f6'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.25} vertical={false} />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fill: '#64748b', fontSize: 8, fontFamily: 'monospace' }} 
                  stroke="#334155"
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 8, fontFamily: 'monospace' }} 
                  stroke="#334155"
                  tickLine={false}
                  domain={[0, 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    color: '#f8fafc'
                  }}
                  itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={isCritical ? '#f87171' : isWarning ? '#fbbf24' : '#60a5fa'} 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill={`url(#colorUsage-${quota.id})`} 
                  name="Uso"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
