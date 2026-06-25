import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Cloud, LogOut, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout, quotas, projectId } = useDashboard();

  // Calculate high-level status metrics from real data
  const criticalCount = quotas.filter((q) => (q.currentUsage / q.limit) * 100 >= 90).length;
  const warningCount = quotas.filter((q) => {
    const p = (q.currentUsage / q.limit) * 100;
    return p >= 70 && p < 90;
  }).length;

  return (
    <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      {/* Brand Logo & Project info */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
          <Cloud className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2 font-mono">
            GCP <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-450 font-sans">LIVE QUOTAS</span>
          </h1>
          <p className="text-[10px] text-slate-450 font-mono flex items-center gap-1.5 mt-0.5">
            PROJECT:
            <span className="text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/15">
              {projectId || 'non-auth'}
            </span>
          </p>
        </div>
      </div>

      {/* Header Quick Status Indicator */}
      <div className="hidden lg:flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-slate-350">Monitoreo Real</span>
        </div>
        {criticalCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
            <span>{criticalCount} Crítico</span>
          </div>
        )}
        {warningCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <span>{warningCount} Alerta</span>
          </div>
        )}
      </div>

      {/* Authentication and Profile Action */}
      <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
        {user && (
          <div className="flex items-center gap-3">
            {/* User Profile */}
            <div className="flex items-center gap-2.5 bg-slate-900/60 border border-slate-800/80 rounded-xl pl-3 pr-4 py-1.5 shadow-lg">
              <img
                src={user.avatarUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full border border-emerald-500/40 object-cover"
              />
              <div className="text-left font-sans">
                <span className="text-xs block font-semibold text-slate-200 leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block">
                  {user.email}
                </span>
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-400 ml-1" />
            </div>

            {/* Logout button */}
            <button
              id="header_logout_btn"
              onClick={logout}
              className="p-2.5 rounded-xl border border-slate-800 hover:border-red-500/30 hover:bg-red-500/5 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
              title="Desconectar cuenta"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
