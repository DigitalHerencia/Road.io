import { db } from '@/lib/db'
import { vehicles } from '@/lib/schema'
import { eq, sql, and } from 'drizzle-orm'
import { cache } from 'react'

async function _getAllVehicles(orgId: number) {
  return db.select().from(vehicles).where(eq(vehicles.orgId, orgId))
}
export const getAllVehicles = cache(_getAllVehicles)

export interface FleetOverview {
  total: number
  active: number
  maintenance: number
  retired: number
  maintenanceDue: number
  inspectionDue: number
}

async function _getFleetOverview(orgId: number): Promise<FleetOverview> {
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
export const getFleetOverview = cache(_getFleetOverview)

async function _getVehicleList(
  orgId: number,
  sort: 'id' | 'make' | 'model' | 'year' | 'status' | 'vin' = 'id',
  status?: 'ACTIVE' | 'MAINTENANCE' | 'RETIRED'
) {
  const conditions = [eq(vehicles.orgId, orgId)];
  
  if (status) {
    conditions.push(eq(vehicles.status, status));
  }
  
  const columnMap = {
    id: vehicles.id,
    make: vehicles.make,
    model: vehicles.model,
    year: vehicles.year,
    status: vehicles.status,
    vin: vehicles.vin,
  } as const;
  
  const orderCol = columnMap[sort as keyof typeof columnMap] ?? vehicles.id;
  
  return db
    .select()
    .from(vehicles)
    .where(conditions.length > 1 ? and(...conditions) : conditions[0])
    .orderBy(orderCol);
}
export const getVehicleList = cache(_getVehicleList)

async function _getVehicleById(id: number) {
  const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id))
  return vehicle
}
export const getVehicleById = cache(_getVehicleById)

export interface VehicleAvailability {
  id: number
  make: string | null
  model: string | null
  status: 'ACTIVE' | 'MAINTENANCE' | 'RETIRED'
  isAssigned: boolean
  nextMaintenanceDate: Date | null
}

async function _getVehicleAvailability(orgId: number): Promise<VehicleAvailability[]> {
  const res = await db.execute<{
    id: number
    make: string | null
    model: string | null
    status: 'ACTIVE' | 'MAINTENANCE' | 'RETIRED'
    is_assigned: boolean
    next_maintenance_date: Date | null
  }>(sql`
    SELECT
      v.id,
      v.make,
      v.model,
      v.status,
      v.next_maintenance_date,
      EXISTS (
        SELECT 1 FROM loads
        WHERE assigned_vehicle_id = v.id
          AND status NOT IN ('delivered','cancelled')
      ) AS is_assigned
    FROM vehicles v
    WHERE v.org_id = ${orgId}
  `)

  return res.rows.map(row => ({
    id: row.id,
    make: row.make,
    model: row.model,
    status: row.status,
    isAssigned: row.is_assigned,
    nextMaintenanceDate: row.next_maintenance_date,
  }))
}
export const getVehicleAvailability = cache(_getVehicleAvailability)

import type { AuditLog } from '@/lib/schema'
import { AUDIT_ACTIONS, AUDIT_RESOURCES } from '@/lib/audit'

async function _getVehicleAssignmentHistory(vehicleId: number): Promise<AuditLog[]> {
  const res = await db.execute<AuditLog>(sql`
    SELECT
      id AS id,
      resource AS resource,
      action AS action,
      resource_id AS resourceId,
      details AS details,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM audit_logs
    WHERE resource = ${AUDIT_RESOURCES.VEHICLE}
      AND action = ${AUDIT_ACTIONS.VEHICLE_ASSIGN}
      AND resource_id = ${vehicleId}
    ORDER BY created_at DESC
  `)
  return res.rows
}
export const getVehicleAssignmentHistory = cache(_getVehicleAssignmentHistory)

export interface VehicleMaintenance extends Record<string, unknown> {
  id: number
  vehicleId: number
  maintenanceDate: Date
  mileage: number | null
  vendor: string | null
  description: string | null
  cost: number | null
}

async function _listVehicleMaintenance(orgId: number, vehicleId?: number): Promise<VehicleMaintenance[]> {
  const where = vehicleId ? sql`AND vehicle_id = ${vehicleId}` : sql``
  const res = await db.execute<VehicleMaintenance>(sql`
    SELECT id, vehicle_id AS "vehicleId", maintenance_date AS "maintenanceDate",
           mileage, vendor, description, cost
    FROM vehicle_maintenance
    WHERE org_id = ${orgId} ${where}
    ORDER BY maintenance_date DESC
  `)
  return res.rows
}
export const listVehicleMaintenance = cache(_listVehicleMaintenance)

export interface MaintenanceAlert {
  id: number
  vehicleId: number
  nextMaintenanceDate: Date
  overdue: boolean
}

async function _getMaintenanceAlerts(orgId: number, withinDays = 30): Promise<MaintenanceAlert[]> {
  const res = await db.execute<{
    id: number
    next_maintenance_date: Date
  }>(sql`
    SELECT id, next_maintenance_date
    FROM vehicles
    WHERE org_id = ${orgId}
      AND next_maintenance_date IS NOT NULL
      AND next_maintenance_date <= now() + (${withinDays} * interval '1 day')
  `)

  return res.rows.map(row => ({
    id: row.id,
    vehicleId: row.id,
    nextMaintenanceDate: row.next_maintenance_date,
    overdue: row.next_maintenance_date <= new Date()
  }))
}
export const getMaintenanceAlerts = cache(_getMaintenanceAlerts)
