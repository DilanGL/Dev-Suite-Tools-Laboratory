import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { AlertTriangle, ShieldCheck, X, RefreshCw, Skull, HelpCircle, TrendingUp } from 'lucide-react';

export const AlertsPanel: React.FC = () => {
  const { activeAlerts, dismissAlert, resetAlerts, dismissedAlertIds } = useDashboard();

  return (
    <section className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/10">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 tracking-tight">Alertas Inteligentes & Predicciones</h2>
            <p className="text-xs text-slate-400">Notificaciones y análisis predictivo de agotamiento de cuotas</p>
          </div>
        </div>

        {/* Clear dismissals actions if some are missing */}
        {dismissedAlertIds.length > 0 && (
          <button
            id="alerts_btn_reset_dismissals"
            onClick={resetAlerts}
            className="text-[10px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline cursor-pointer font-mono"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Restaurar {dismissedAlertIds.length} Alertas Ocultas</span>
          </button>
        )}
      </div>

      {activeAlerts.length === 0 ? (
        /* Empty / All Safe state */
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-emerald-400 leading-tight">Consumos bajo límites normales</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Todas las cuotas de Google Cloud y Gemini API están operativas, por debajo del 70% de uso. No se reportan anomalías de sobregiro.
          </p>
        </div>
      ) : (
        /* Alerts List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activeAlerts.map((alert) => {
            const isCritical = alert.type === 'critical';
            const isWarning = alert.type === 'warning';
            
            return (
              <div
                key={alert.id}
                id={`alert_item_${alert.id}`}
                className={`relative flex gap-3 p-4 rounded-xl border flex-col justify-between transition-all ${
                  isCritical
                    ? 'bg-red-500/5 border-red-500/30'
                    : isWarning
                      ? 'bg-amber-500/5 border-amber-500/30'
                      : 'bg-blue-500/5 border-blue-500/30'
                }`}
              >
                {/* Dismiss Button */}
                <button
                  id={`alert_dismiss_btn_${alert.id}`}
                  onClick={() => dismissAlert(alert.id)}
                  className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 p-1 rounded-md hover:bg-slate-900 transition-colors cursor-pointer"
                  title="Descartar alerta"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="flex gap-3 leading-relaxed">
                  <div className={`p-2 rounded-lg shrink-0 w-9 h-9 flex items-center justify-center ${
                    isCritical
                      ? 'bg-red-500/10 text-red-400'
                      : isWarning
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {isCritical ? (
                      <Skull className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                  </div>

                  <div className="pr-6">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${
                        isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-blue-400'
                      }`}>
                        {isCritical ? 'Estado Crítico' : isWarning ? 'Advertencia' : 'Predicción'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        • {alert.serviceName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 mt-1.5 leading-relaxed font-sans">
                      {alert.message}
                    </p>
                  </div>
                </div>

                {/* Sub info predictions indicators details */}
                {alert.predictedDaysLeft !== undefined && (
                  <div className="mt-2 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 text-slate-400">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                      Proyección de Consumo Lineal
                    </span>
                    <span className={`font-semibold ${
                      alert.predictedDaysLeft <= 1 ? 'text-red-400 underline animate-pulse' : 'text-blue-300'
                    }`}>
                      Agotamiento en {alert.predictedDaysLeft} días
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
