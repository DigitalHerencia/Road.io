import { db } from '@/lib/db'
import { vehicles } from '@/lib/schema'
import { eq, sql } from 'drizzle-orm'

export async function getAllVehicles(orgId: number) {
  return db.select().from(vehicles).where(eq(vehicles.orgId, orgId))
}

export interface FleetOverview {
  total: number
  active: number
  maintenance: number
  retired: number
  maintenanceDue: number
  inspectionDue: number
}

export async function getFleetOverview(orgId: number): Promise<FleetOverview> {
  const totalRes = await db.execute<{ count: number }>(sql`
    SELECT count(*)::int AS count FROM vehicles WHERE org_id = ${orgId}
  `)
  const statusRes = await db.execute<{ status: string; count: number }>(sql`
    SELECT status, count(*)::int AS count FROM vehicles
    WHERE org_id = ${orgId}
    GROUP BY status
  `)
  const maintDueRes = await db.execute<{ count: number }>(sql`
    SELECT count(*)::int AS count FROM vehicles
    WHERE org_id = ${orgId} AND next_maintenance_date <= now()
  `)
  const inspDueRes = await db.execute<{ count: number }>(sql`
    SELECT count(*)::int AS count FROM vehicles
    WHERE org_id = ${orgId} AND next_inspection_date <= now()
  `)

  const statusCounts = statusRes.rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = r.count
    return acc
  }, {})

  return {
    total: totalRes.rows[0]?.count ?? 0,
    active: statusCounts.ACTIVE ?? 0,
    maintenance: statusCounts.MAINTENANCE ?? 0,
    retired: statusCounts.RETIRED ?? 0,
    maintenanceDue: maintDueRes.rows[0]?.count ?? 0,
    inspectionDue: inspDueRes.rows[0]?.count ?? 0,
  }
}

export async function getVehicleList(
  orgId: number,
  sort: keyof typeof vehicles | 'id' = 'id',
  status?: 'ACTIVE' | 'MAINTENANCE' | 'RETIRED'
) {
  let query = db.select().from(vehicles).where(eq(vehicles.orgId, orgId))
  if (status) {
    query = query.where(eq(vehicles.status, status))
  }
  const columnMap = {
    id: vehicles.id,
    make: vehicles.make,
    model: vehicles.model,
    year: vehicles.year,
    status: vehicles.status,
    vin: vehicles.vin,
  } as const
  const orderCol = columnMap[sort] ?? vehicles.id
  return query.orderBy(orderCol)
}

export async function getVehicleById(id: number) {
  const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id))
  return vehicle
}
