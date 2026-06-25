export interface QuotaHistoryPoint {
  timestamp: string;
  value: number;
}

export interface Quota {
  id: string;
  serviceName: string;
  metricName: string;
  currentUsage: number;
  limit: number;
  unit: string;
  dailyRate: number; // For alert predictions, e.g. how much usage increases per day
  category: 'ai' | 'storage' | 'compute' | 'maps' | 'custom';
  history?: QuotaHistoryPoint[];
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  projectId: string;
}

export interface Alert {
  id: string;
  quotaId: string;
  serviceName: string;
  message: string;
  type: 'warning' | 'critical' | 'info';
  predictedDaysLeft?: number;
  isActive: boolean;
}
