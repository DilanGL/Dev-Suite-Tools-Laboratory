import React, { useState, useEffect } from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { QuotaCard } from './components/QuotaCard';
import { AlertsPanel } from './components/AlertsPanel';
import { AddQuotaModal } from './components/AddQuotaModal';
import { 
  Search, 
  HelpCircle, 
  Layers, 
  Terminal, 
  Key, 
  RefreshCw, 
  Cloud, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { 
    quotas, 
    user, 
    accessToken, 
    projects, 
    projectId, 
    setProjectId, 
    isLoading, 
    isLoggingIn, 
    loginWithToken, 
    activeAlerts,
    error 
  } = useDashboard();

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ai' | 'storage' | 'compute' | 'maps' | 'custom'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [config, setConfig] = useState<{ hasEnvClientId: boolean; envClientId: string; appUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyCommand = () => {
    navigator.clipboard.writeText('gcloud auth print-access-token');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Fetch backend environmental config on boot
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(() => {});
  }, []);

  const [customClientId, setCustomClientId] = useState(() => {
    return localStorage.getItem('gcp_custom_client_id') || '';
  });
  const [gsiError, setGsiError] = useState<string | null>(null);

  // Save custom client ID to localStorage when updated
  useEffect(() => {
    localStorage.setItem('gcp_custom_client_id', customClientId);
  }, [customClientId]);

  // Launch Google Identity Services Token flow
  const loginWithGoogleIdentityServices = () => {
    setGsiError(null);
    const activeClientId = config?.envClientId || customClientId;
    
    if (!activeClientId) {
      setGsiError('Por favor proporcione un ID de Cliente de Google.');
      return;
    }

    try {
      const googleObj = (window as any).google;
      if (!googleObj?.accounts?.oauth2) {
        setGsiError('El script de Google Identity Services no está cargado. Por favor, espere o recargue la página.');
        return;
      }

      const client = googleObj.accounts.oauth2.initTokenClient({
        client_id: activeClientId.trim(),
        scope: 'https://www.googleapis.com/auth/cloud-platform.read-only https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
        callback: async (response: any) => {
          if (response.error) {
            setGsiError(`Error de Google: ${response.error_description || response.error}`);
            return;
          }
          if (response.access_token) {
            await loginWithToken(response.access_token);
          }
        },
      });

      client.requestAccessToken();
    } catch (err: any) {
      setGsiError(`Error al inicializar el cliente GIS: ${err.message}`);
    }
  };

  const handleTokenLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      loginWithToken(tokenInput.trim());
    }
  };

  // Filter quotas based on Category and Search Query
  const filteredQuotas = quotas.filter((q) => {
    const matchesCategory = selectedCategory === 'all' ? true : q.category === selectedCategory;
    const matchesSearch =
      q.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.metricName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate Statistics
  const totalCount = quotas.length;
  const criticalCount = quotas.filter((q) => (q.currentUsage / q.limit) * 100 >= 90).length;
  const warningCount = quotas.filter((q) => {
    const pct = (q.currentUsage / q.limit) * 100;
    return pct >= 70 && pct < 90;
  }).length;
  const healthyCount = totalCount - criticalCount - warningCount;

  // Render authentic credentials connect panel if not logged in
  if (!user) {
    return (
      <div id="auth_portal" className="min-h-screen bg-slate-950 text-slate-50 font-sans flex flex-col justify-between selection:bg-blue-600/30 selection:text-white">
        {/* Navigation spacer bar */}
        <div className="border-b border-slate-900 bg-slate-950/80 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Cloud className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold tracking-tight font-mono uppercase">GCP Quotas Mon</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1.5 bg-emerald-500/5 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            CONEXIÓN AUTÉNTICA REQUERIDA
          </span>
        </div>

        {/* Center Card */}
        <main className="flex-1 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,58,138,0.15),rgba(255,255,255,0))]">
          <div className="w-full max-w-xl bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            {/* Ambient visual gradient element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header Title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-white">Visualice sus límites reales</h2>
              <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                Este dashboard requiere sus credenciales reales de Google Cloud. No hay datos de relleno ni simulaciones desactivadas.
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-xs text-red-400 flex items-start gap-3">
                <AlertCircle className="w-4.5 h-4.5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Error al conectar con Google Cloud</p>
                  <p className="mt-1 opacity-90 leading-relaxed text-[11px]">{error}</p>
                </div>
              </div>
            )}

            {/* Credential Login Form */}
            <form onSubmit={handleTokenLoginSubmit} className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  Conexión directa con Token de Acceso (Opción Recomendada):
                </label>
                
                {/* Instruction container code snippet */}
                <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 font-mono text-[11px] text-slate-400 leading-relaxed space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-505 uppercase font-bold tracking-wider">EJECUTE EN SU TERMINAL LOCAL:</p>
                    <button
                      id="copy_command_btn"
                      type="button"
                      onClick={handleCopyCommand}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer border ${
                        copied
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-blue-500/5 border-blue-500/10 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/25"
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar Comando</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="relative">
                    <pre className="text-blue-300 bg-blue-950/20 py-2.5 px-3 rounded-xl border border-blue-500/15 overflow-x-auto select-all font-semibold font-mono tracking-wide text-xs">
                      gcloud auth print-access-token
                    </pre>
                  </div>
                  
                  <p className="text-[10px] text-slate-500 leading-normal font-sans">
                    Copie el token de acceso temporal devuelto por este comando y péguelo en el campo inferior. La sincronización se realiza de forma directa en tiempo real.
                  </p>
                </div>

                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Key className="w-4 h-4 text-slate-500" />
                  </span>
                  <input
                    id="access_token_input"
                    type="password"
                    placeholder="ya29.a0AcvnbF..."
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    required
                    className="w-full bg-slate-950 pl-10 pr-4 py-3 border border-slate-800 focus:border-blue-500/50 rounded-2xl text-xs text-slate-100 outline-none transition-all placeholder:text-slate-600 focus:ring-1 focus:ring-blue-500/20 font-mono"
                  />
                </div>
              </div>

              {/* Submit trigger button */}
              <button
                id="submit_token_btn"
                type="submit"
                disabled={isLoading || isLoggingIn}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-xs rounded-2xl shadow-xl shadow-blue-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading || isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Conectando y recuperando sus cuotas reales...</span>
                  </>
                ) : (
                  <>
                    <span>Sincronizar Panel</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Google Identity Services Real Connection */}
            <div className="mt-8 pt-6 border-t border-slate-850">
              <p className="text-[10px] text-slate-500 font-mono text-center uppercase tracking-wider mb-4">AUTENTICACIÓN DIRECTA CON GOOGLE</p>
              
              {gsiError && (
                <div className="mb-4 bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 text-[11px] text-amber-400">
                  {gsiError}
                </div>
              )}

              {!config?.hasEnvClientId && (
                <div className="mb-4 flex flex-col gap-2 text-left">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                    ID de Cliente de Google (GCP OAuth Client ID):
                  </label>
                  <input
                    type="text"
                    placeholder="123456789-abcdef.apps.googleusercontent.com"
                    value={customClientId}
                    onChange={(e) => setCustomClientId(e.target.value)}
                    className="w-full bg-slate-950 px-3.5 py-2.5 border border-slate-800 focus:border-blue-500/50 rounded-xl text-xs text-slate-200 outline-none placeholder:text-slate-700 font-mono focus:ring-1 focus:ring-blue-500/25"
                  />
                  <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3 text-[10px] text-slate-500 space-y-1">
                    <p className="leading-normal font-sans">
                      Para usar esto, cree un <strong>ID de cliente de OAuth (Aplicación web)</strong> en su consola de Google Cloud y añada esta URL de origen autorizado:
                    </p>
                    <pre className="text-blue-400 bg-blue-500/5 py-1 px-2 rounded border border-blue-500/10 select-all overflow-x-auto text-[10px]">
                      {window.location.origin}
                    </pre>
                  </div>
                </div>
              )}

              <button
                id="oauth_browser_btn"
                type="button"
                onClick={loginWithGoogleIdentityServices}
                disabled={isLoading || isLoggingIn}
                className="w-full py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Cloud className="w-4 h-4 text-blue-400" />
                <span>
                  {isLoading || isLoggingIn 
                    ? "Autenticando..." 
                    : config?.hasEnvClientId 
                      ? "Conectar vía Navegador (Google OAuth2)" 
                      : "Conectar con Google Identity Services"}
                </span>
              </button>
            </div>
          </div>
        </main>

        {/* Footer info */}
        <footer className="border-t border-slate-950 pb-8 pt-4 text-center text-[10px] font-mono text-slate-600">
          Google Cloud Monitoring Portal • 100% Sin Datos Falsos
        </footer>
      </div>
    );
  }

  // Active dashboard view
  return (
    <div id="app_viewport" className="min-h-screen bg-slate-950 text-slate-50 font-sans flex flex-col selection:bg-blue-600/30 selection:text-white">
      {/* Top Glassmorphic Navbar */}
      <Header />

      {/* Main Grid Viewport */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar Navigation & Simulation Dashboard Controls */}
        <Sidebar
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />

        {/* Dashboard Core Body */}
        <main className="flex-1 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto max-w-[1600px] mx-auto w-full">
          
          {/* Project dropdown display bar if multi-projects exist */}
          {projects.length > 0 && (
            <div className="bg-slate-900/30 border border-slate-800 px-5 py-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs text-slate-400 font-mono">PROYECTO SELECCIONADO:</span>
              </div>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-3 pr-8 py-2 rounded-xl outline-none font-sans font-medium focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 max-w-sm w-full cursor-pointer"
              >
                {projects.map((proj: any) => (
                  <option key={proj.projectId} value={proj.projectId}>
                    {proj.name || proj.projectId} ({proj.projectId})
                  </option>
                ))}
              </select>
            </div>
          )}

          {isLoading && (
            <div className="py-3 px-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl text-xs text-blue-400 flex items-center gap-3 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
              <span>Sincronizando sus cuotas directamente desde el Cloud Quotas API de Google...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-4 text-xs text-red-400 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Inconveniente de Sincronización</p>
                <p className="mt-1 opacity-90 leading-relaxed text-[11px]">{error}</p>
              </div>
            </div>
          )}

          {/* Dashboard Summary Counter Banner */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Total Metrics Monitored */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">Límites de GCP</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold font-mono text-slate-100">{totalCount}</span>
                <span className="text-xs text-slate-400">métricas</span>
              </div>
              <div className="w-full bg-slate-950 h-1 rounded-full mt-3 overflow-hidden">
                <div className="bg-blue-500 h-full w-full" />
              </div>
            </div>

            {/* Critical Limit Status */}
            <div className={`border rounded-2xl p-4 flex flex-col justify-between transition-colors ${
              criticalCount > 0 
                ? 'bg-red-500/5 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.06)]' 
                : 'bg-slate-900/40 border-slate-800/80'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">Excesos Críticos (+90%)</span>
                {criticalCount > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className={`text-2xl font-bold font-mono ${criticalCount > 0 ? 'text-red-400' : 'text-slate-100'}`}>
                  {criticalCount}
                </span>
                <span className="text-xs text-slate-400">riesgos</span>
              </div>
              <div className="w-full bg-slate-950 h-1 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-red-500 h-full transition-all duration-500" 
                  style={{ width: `${totalCount > 0 ? (criticalCount / totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Warnings threshold */}
            <div className={`border rounded-2xl p-4 flex flex-col justify-between transition-colors ${
              warningCount > 0 
                ? 'bg-amber-500/5 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.06)]' 
                : 'bg-slate-900/40 border-slate-800/80'
            }`}>
              <span className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">Advertencias (+70%)</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className={`text-2xl font-bold font-mono ${warningCount > 0 ? 'text-amber-400' : 'text-slate-100'}`}>
                  {warningCount}
                </span>
                <span className="text-xs text-slate-400">alertas</span>
              </div>
              <div className="w-full bg-slate-950 h-1 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-amber-500 h-full transition-all duration-500" 
                  style={{ width: `${totalCount > 0 ? (warningCount / totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Safe statuses count */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">Sistemas Seguros (&lt;70%)</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold font-mono text-emerald-400">{healthyCount}</span>
                <span className="text-xs text-slate-400">normales</span>
              </div>
              <div className="w-full bg-slate-950 h-1 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${totalCount > 0 ? (healthyCount / totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>

          </section>

          {/* Core Row 1: Alerts and Depletion Predictions Panel */}
          {activeAlerts.length > 0 && <AlertsPanel />}

          {/* Search, Sort and Filtering Controls Section */}
          <section className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/20 border border-slate-800 p-4 rounded-2xl">
            {/* Left Column: Search Bar */}
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-500" />
              </span>
              <input
                id="search_quota_input"
                type="text"
                placeholder="Filtrar servicios cargados..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 pl-10 pr-4 py-2 border border-slate-800 focus:border-blue-500/50 rounded-xl text-xs text-slate-200 outline-none transition-stroke focus:ring-1 focus:ring-blue-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] text-slate-500 hover:text-slate-350"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Right Column: Display parameters / Selected category pill */}
            <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end text-xs text-slate-400">
              <span className="font-mono text-[10px]">
                Filtrado por: <strong className="text-blue-400 capitalize">{selectedCategory === 'all' ? 'Todos' : selectedCategory}</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-[10px]">
                Mostrando <strong className="text-slate-200">{filteredQuotas.length}</strong> de {totalCount} cuotas
              </span>
            </div>
          </section>

          {/* Quotas grid display workspace */}
          <section id="quotas_grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredQuotas.length > 0 ? (
              filteredQuotas.map((quota) => (
                <QuotaCard key={quota.id} quota={quota} />
              ))
            ) : (
              /* No Results Card Match */
              <div className="col-span-full py-16 px-4 border border-dashed border-slate-800/80 rounded-2xl bg-slate-900/10 flex flex-col items-center text-center justify-center">
                {totalCount === 0 ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-slate-550 flex items-center justify-center mb-3 border border-slate-800">
                      <HelpCircle className="w-5 h-5 text-blue-400" />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-300">Conexión establecida con éxito</h4>
                    <p className="text-xs text-slate-450 max-w-sm mt-1.5 leading-relaxed">
                      Sincronice el panel para ver cuotas activas. Asegúrese de tener el API <strong>cloudquotas.googleapis.com</strong> habilitado en el proyecto deseado en Google Cloud Console.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-slate-500 flex items-center justify-center mb-3 border border-slate-800">
                      <Search className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-300">Ningúna cuota coincide con los filtros</h4>
                    <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-relaxed font-sans">
                      Busque otro término o seleccione otra categoría en el menú lateral.
                    </p>
                  </>
                )}
              </div>
            )}
          </section>

          {/* Info Banner on usage instructions */}
          <footer className="mt-8 border-t border-slate-900 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 font-mono">
            <p>Google Cloud Live Quotas Monitor • 100% Auténtico</p>
            <p>Métricas reales en tiempo real vía GCP APIs</p>
          </footer>
        </main>
      </div>

      {/* Creación de nueva cuota modal popup */}
      <AddQuotaModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
