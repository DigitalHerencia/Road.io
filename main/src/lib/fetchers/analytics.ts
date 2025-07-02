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

export interface FuelCost {
  totalFuelCost: number;
}

export interface TotalCostOfOwnership {
  loadCost: number;
  fuelCost: number;
  totalCost: number;
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

export interface LoadRevenue {
  id: number;
  loadNumber: string;
  revenue: number;
}

export interface SeasonalRevenue {
  period: string;
  totalRevenue: number;
}

const MAX_CAPACITY_PER_VEHICLE = 40000; // pounds

function calcRate(total: number, used: number): number {
  return total === 0 ? 0 : Number((used / total).toFixed(2));
}

function calcCostPerMile(totalCost: number, totalMiles: number): number {
  return totalMiles === 0 ? 0 : Number((totalCost / totalMiles).toFixed(2));
}

function calcTotalCostOfOwnership(loadCost: number, fuelCost: number): number {
  return loadCost + fuelCost;
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

export async function fetchFuelCost(orgId: number): Promise<FuelCost> {
  await requirePermission('org:admin:access_all_reports');

  const res = await db.execute<{ total: number }>(sql`
    SELECT coalesce(sum(total_cost),0)::int AS total
    FROM fuel_purchases
    WHERE org_id = ${orgId}
  `);

  return {
    totalFuelCost: res.rows[0]?.total ?? 0,
  };
}

export async function fetchTotalCostOfOwnership(orgId: number): Promise<TotalCostOfOwnership> {
  await requirePermission('org:admin:access_all_reports');

  const [loadRes, fuelCostData] = await Promise.all([
    db.execute<{ total: number }>(sql`
      SELECT coalesce(sum(rate),0)::int AS total
      FROM loads
      WHERE org_id = ${orgId}
    `),
    fetchFuelCost(orgId),
  ]);

  const loadCost = loadRes.rows[0]?.total ?? 0;
  const fuelCost = fuelCostData.totalFuelCost;

  return {
    loadCost,
    fuelCost,
    totalCost: calcTotalCostOfOwnership(loadCost, fuelCost),
  };
}

export async function fetchDriverProfitability(
  orgId: number,
): Promise<DriverProfit[]> {
  await requirePermission('org:admin:access_all_reports');

  const result = await db.execute<{
    driver_id: number;
    driver_name: string | null;
    revenue: number | null;
    fuel_cost: number | null;
  }>(sql`
    WITH revenue AS (
      SELECT assigned_driver_id AS driver_id, SUM(rate)::int AS revenue
      FROM loads
      WHERE org_id = ${orgId} AND status = 'delivered'
      GROUP BY assigned_driver_id
    ), fuel AS (
      SELECT driver_id, SUM(total_cost)::int AS fuel_cost
      FROM fuel_purchases
      WHERE org_id = ${orgId}
      GROUP BY driver_id
    )
    SELECT
      d.id AS driver_id,
      u.name AS driver_name,
      COALESCE(r.revenue, 0) AS revenue,
      COALESCE(f.fuel_cost, 0) AS fuel_cost
    FROM drivers d
    INNER JOIN users u ON d.user_id = u.id
    LEFT JOIN revenue r ON r.driver_id = d.id
    LEFT JOIN fuel f ON f.driver_id = d.id
    WHERE u.org_id = ${orgId}
    ORDER BY u.name
  `);

  return result.rows.map(r => ({
    driverId: r.driver_id,
    driverName: r.driver_name,
    revenue: r.revenue ?? 0,
    fuelCost: r.fuel_cost ?? 0,
    profit: (r.revenue ?? 0) - (r.fuel_cost ?? 0),
  }));
}

export async function fetchGrossMarginByLoad(
  orgId: number,
): Promise<LoadMargin[]> {
  await requirePermission('org:admin:access_all_reports');

  const result = await db.execute<{
    load_id: number;
    load_number: string;
    revenue: number;
    fuel_cost: number;
  }>(sql`
    WITH fuel_costs AS (
      SELECT
        fp.driver_id,
        SUM(fp.total_cost) AS total_fuel_cost
      FROM fuel_purchases fp
      WHERE fp.org_id = ${orgId}
      GROUP BY fp.driver_id
    )
    SELECT
      l.id AS load_id,
      l.load_number,
      coalesce(l.rate, 0)::int AS revenue,
      COALESCE(fc.total_fuel_cost, 0)::int AS fuel_cost
    FROM loads l
    LEFT JOIN fuel_costs fc
      ON fc.driver_id = l.assigned_driver_id
    WHERE l.org_id = ${orgId} AND l.status = 'delivered'
    ORDER BY l.updated_at DESC
  `);

  return result.rows.map(r => ({
    id: r.load_id,
    loadNumber: r.load_number,
    revenue: r.revenue,
    fuelCost: r.fuel_cost,
    grossMargin: r.revenue - r.fuel_cost,
  }));
}

export async function fetchLoadRevenue(orgId: number): Promise<LoadRevenue[]> {
  await requirePermission('org:admin:access_all_reports');

  const result = await db.execute<{ id: number; load_number: string; revenue: number }>(sql`
    SELECT id, load_number, coalesce(rate, 0)::int AS revenue
    FROM loads
    WHERE org_id = ${orgId} AND status = 'delivered'
    ORDER BY updated_at DESC
  `);

  return result.rows.map(r => ({
    id: r.id,
    loadNumber: r.load_number,
    revenue: r.revenue ?? 0,
  }));
}

export async function fetchSeasonalRevenue(
  orgId: number,
): Promise<SeasonalRevenue[]> {
  await requirePermission('org:admin:access_all_reports');

  const result = await db.execute<{ period: string; total: number }>(sql`
    SELECT to_char(date_trunc('month', updated_at), 'YYYY-MM') AS period,
      SUM(rate)::int AS total
    FROM loads
    WHERE org_id = ${orgId} AND status = 'delivered'
    GROUP BY 1
    ORDER BY 1
  `);

  return result.rows.map(r => ({
    period: r.period,
    totalRevenue: r.total ?? 0,
  }));
}

export {
  calcRate as calculateUtilizationRate,
  calcRate as calculateOnTimeRate,
  calcCostPerMile,
  calcTotalCostOfOwnership,
};