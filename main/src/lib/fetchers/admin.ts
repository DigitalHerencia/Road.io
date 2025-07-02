import { sql, eq } from "drizzle-orm";
import { db } from "../db";
import { organizations } from "../schema";
import type {
  TenantConfig,
  ResourceAllocation,
  TenantMetrics,
} from "@/types/admin";

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
  const [userCount] = await db.execute<{ count: number }>(
    sql`SELECT count(*)::int AS count FROM users WHERE org_id = ${orgId}`,
  );
  const [activeCount] = await db.execute<{ count: number }>(
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
