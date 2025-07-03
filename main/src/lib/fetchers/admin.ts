import { sql, eq } from "drizzle-orm";
import { db } from "../db";
import { organizations } from "../schema";
import type {
  TenantConfig,
  ResourceAllocation,
  TenantMetrics,
  ApplicationSettings,
  IntegrationConfig,
  IntegrationStatus,
} from "@/features/admin/types";

export async function checkTenantIsolation(orgId: number) {
  const result = await db.execute<{ count: number }>(sql`
    SELECT count(*)::int AS count
    FROM loads l
    JOIN vehicles v ON l.assigned_vehicle_id = v.id
    WHERE l.org_id = ${orgId} AND v.org_id <> ${orgId}
  `);
  return { crossOrgLoadAssignments: result.rows[0]?.count ?? 0 };
}

export async function getTenantConfig(
  orgId: number,
): Promise<TenantConfig | null> {
  const [org] = await db
    .select({ settings: organizations.settings })
    .from(organizations)
    .where(eq(organizations.id, orgId));

  const settings = org?.settings as Record<string, unknown> | undefined;
  return (settings?.tenantConfig as TenantConfig) ?? null;
}

export async function getResourceAllocation(
  orgId: number,
): Promise<ResourceAllocation> {
  const userRes = await db.execute<{ count: number }>(
    sql`SELECT count(*)::int AS count FROM users WHERE org_id = ${orgId}`,
  );
  const driverRes = await db.execute<{ count: number }>(
    sql`SELECT count(*)::int AS count FROM drivers d JOIN users u ON d.user_id = u.id WHERE u.org_id = ${orgId}`,
  );
  const vehicleRes = await db.execute<{ count: number }>(
    sql`SELECT count(*)::int AS count FROM vehicles WHERE org_id = ${orgId}`,
  );
  const loadRes = await db.execute<{ count: number }>(
    sql`SELECT count(*)::int AS count FROM loads WHERE org_id = ${orgId}`,
  );

  return {
    users: userRes.rows[0]?.count ?? 0,
    drivers: driverRes.rows[0]?.count ?? 0,
    vehicles: vehicleRes.rows[0]?.count ?? 0,
    loads: loadRes.rows[0]?.count ?? 0,
  };
}

export async function getTenantMetrics(orgId: number): Promise<TenantMetrics> {
  const userCount = await db.execute<{ count: number }>(
    sql`SELECT count(*)::int AS count FROM users WHERE org_id = ${orgId}`,
  );
  const activeCount = await db.execute<{ count: number }>(
    sql`SELECT count(*)::int AS count FROM users WHERE org_id = ${orgId} AND is_active = true`,
  );
  const [org] = await db
    .select({
      maxUsers: organizations.maxUsers,
      subscriptionStatus: organizations.subscriptionStatus,
      subscriptionPlan: organizations.subscriptionPlan,
    })
    .from(organizations)
    .where(eq(organizations.id, orgId));
  const iso = await checkTenantIsolation(orgId);

  return {
    totalUsers: userCount.rows[0]?.count ?? 0,
    activeUsers: activeCount.rows[0]?.count ?? 0,
    maxUsers: org?.maxUsers ?? 0,
    subscriptionStatus: org?.subscriptionStatus ?? "trialing",
    subscriptionPlan: org?.subscriptionPlan ?? "basic",
    crossOrgLoadAssignments: iso.crossOrgLoadAssignments,
  };
}

export interface SystemMetrics {
  uptime: number;
  load: number;
  totalMem: number;
  freeMem: number;
  dbConnections: number;
}

export interface RecentAuditLog extends Record<string, unknown> {
  id: number;
  action: string;
  resource: string;
  userId: number | null;
  createdAt: Date;
}

export async function fetchSystemMetrics(): Promise<SystemMetrics> {
  const os = await import('os');
  const uptime = os.uptime();
  const [load] = os.loadavg();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  let dbConnections = 0;
  try {
    const res = await db.execute<{ count: number }>(
      sql`SELECT count(*)::int AS count FROM pg_stat_activity`,
    );
    dbConnections = res.rows[0]?.count ?? 0;
  } catch {
    dbConnections = 0;
  }

  return { uptime, load, totalMem, freeMem, dbConnections };
}

export async function fetchRecentAuditLogs(
  orgId: number,
  limit = 5,
): Promise<RecentAuditLog[]> {
  const res = await db.execute<RecentAuditLog>(sql`
    SELECT
      id,
      action,
      resource,
      user_id AS "userId",
      created_at AS "createdAt"
    FROM audit_logs
    WHERE org_id = ${orgId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `);
  return res.rows;
}

export async function getApplicationSettings(
  orgId: number,
): Promise<ApplicationSettings | null> {
  const [org] = await db
    .select({ settings: organizations.settings })
    .from(organizations)
    .where(eq(organizations.id, orgId));

  const settings = org?.settings as Record<string, unknown> | undefined;
  return (settings?.applicationSettings as ApplicationSettings) ?? null;
}

export async function getIntegrationConfigs(
  orgId: number,
): Promise<IntegrationConfig[]> {
  const [org] = await db
    .select({ settings: organizations.settings })
    .from(organizations)
    .where(eq(organizations.id, orgId));

  const settings = org?.settings as Record<string, unknown> | undefined;
  return (settings?.integrationConfigs as IntegrationConfig[]) ?? [];
}

export async function getIntegrationStatuses(
  orgId: number,
): Promise<IntegrationStatus[]> {
  const [org] = await db
    .select({ settings: organizations.settings })
    .from(organizations)
    .where(eq(organizations.id, orgId));

  const settings = org?.settings as Record<string, unknown> | undefined;
  return (settings?.integrationStatuses as IntegrationStatus[]) ?? [];
}
