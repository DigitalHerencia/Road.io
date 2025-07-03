export interface TenantConfig {
  dataRetentionDays?: number;
  resourceLimit?: number;
  notes?: string;
}

export interface ResourceAllocation {
  users: number;
  drivers: number;
  vehicles: number;
  loads: number;
}

export interface TenantMetrics {
  totalUsers: number;
  activeUsers: number;
  maxUsers: number;
  subscriptionStatus: string;
  subscriptionPlan: string;
  crossOrgLoadAssignments: number;
}

export interface ApplicationSettings {
  featureToggles?: Record<string, boolean>;
  maintenanceMode?: boolean;
  rateLimit?: number;
  sessionTimeout?: number;
  securityPolicies?: Record<string, unknown>;
}

export interface IntegrationConfig {
  service: string;
  apiKey?: string;
  webhookUrl?: string;
  enabled: boolean;
}

export interface IntegrationStatus {
  service: string;
  status: 'ok' | 'error' | 'disabled';
  lastChecked: Date;
}
