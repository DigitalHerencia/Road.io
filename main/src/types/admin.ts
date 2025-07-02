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
