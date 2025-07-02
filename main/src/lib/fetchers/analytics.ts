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

export interface OnTimeDelivery {
  totalDelivered: number;
  onTimeDeliveries: number;
  onTimeRate: number;
}

export interface CostPerMile {
  totalCost: number;
  totalMiles: number;
  costPerMile: number;
}

export interface LiveFleetStatus {
  activeLoads: number;
  availableDrivers: number;
  activeVehicles: number;
}

export interface PerformanceAlert {
  level: 'info' | 'warning' | 'critical';
  message: string;
}

export interface LoadMargin {
  id: number;
  loadNumber: string;
  revenue: number;
  fuelCost: number;
  grossMargin: number;
}

export interface DriverProfit {
  driverId: number;
  driverName: string | null;
  revenue: number;
  fuelCost: number;
  profit: number;
}

const MAX_CAPACITY_PER_VEHICLE = 40000; // pounds

function calcRate(total: number, used: number): number {
  return total === 0 ? 0 : Number((used / total).toFixed(2));
}

function calcCostPerMile(totalCost: number, totalMiles: number): number {
  return totalMiles === 0 ? 0 : Number((totalCost / totalMiles).toFixed(2));
}

export async function fetchLiveFleetStatus(orgId: number): Promise<LiveFleetStatus> {
  await requirePermission('org:admin:access_all_reports');

  const activeLoadsRes = await db.execute<{ count: number }>(sql`
    SELECT count(*)::int AS count
    FROM loads
    WHERE org_id = ${orgId} AND status NOT IN ('delivered', 'cancelled')
  `);
  const availableDriversRes = await db.execute<{ count: number }>(sql`
    SELECT count(*)::int AS count
    FROM drivers d
    INNER JOIN users u ON d.user_id = u.id
    WHERE d.is_available = true AND u.org_id = ${orgId}
  `);
  const activeVehiclesRes = await db.execute<{ count: number }>(sql`
    SELECT count(*)::int AS count
    FROM vehicles
    WHERE org_id = ${orgId} AND status != 'RETIRED'
  `);

  return {
    activeLoads: activeLoadsRes.rows[0]?.count ?? 0,
    availableDrivers: availableDriversRes.rows[0]?.count ?? 0,
    activeVehicles: activeVehiclesRes.rows[0]?.count ?? 0,
  };
}

export async function fetchPerformanceAlerts(orgId: number): Promise<PerformanceAlert[]> {
  await requirePermission('org:admin:access_all_reports');

  const status = await fetchLiveFleetStatus(orgId);
  const alerts: PerformanceAlert[] = [];

  if (status.activeLoads > status.activeVehicles) {
    alerts.push({
      level: 'warning',
      message: 'More active loads than available vehicles',
    });
  }

  if (status.activeLoads > status.availableDrivers) {
    alerts.push({
      level: status.availableDrivers === 0 ? 'critical' : 'warning',
      message: 'Insufficient drivers for current loads',
    });
  }

  return alerts;
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

export async function fetchOnTimeDeliveryRate(orgId: number) {
  await requirePermission('org:admin:access_all_reports');

  const result = await db.execute<{ total_delivered: number; on_time: number }>(
    sql`
      SELECT
        count(*) FILTER (WHERE status = 'delivered')::int AS total_delivered,
        count(*) FILTER (
          WHERE status = 'delivered'
            AND updated_at <= (delivery_location->>'datetime')::timestamp
        )::int AS on_time
      FROM loads
      WHERE org_id = ${orgId}
    `
  );

  const totalDelivered = result.rows[0]?.total_delivered ?? 0;
  const onTime = result.rows[0]?.on_time ?? 0;

  return {
    totalDelivered,
    onTimeDeliveries: onTime,
    onTimeRate: calcRate(totalDelivered, onTime),
  } satisfies OnTimeDelivery;
}

export async function fetchCostPerMile(orgId: number) {
  await requirePermission('org:admin:access_all_reports');

  const result = await db.execute<{ total_cost: number; total_miles: number }>(
    sql`
      SELECT
        coalesce(sum(rate),0)::int AS total_cost,
        coalesce(sum(distance),0)::int AS total_miles
      FROM loads
      WHERE org_id = ${orgId} AND status = 'delivered'
    `
  );

  const totalCost = result.rows[0]?.total_cost ?? 0;
  const totalMiles = result.rows[0]?.total_miles ?? 0;

  return {
    totalCost,
    totalMiles,
    costPerMile: calcCostPerMile(totalCost, totalMiles),
  } satisfies CostPerMile;
}

export async function fetchDriverProfitability(orgId: number): Promise<DriverProfit[]> {
  await requirePermission('org:admin:access_all_reports');

  const res = await db.execute<{
    driver_id: number;
    name: string | null;
    revenue: number;
    fuel_cost: number;
  }>(sql`
    SELECT
      d.id AS driver_id,
      u.name,
      coalesce(sum(l.rate),0)::int AS revenue,
      coalesce(sum(fp.total_cost),0)::int AS fuel_cost
    FROM drivers d
    INNER JOIN users u ON d.user_id = u.id
    LEFT JOIN loads l ON l.assigned_driver_id = d.id AND l.status = 'delivered'
    LEFT JOIN fuel_purchases fp ON fp.driver_id = d.id
    WHERE u.org_id = ${orgId}
    GROUP BY d.id, u.name
  `);

  return res.rows.map(row => ({
    driverId: row.driver_id,
    driverName: row.name,
    revenue: row.revenue,
    fuelCost: row.fuel_cost,
    profit: row.revenue - row.fuel_cost,
  }));
}

export async function fetchGrossMarginByLoad(orgId: number): Promise<LoadMargin[]> {
  await requirePermission('org:admin:access_all_reports');

  const loadsRes = await db.execute<{
    id: number;
    load_number: string;
    assigned_driver_id: number;
    distance: number;
    rate: number;
  }>(sql`
    SELECT id, load_number, assigned_driver_id, distance, rate
    FROM loads
    WHERE org_id = ${orgId} AND status = 'delivered'
  `);

  const fuelRes = await db.execute<{ driver_id: number; total_cost: number }>(sql`
    SELECT driver_id, coalesce(sum(total_cost),0)::int AS total_cost
    FROM fuel_purchases
    WHERE org_id = ${orgId}
    GROUP BY driver_id
  `);

  const distanceRes = await db.execute<{ driver_id: number; total_distance: number }>(sql`
    SELECT assigned_driver_id AS driver_id, coalesce(sum(distance),0)::int AS total_distance
    FROM loads
    WHERE org_id = ${orgId} AND status = 'delivered'
    GROUP BY assigned_driver_id
  `);

  const fuelByDriver = fuelRes.rows.reduce<Record<number, number>>((acc, r) => {
    acc[r.driver_id] = r.total_cost;
    return acc;
  }, {});
  const distByDriver = distanceRes.rows.reduce<Record<number, number>>((acc, r) => {
    acc[r.driver_id] = r.total_distance;
    return acc;
  }, {});

  return loadsRes.rows.map(l => {
    const totalFuel = fuelByDriver[l.assigned_driver_id] ?? 0;
    const totalDist = distByDriver[l.assigned_driver_id] ?? 0;
    const costPerMile = totalDist === 0 ? 0 : totalFuel / totalDist;
    const fuelCost = Math.round(costPerMile * l.distance);
    return {
      id: l.id,
      loadNumber: l.load_number,
      revenue: l.rate,
      fuelCost,
      grossMargin: l.rate - fuelCost,
    } satisfies LoadMargin;
  });
}

export {
  calcRate as calculateUtilizationRate,
  calcRate as calculateOnTimeRate,
  calcCostPerMile,
};
