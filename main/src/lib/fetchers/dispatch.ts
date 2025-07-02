import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { requirePermission } from '@/lib/rbac'

export interface LoadCompletionMetrics {
  totalLoads: number
  completedLoads: number
  onTimeDeliveries: number
  onTimeRate: number
}

export async function fetchLoadCompletionMetrics(orgId: number): Promise<LoadCompletionMetrics> {
  await requirePermission('org:admin:access_all_reports')
  const res = await db.execute<{ total: number; completed: number; on_time: number }>(sql`
    SELECT
      count(*)::int AS total,
      count(*) FILTER (WHERE status = 'delivered')::int AS completed,
      count(*) FILTER (
        WHERE status = 'delivered'
          AND updated_at <= (delivery_location->>'datetime')::timestamp
      )::int AS on_time
    FROM loads
    WHERE org_id = ${orgId}
  `)
  const row = res.rows[0] ?? { total: 0, completed: 0, on_time: 0 }
  return {
    totalLoads: row.total,
    completedLoads: row.completed,
    onTimeDeliveries: row.on_time,
    onTimeRate: row.total === 0 ? 0 : Number((row.on_time / row.total).toFixed(2)),
  }
}

export interface DriverProductivity {
  driverId: number
  driverName: string | null
  completedLoads: number
}

export async function fetchDriverProductivity(orgId: number): Promise<DriverProductivity[]> {
  await requirePermission('org:admin:access_all_reports')
  const res = await db.execute<{
    driver_id: number
    driver_name: string | null
    completed: number
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
  `)
  return res.rows.map(r => ({
    driverId: r.driver_id,
    driverName: r.driver_name,
    completedLoads: r.completed,
  }))
}

export interface ExceptionRate {
  totalLoads: number
  exceptionLoads: number
  exceptionRate: number
}

export async function fetchExceptionRate(orgId: number): Promise<ExceptionRate> {
  await requirePermission('org:admin:access_all_reports')
  const res = await db.execute<{ total: number; exceptions: number }>(sql`
    SELECT
      count(*)::int AS total,
      count(*) FILTER (
        WHERE status = 'cancelled'
          OR (status = 'delivered' AND updated_at > (delivery_location->>'datetime')::timestamp)
      )::int AS exceptions
    FROM loads
    WHERE org_id = ${orgId}
  `)
  const row = res.rows[0] ?? { total: 0, exceptions: 0 }
  return {
    totalLoads: row.total,
    exceptionLoads: row.exceptions,
    exceptionRate: row.total === 0 ? 0 : Number((row.exceptions / row.total).toFixed(2)),
  }
}

export interface DispatchKPIs {
  activeLoads: number
  completedLoads: number
  onTimeRate: number
  exceptionRate: number
}

export async function fetchDispatchKPIs(orgId: number): Promise<DispatchKPIs> {
  await requirePermission('org:admin:access_all_reports')
  const [activeRes, completion, exceptions] = await Promise.all([
    db.execute<{ count: number }>(sql`
      SELECT count(*)::int AS count
      FROM loads
      WHERE org_id = ${orgId} AND status NOT IN ('delivered','cancelled')
    `),
    fetchLoadCompletionMetrics(orgId),
    fetchExceptionRate(orgId),
  ])
  const active = activeRes.rows[0]?.count ?? 0
  return {
    activeLoads: active,
    completedLoads: completion.completedLoads,
    onTimeRate: completion.onTimeRate,
    exceptionRate: exceptions.exceptionRate,
  }
}

