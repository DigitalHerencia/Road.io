import { db } from "@/lib/db";
import { sql, eq } from "drizzle-orm";
import { drivers } from "@/lib/schema";
import { requirePermission } from "@/lib/rbac";

export interface LoadCompletionMetrics {
  totalLoads: number;
  completedLoads: number;
  onTimeDeliveries: number;
  onTimeRate: number;
}

export async function fetchLoadCompletionMetrics(
  orgId: number,
): Promise<LoadCompletionMetrics> {
  await requirePermission("org:admin:access_all_reports");
  const res = await db.execute<{
    total: number;
    completed: number;
    on_time: number;
  }>(sql`
    SELECT
      count(*)::int AS total,
      count(*) FILTER (WHERE status = 'delivered')::int AS completed,
      count(*) FILTER (
        WHERE status = 'delivered'
          AND updated_at <= (delivery_location->>'datetime')::timestamp
      )::int AS on_time
    FROM loads
    WHERE org_id = ${orgId}
  `);
  const row = res.rows[0] ?? { total: 0, completed: 0, on_time: 0 };
  return {
    totalLoads: row.total,
    completedLoads: row.completed,
    onTimeDeliveries: row.on_time,
    onTimeRate:
      row.total === 0 ? 0 : Number((row.on_time / row.total).toFixed(2)),
  };
}

export interface DriverProductivity {
  driverId: number;
  driverName: string | null;
  completedLoads: number;
}

export async function fetchDriverProductivity(
  orgId: number,
): Promise<DriverProductivity[]> {
  await requirePermission("org:admin:access_all_reports");
  const res = await db.execute<{
    driver_id: number;
    driver_name: string | null;
    completed: number;
  }>(sql`
    SELECT
      d.id AS driver_id,
      u.name AS driver_name,
      count(l.id)::int AS completed
    FROM drivers d
    INNER JOIN users u ON d.user_id = u.id
    LEFT JOIN loads l ON l.assigned_driver_id = d.id AND l.status = 'delivered'
    WHERE u.org_id = ${orgId}
    GROUP BY d.id, u.name
    ORDER BY completed DESC
  `);
  return res.rows.map((r) => ({
    driverId: r.driver_id,
    driverName: r.driver_name,
    completedLoads: r.completed,
  }));
}

export interface ExceptionRate {
  totalLoads: number;
  exceptionLoads: number;
  exceptionRate: number;
}

export async function fetchExceptionRate(
  orgId: number,
): Promise<ExceptionRate> {
  await requirePermission("org:admin:access_all_reports");
  const res = await db.execute<{ total: number; exceptions: number }>(sql`
    SELECT
      count(*)::int AS total,
      count(*) FILTER (
        WHERE status = 'cancelled'
          OR (status = 'delivered' AND updated_at > (delivery_location->>'datetime')::timestamp)
      )::int AS exceptions
    FROM loads
    WHERE org_id = ${orgId}
  `);
  const row = res.rows[0] ?? { total: 0, exceptions: 0 };
  return {
    totalLoads: row.total,
    exceptionLoads: row.exceptions,
    exceptionRate:
      row.total === 0 ? 0 : Number((row.exceptions / row.total).toFixed(2)),
  };
}

export interface DispatchKPIs {
  activeLoads: number;
  completedLoads: number;
  onTimeRate: number;
  exceptionRate: number;
}

export async function fetchDispatchKPIs(orgId: number): Promise<DispatchKPIs> {
  await requirePermission("org:admin:access_all_reports");
  const [activeRes, completion, exceptions] = await Promise.all([
    db.execute<{ count: number }>(sql`
      SELECT count(*)::int AS count
      FROM loads
      WHERE org_id = ${orgId} AND status NOT IN ('delivered','cancelled')
    `),
    fetchLoadCompletionMetrics(orgId),
    fetchExceptionRate(orgId),
  ]);
  const active = activeRes.rows[0]?.count ?? 0;
  return {
    activeLoads: active,
    completedLoads: completion.completedLoads,
    onTimeRate: completion.onTimeRate,
    exceptionRate: exceptions.exceptionRate,
  };
}

export interface Coordinate {
  lat: number;
  lng: number;
  address?: string | null;
}

export interface Geofence {
  center: Coordinate;
  radius: number; // miles
}

export interface OptimizedRoute {
  orderedStops: Coordinate[];
  totalDistance: number;
}

function toRad(v: number) {
  return (v * Math.PI) / 180;
}

export function haversineDistance(a: Coordinate, b: Coordinate): number {
  const R = 3958.8; // miles
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export async function calculateOptimalRoute(
  start: Coordinate,
  end: Coordinate,
  stops: Coordinate[] = [],
): Promise<OptimizedRoute> {
  const remaining = [...stops];
  const ordered: Coordinate[] = [];
  let current = start;
  let distance = 0;
  while (remaining.length) {
    let idx = 0;
    let best = haversineDistance(current, remaining[0]);
    for (let i = 1; i < remaining.length; i++) {
      const d = haversineDistance(current, remaining[i]);
      if (d < best) {
        best = d;
        idx = i;
      }
    }
    const next = remaining.splice(idx, 1)[0];
    ordered.push(next);
    distance += best;
    current = next;
  }
  distance += haversineDistance(current, end);
  return { orderedStops: ordered, totalDistance: distance };
}

export async function updateDriverLocation(
  driverId: number,
  location: Coordinate,
) {
  await db
    .update(drivers)
    .set({ currentLocation: location, updatedAt: new Date() })
    .where(eq(drivers.id, driverId));
}

export function isWithinGeofence(
  location: Coordinate,
  fence: Geofence,
): boolean {
  return haversineDistance(location, fence.center) <= fence.radius;
}
