import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/rbac';

export interface VehicleUtilization {
  totalVehicles: number;
  activeVehicles: number;
  utilizationRate: number;
}

export interface CapacityUtilization {
  totalCapacity: number;
  usedCapacity: number;
  utilizationRate: number;
}

const MAX_CAPACITY_PER_VEHICLE = 40000; // pounds

function calcRate(total: number, used: number): number {
  return total === 0 ? 0 : Number((used / total).toFixed(2));
}

export async function fetchVehicleUtilization(orgId: number) {
  await requirePermission('org:admin:access_all_reports');

  const totalRes = await db.execute<{ count: number }>(sql`
    SELECT count(*)::int AS count FROM vehicles WHERE org_id = ${orgId}
  `);
  const activeRes = await db.execute<{ count: number }>(sql`
    SELECT count(DISTINCT assigned_vehicle_id)::int AS count
    FROM loads
    WHERE org_id = ${orgId}
      AND status NOT IN ('delivered', 'cancelled')
      AND assigned_vehicle_id IS NOT NULL
  `);

  const totalVehicles = totalRes.rows[0]?.count ?? 0;
  const activeVehicles = activeRes.rows[0]?.count ?? 0;

  return {
    totalVehicles,
    activeVehicles,
    utilizationRate: calcRate(totalVehicles, activeVehicles),
  } satisfies VehicleUtilization;
}

export async function fetchCapacityUtilization(orgId: number) {
  await requirePermission('org:admin:access_all_reports');

  const totalRes = await db.execute<{ count: number }>(sql`
    SELECT count(*)::int AS count FROM vehicles WHERE org_id = ${orgId}
  `);
  const usedRes = await db.execute<{ sum: number }>(sql`
    SELECT coalesce(sum(weight),0)::int AS sum
    FROM loads
    WHERE org_id = ${orgId}
      AND status NOT IN ('delivered', 'cancelled')
      AND assigned_vehicle_id IS NOT NULL
  `);

  const totalVehicles = totalRes.rows[0]?.count ?? 0;
  const usedCapacity = usedRes.rows[0]?.sum ?? 0;
  const totalCapacity = totalVehicles * MAX_CAPACITY_PER_VEHICLE;

  return {
    totalCapacity,
    usedCapacity,
    utilizationRate: calcRate(totalCapacity, usedCapacity),
  } satisfies CapacityUtilization;
}

export { calcRate as calculateUtilizationRate };
