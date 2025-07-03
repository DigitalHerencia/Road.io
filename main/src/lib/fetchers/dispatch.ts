
import { db } from '@/lib/db'
import { sql, eq } from 'drizzle-orm'
import { requirePermission, requireAnyPermission } from '@/lib/rbac'
import { drivers, users } from '@/lib/schema'
import type { DispatchMessage, CustomerNotification } from '@/lib/schema'
import { getCache, setCache } from '../cache'

export const EARTH_RADIUS_MILES = 3958.8


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
  const cacheKey = `dispatch:loadCompletion:${orgId}`
  const cached = getCache<LoadCompletionMetrics>(cacheKey)
  if (cached) return cached
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
  const result = {
    totalLoads: row.total,
    completedLoads: row.completed,
    onTimeDeliveries: row.on_time,
    onTimeRate:
      row.total === 0 ? 0 : Number((row.on_time / row.total).toFixed(2)),
  }
  setCache(cacheKey, result)
  return result
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
  const cacheKey = `dispatch:driverProductivity:${orgId}`
  const cached = getCache<DriverProductivity[]>(cacheKey)
  if (cached) return cached
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
  const result = res.rows.map((r) => ({
    driverId: r.driver_id,
    driverName: r.driver_name,
    completedLoads: r.completed,
  }))
  setCache(cacheKey, result)
  return result
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
  const cacheKey = `dispatch:exceptionRate:${orgId}`
  const cached = getCache<ExceptionRate>(cacheKey)
  if (cached) return cached
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
  const result = {
    totalLoads: row.total,
    exceptionLoads: row.exceptions,
    exceptionRate:
      row.total === 0 ? 0 : Number((row.exceptions / row.total).toFixed(2)),
  }
  setCache(cacheKey, result)
  return result
}

export interface DispatchKPIs {
  activeLoads: number;
  completedLoads: number;
  onTimeRate: number;
  exceptionRate: number;
}

export async function fetchDispatchKPIs(orgId: number): Promise<DispatchKPIs> {
  await requirePermission("org:admin:access_all_reports");
  const cacheKey = `dispatch:kpis:${orgId}`
  const cached = getCache<DispatchKPIs>(cacheKey)
  if (cached) return cached
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
  const result = {
    activeLoads: active,
    completedLoads: completion.completedLoads,
    onTimeRate: completion.onTimeRate,
    exceptionRate: exceptions.exceptionRate,
  };
  setCache(cacheKey, result)
  return result
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
  const R = EARTH_RADIUS_MILES;
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

export interface DriverLocation {
  driverId: number
  lat: number
  lng: number
  address: string | null
}

export async function fetchDriverLocations(orgId: number): Promise<DriverLocation[]> {
  await requirePermission('org:dispatcher:view')
  const res = await db.execute<{
    driver_id: number
    current_location: {
      lat: number
      lng: number
      address?: string | null
    }
  }>(sql`
    SELECT d.id AS driver_id, d.current_location
    FROM drivers d
    INNER JOIN users u ON d.user_id = u.id
    WHERE u.org_id = ${orgId} AND d.current_location IS NOT NULL
  `)
  return res.rows.map(r => ({
    driverId: r.driver_id,
    lat: r.current_location.lat,
    lng: r.current_location.lng,
    address: r.current_location.address ?? null,
  }))
}

export function isWithinGeofence(location: Coordinate, fence: Geofence): boolean {
  return haversineDistance(location, fence.center) <= fence.radius
}

export async function fetchDriverMessages(orgId: number, driverId: number) {
  await requireAnyPermission([
    'org:dispatcher:communicate',
    'org:driver:view_assigned_loads',
  ])
  const res = await db.execute(sql`
    SELECT * FROM dispatch_messages
    WHERE org_id = ${orgId} AND driver_id = ${driverId}
    ORDER BY created_at DESC
  `)
  return res.rows as unknown as DispatchMessage[]
}

export async function fetchCustomerNotifications(orgId: number, loadId: number) {
  await requirePermission('org:dispatcher:communicate')
  const res = await db.execute(sql`
    SELECT * FROM customer_notifications
    WHERE org_id = ${orgId} AND load_id = ${loadId}
    ORDER BY created_at DESC
  `)
  return res.rows as unknown as CustomerNotification[]
}

