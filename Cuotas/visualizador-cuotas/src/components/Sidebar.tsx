import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import {
  Sparkles,
  Database,
  Cpu,
  Map,
  Layers,
  Settings,
  RefreshCw,
  Plus,
  HelpCircle,
  Lightbulb
} from 'lucide-react';

interface SidebarProps {
  selectedCategory: string;
  setSelectedCategory: (category: any) => void;
  onOpenAddModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedCategory,
  setSelectedCategory,
  onOpenAddModal
}) => {
  const {
    resetQuotas,
    quotas,
    fetchGcpData,
    accessToken,
    projectId,
    isLoading
  } = useDashboard();

  // Categories definition derived from real loaded counts
  const categories = [
    { id: 'all', name: 'Todos los Límites', icon: Layers, count: quotas.length },
    { id: 'ai', name: 'Gemini, Vertex & AI', icon: Sparkles, count: quotas.filter(q => q.category === 'ai').length },
    { id: 'storage', name: 'Cloud Storage', icon: Database, count: quotas.filter(q => q.category === 'storage').length },
    { id: 'compute', name: 'Compute Engine', icon: Cpu, count: quotas.filter(q => q.category === 'compute').length },
    { id: 'maps', name: 'Google Maps API', icon: Map, count: quotas.filter(q => q.category === 'maps').length },
    { id: 'custom', name: 'Personalizados', icon: Settings, count: quotas.filter(q => q.category === 'custom').length }
  ];

  const handleManualSync = () => {
    if (accessToken && projectId) {
      fetchGcpData(accessToken, projectId);
    }
  };

  return (
    <aside className="w-full lg:w-72 border-r border-slate-900 bg-slate-950 px-6 py-6 flex flex-col gap-8 flex-shrink-0">
      
      {/* Search & Categories */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Filtros de Servicios</p>
          <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
            {quotas.length} cargados
          </span>
        </div>

        <nav className="flex flex-col gap-1.5" aria-label="Filtrado de servicios">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                id={`sidebar_filter_${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-sans transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600/10 border border-blue-500/30 text-blue-300 font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                  <span>{cat.name}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                  isActive ? 'bg-blue-500/20 text-blue-200' : 'bg-slate-900 text-slate-500'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Control Panel (Planning & Real sync tools) */}
      <div className="flex flex-col gap-4 bg-slate-950 border border-slate-900 rounded-2xl p-4 mt-auto">
        <div className="flex items-center gap-2">
          <Settings className="w-3.5 h-3.5 text-slate-500" />
          <h3 className="text-xs font-bold text-slate-350 tracking-wider uppercase">Operaciones Reales</h3>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
          Administre la recolección activa de datos de Google APIs o agregue límites simulados con fines de planificación.
        </p>

        <div className="flex flex-col gap-2 pt-2">
          {/* Sync Trigger button */}
          <button
            id="sidebar_btn_peak_traffic"
            onClick={handleManualSync}
            disabled={isLoading || !accessToken || !projectId}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-blue-900/20 via-blue-950/20 to-slate-900/10 hover:from-blue-950/40 hover:to-slate-900 border border-blue-500/30 hover:border-blue-400/50 rounded-xl text-xs font-semibold text-blue-300 inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-40"
            title="Sincronizar e importar las cuotas en tiempo real de Google Cloud"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sincronizar Cloud Quotas</span>
          </button>

          {/* Add custom quota */}
          <button
            id="sidebar_btn_add_quota"
            onClick={onOpenAddModal}
            className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-200 inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-400" />
            <span>Crear Límite de Planificación</span>
          </button>

          {/* Reset button */}
          <button
            id="sidebar_btn_reset"
            onClick={resetQuotas}
            className="w-full py-2 px-3 border border-slate-900 hover:border-slate-850 hover:bg-slate-900 text-slate-500 hover:text-slate-350 rounded-xl text-[11px] font-semibold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-1 font-mono"
          >
            <span>Restaurar Métricas GCP</span>
          </button>
        </div>
      </div>

      {/* Footer / Info */}
      <div className="text-[10px] text-slate-500 leading-tight flex flex-col gap-1.5 font-mono">
        <p className="flex items-center gap-1.5 text-slate-400 font-bold">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>Información de Límites:</span>
        </p>
        <p className="pl-5 leading-normal">
          Las cuotas se cargan directamente desde <strong>Cloud Quotas API</strong> de GCP. Las métricas de consumo de recursos reales se obtienen vía <strong>Cloud Monitoring</strong>.
        </p>
      </div>
    </aside>
  );
};
