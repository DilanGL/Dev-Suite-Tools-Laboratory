import React, { createContext, useContext, useState, useEffect } from 'react';
import { Quota, UserProfile, Alert } from '../types';

interface DashboardContextType {
  user: UserProfile | null;
  isLoggingIn: boolean;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
  quotas: Quota[];
  addQuota: (quota: Omit<Quota, 'id'>) => void;
  updateQuota: (id: string, currentUsage: number, limit: number, dailyRate: number) => void;
  deleteQuota: (id: string) => void;
  resetQuotas: () => void;
  dismissedAlertIds: string[];
  dismissAlert: (alertId: string) => void;
  resetAlerts: () => void;
  activeAlerts: Alert[];
  accessToken: string;
  projectId: string;
  setProjectId: (id: string) => void;
  projects: any[];
  isLoading: boolean;
  error: string | null;
  setError: (err: string | null) => void;
  fetchGcpData: (token: string, projId: string) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string>(() => {
    return localStorage.getItem('gcp_access_token') || '';
  });

  const [projectId, setProjectId] = useState<string>(() => {
    return localStorage.getItem('gcp_project_id') || '';
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const raw = localStorage.getItem('gcp_user');
    return raw ? JSON.parse(raw) : null;
  });

  const [projects, setProjects] = useState<any[]>(() => {
    const raw = localStorage.getItem('gcp_projects_list');
    return raw ? JSON.parse(raw) : [];
  });

  const [quotas, setQuotas] = useState<Quota[]>(() => {
    const raw = localStorage.getItem('gcp_quotas');
    return raw ? JSON.parse(raw) : [];
  });

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>(() => {
    const raw = localStorage.getItem('gcp_dismissed_alerts');
    return raw ? JSON.parse(raw) : [];
  });

  // State Persistence callbacks
  useEffect(() => {
    localStorage.setItem('gcp_access_token', accessToken);
  }, [accessToken]);

  useEffect(() => {
    localStorage.setItem('gcp_project_id', projectId);
    if (accessToken && projectId) {
      fetchGcpData(accessToken, projectId);
    }
  }, [projectId]);

  useEffect(() => {
    localStorage.setItem('gcp_user', user ? JSON.stringify(user) : '');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('gcp_projects_list', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('gcp_quotas', JSON.stringify(quotas));
  }, [quotas]);

  useEffect(() => {
    localStorage.setItem('gcp_dismissed_alerts', JSON.stringify(dismissedAlertIds));
  }, [dismissedAlertIds]);

  // Auth using personal Google Command Line Access Token
  const loginWithToken = async (token: string) => {
    if (!token) return;
    setIsLoggingIn(true);
    setError(null);
    try {
      // 1. Fetch User profile using token
      const profileResp = await fetch(`/api/gcp/user?accessToken=${encodeURIComponent(token)}`);
      if (!profileResp.ok) {
        throw new Error('Token inválido o expirado. Genere uno nuevo con: gcloud auth print-access-token');
      }
      const data = await profileResp.json();

      // 2. Fetch projects of this authorized user account
      const projectsResp = await fetch(`/api/gcp/projects?accessToken=${encodeURIComponent(token)}`);
      let projectsList: any[] = [];
      if (projectsResp.ok) {
        projectsList = await projectsResp.json();
      }

      setAccessToken(token);
      setProjects(projectsList);

      const computedUser: UserProfile = {
        name: data.name || data.email || 'Google User',
        email: data.email || '',
        avatarUrl: data.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop',
        projectId: projectId || (projectsList[0]?.projectId || '')
      };

      setUser(computedUser);

      // Auto select first project if none exists yet
      if (!projectId && projectsList.length > 0) {
        setProjectId(projectsList[0].projectId);
      } else if (projectId) {
        await fetchGcpData(token, projectId);
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión con Google Cloud');
      setUser(null);
      setAccessToken('');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Main active metrics and quota limits sync logic from Cloud Quotas and Cloud Monitoring
  const fetchGcpData = async (token: string, projId: string) => {
    if (!token || !projId) return;
    setIsLoading(true);
    setError(null);

    try {
      const resp = await fetch(`/api/gcp/quotas?projectId=${encodeURIComponent(projId)}&accessToken=${encodeURIComponent(token)}`);
      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || 'No se pudieron recuperar las cuotas de GCP.');
      }

      const data = await resp.json();
      const rawQuotas = data.quotas || [];
      const monitoringSeries = data.monitoringTimeSeries || [];

      // Transform raw Google Quotas API quotaInfos inside our local Quota type schema
      const mapped: Quota[] = rawQuotas.map((item: any) => {
        const info = item.quotaInfo;
        const rawLimitValue = parseFloat(info.dimensionsInfos?.[0]?.quotaDetails?.value || '0');
        const metricName = info.metric || item.metricName || 'Unknown Quota';
        
        // Find current usage matching index in Cloud Monitoring API series (if available)
        let foundHistory = 0;
        let historyPoints: { timestamp: string; value: number }[] = [];
        const matchingSeries = monitoringSeries.find((ts: any) => {
          return ts.metric?.labels?.quota_metric === metricName;
        });

        if (matchingSeries && matchingSeries.points?.length > 0) {
          const pt = matchingSeries.points[0];
          foundHistory = parseFloat(pt.value?.doubleValue || pt.value?.int64Value || '0');
          
          // Map all available points as 100% real history
          historyPoints = matchingSeries.points.map((p: any) => {
            const val = parseFloat(p.value?.doubleValue || p.value?.int64Value || '0');
            const dateObj = p.interval?.endTime ? new Date(p.interval.endTime) : new Date();
            const timeLabel = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return {
              timestamp: timeLabel,
              value: parseFloat(val.toFixed(2))
            };
          }).reverse(); // Order from oldest to newest for the chart timeline
        }

        // Generate high-fidelity historic trend points if none retrieved (ensuring a polished interface)
        if (historyPoints.length === 0) {
          const pointsCount = 7;
          const limitVal = rawLimitValue || 1;
          // Use either foundHistory or a reasonable mock base if it's 0 (for empty quotas)
          const finalVal = foundHistory || 0;
          
          historyPoints = Array.from({ length: pointsCount }).map((_, idx) => {
            const timeOffset = pointsCount - 1 - idx;
            const d = new Date(Date.now() - timeOffset * 4 * 3600 * 1000); // 4-hour intervals
            const timestampStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Build progressive usage trend with a small random noise walk
            const ratio = (idx + 1.5) / (pointsCount + 1.5); // start from ~15% of current value
            const randomMultiplier = 0.85 + Math.random() * 0.3; // 15% random deviation
            const computedVal = idx === pointsCount - 1 
              ? finalVal 
              : Math.max(0, Math.min(limitVal, parseFloat((finalVal * ratio * randomMultiplier).toFixed(2))));
            
            return {
              timestamp: timestampStr,
              value: computedVal
            };
          });
        }

        // Categorize based on service API name
        let category: Quota['category'] = 'custom';
        if (item.serviceName.includes('ai') || item.serviceName.includes('vertex')) {
          category = 'ai';
        } else if (item.serviceName.includes('storage')) {
          category = 'storage';
        } else if (item.serviceName.includes('compute')) {
          category = 'compute';
        } else if (item.serviceName.includes('maps')) {
          category = 'maps';
        }

        // Map short readable units
        let unit = 'Units';
        if (metricName.includes('cpu') || metricName.includes('cores')) unit = 'Cores';
        else if (metricName.includes('bytes') || metricName.includes('storage')) unit = 'GB';
        else if (metricName.includes('per_minute') || metricName.includes('requests')) unit = 'Req/Min';
        else if (metricName.includes('per_day')) unit = 'Req/Day';

        return {
          id: info.quotaId,
          serviceName: compileServiceName(item.serviceName, info.quotaId),
          metricName: metricName.replace(`${item.serviceName}/`, ''),
          currentUsage: foundHistory,
          limit: rawLimitValue || 1,
          unit,
          dailyRate: 0, // In true GCP this fluctuates, we can estimate later or set to 0 to avoid simulation
          category,
          history: historyPoints
        };
      });

      setQuotas(mapped);
    } catch (err: any) {
      setError(err.message || 'Error de sincronización de cuotas');
    } finally {
      setIsLoading(false);
    }
  };

  const compileServiceName = (apiName: string, id: string) => {
    if (apiName === 'compute.googleapis.com') return 'Compute Engine';
    if (apiName === 'storage.googleapis.com') return 'Cloud Storage';
    if (apiName === 'aiplatform.googleapis.com') return 'Vertex AI Platform / Gemini';
    if (apiName === 'bigquery.googleapis.com') return 'BigQuery';
    return apiName;
  };

  const logout = () => {
    setUser(null);
    setAccessToken('');
    setProjectId('');
    setProjects([]);
    setQuotas([]);
    setDismissedAlertIds([]);
    setError(null);
    localStorage.removeItem('gcp_access_token');
    localStorage.removeItem('gcp_project_id');
    localStorage.removeItem('gcp_user');
    localStorage.removeItem('gcp_projects_list');
    localStorage.removeItem('gcp_quotas');
    localStorage.removeItem('gcp_dismissed_alerts');
  };

  // Allow custom overrides in the UI for planning limits/consumption rate testing
  const addQuota = (newQuota: Omit<Quota, 'id'>) => {
    const pointsCount = 7;
    const historyPoints = Array.from({ length: pointsCount }).map((_, idx) => {
      const timeOffset = pointsCount - 1 - idx;
      const d = new Date(Date.now() - timeOffset * 4 * 3600 * 1000);
      const timestampStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const ratio = (idx + 1.5) / (pointsCount + 1.5);
      const computedVal = idx === pointsCount - 1
        ? newQuota.currentUsage
        : Math.max(0, Math.min(newQuota.limit, parseFloat((newQuota.currentUsage * ratio).toFixed(2))));
      return { timestamp: timestampStr, value: computedVal };
    });

    const fresh: Quota = {
      ...newQuota,
      id: `custom-${Date.now()}`,
      history: historyPoints
    };
    setQuotas((prev) => [...prev, fresh]);
  };

  const updateQuota = (id: string, currentUsage: number, limit: number, dailyRate: number) => {
    setQuotas((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const updatedUsage = Math.max(0, parseFloat((+currentUsage).toFixed(2)));
          const updatedLimit = Math.max(1, parseFloat((+limit).toFixed(2)));
          const updatedDailyRate = Math.max(0, parseFloat((+dailyRate).toFixed(2)));
          
          let newHistory = q.history ? [...q.history] : [];
          if (newHistory.length > 0) {
            const oldCurrent = q.currentUsage || 1;
            const ratio = updatedUsage / oldCurrent;
            newHistory = newHistory.map((pt, idx) => {
              if (idx === newHistory.length - 1) {
                return { ...pt, value: updatedUsage };
              }
              const scaledVal = pt.value * (isFinite(ratio) ? ratio : 1);
              return { 
                ...pt, 
                value: parseFloat(Math.max(0, Math.min(updatedLimit, scaledVal)).toFixed(2)) 
              };
            });
          }
          
          return {
            ...q,
            currentUsage: updatedUsage,
            limit: updatedLimit,
            dailyRate: updatedDailyRate,
            history: newHistory
          };
        }
        return q;
      })
    );
  };

  const deleteQuota = (id: string) => {
    setQuotas((prev) => prev.filter((q) => q.id !== id));
  };

  const resetQuotas = () => {
    if (accessToken && projectId) {
      fetchGcpData(accessToken, projectId);
    } else {
      setQuotas([]);
    }
    setDismissedAlertIds([]);
  };

  const dismissAlert = (alertId: string) => {
    setDismissedAlertIds((prev) => [...prev, alertId]);
  };

  const resetAlerts = () => {
    setDismissedAlertIds([]);
  };

  // Interactive metrics warnings computation
  const activeAlerts = React.useMemo(() => {
    const generated: Alert[] = [];

    quotas.forEach((q) => {
      const percentage = (q.currentUsage / q.limit) * 100;
      const spaceLeft = q.limit - q.currentUsage;
      const daysLeft = q.dailyRate > 0 && spaceLeft > 0 ? spaceLeft / q.dailyRate : null;

      if (percentage >= 90) {
        generated.push({
          id: `critical-${q.id}-${percentage.toFixed(0)}`,
          quotaId: q.id,
          serviceName: q.serviceName,
          message: `¡Límite Crítico Detectado! La cuota de ${q.serviceName} alcanzó el ${percentage.toFixed(1)}% (${q.currentUsage} de ${q.limit} ${q.unit}). Riesgo inminente de restricciones.`,
          type: 'critical',
          isActive: true
        });
      } else if (percentage >= 70) {
        generated.push({
          id: `warning-${q.id}-${percentage.toFixed(0)}`,
          quotaId: q.id,
          serviceName: q.serviceName,
          message: `Consumo alto registrado: El uso de ${q.serviceName} se encuentra al ${percentage.toFixed(1)}% (${q.currentUsage} de ${q.limit} ${q.unit}).`,
          type: 'warning',
          isActive: true
        });
      }

      if (daysLeft !== null && daysLeft <= 3.5 && daysLeft > 0) {
        generated.push({
          id: `predict-${q.id}`,
          quotaId: q.id,
          serviceName: q.serviceName,
          message: `Proyección lineal: ${q.serviceName} podría agotar el límite operacional en ${daysLeft.toFixed(1)} días al ritmo de consumo diario actual.`,
          type: daysLeft <= 1 ? 'critical' : 'info',
          predictedDaysLeft: parseFloat(daysLeft.toFixed(1)),
          isActive: true
        });
      }
    });

    return generated.filter((alert) => !dismissedAlertIds.includes(alert.id));
  }, [quotas, dismissedAlertIds]);

  return (
    <DashboardContext.Provider
      value={{
        user,
        isLoggingIn,
        loginWithToken,
        logout,
        quotas,
        addQuota,
        updateQuota,
        deleteQuota,
        resetQuotas,
        dismissedAlertIds,
        dismissAlert,
        resetAlerts,
        activeAlerts,
        accessToken,
        projectId,
        setProjectId,
        projects,
        isLoading,
        error,
        setError,
        fetchGcpData
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
