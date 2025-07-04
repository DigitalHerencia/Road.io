import { db } from '@/lib/db'
import { vehicles } from '@/lib/schema'
import { eq, sql } from 'drizzle-orm'
import { cache } from 'react'

async function _getAllVehicles(orgId: number) {
  return db.select().from(vehicles).where(eq(vehicles.orgId, orgId))

}
export const getAllVehicles = cache(_getAllVehicles)

export interface FleetOverview {
  total: number;
  active: number;
  maintenance: number;
  retired: number;
  maintenanceDue: number;
  inspectionDue: number;
}

async function _getFleetOverview(orgId: number): Promise<FleetOverview> {
  const totalRes = await db.execute<{ count: number }>(sql`
    SELECT count(*)::int AS count FROM vehicles WHERE org_id = ${orgId}
  `);
  const statusRes = await db.execute<{ status: string; count: number }>(sql`
    SELECT status, count(*)::int AS count FROM vehicles
    WHERE org_id = ${orgId}
    GROUP BY status
  `);
  const maintDueRes = await db.execute<{ count: number }>(sql`
    SELECT count(*)::int AS count FROM vehicles
    WHERE org_id = ${orgId} AND next_maintenance_date <= now()
  `);
  const inspDueRes = await db.execute<{ count: number }>(sql`
    SELECT count(*)::int AS count FROM vehicles
    WHERE org_id = ${orgId} AND next_inspection_date <= now()
  `);

  const statusCounts = statusRes.rows.reduce<Record<string, number>>(
    (acc, r) => {
      acc[r.status] = r.count;
      return acc;
    },
    {},
  );

  return {
    total: totalRes.rows[0]?.count ?? 0,
    active: statusCounts.ACTIVE ?? 0,
    maintenance: statusCounts.MAINTENANCE ?? 0,
    retired: statusCounts.RETIRED ?? 0,
    maintenanceDue: maintDueRes.rows[0]?.count ?? 0,
    inspectionDue: inspDueRes.rows[0]?.count ?? 0,
  };
}
export const getFleetOverview = cache(_getFleetOverview)


async function _getVehicleById(id: number) {
  const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id))
  return vehicle
}
export const getVehicleById = cache(_getVehicleById)

export interface VehicleAvailability {
  id: number;
  make: string | null;
  model: string | null;
  status: "ACTIVE" | "MAINTENANCE" | "RETIRED";
  isAssigned: boolean;
  nextMaintenanceDate: Date | null;
}

export async function getVehicleAvailability(
  orgId: number,
): Promise<VehicleAvailability[]> {

  const res = await db.execute<{
    id: number;
    make: string | null;
    model: string | null;
    status: "ACTIVE" | "MAINTENANCE" | "RETIRED";
    is_assigned: boolean;
    next_maintenance_date: Date | null;
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
  `);

  return res.rows.map((row) => ({
    id: row.id,
    make: row.make,
    model: row.model,
    status: row.status,
    isAssigned: row.is_assigned,
    nextMaintenanceDate: row.next_maintenance_date,
  }));
}

import type { AuditLog } from "@/lib/schema";
import { AUDIT_ACTIONS, AUDIT_RESOURCES } from "@/lib/audit";

export async function getVehicleAssignmentHistory(
  vehicleId: number,
): Promise<AuditLog[]> {
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
  `);
  return res.rows;
}

export interface VehicleMaintenance extends Record<string, unknown> {
  id: number;
  vehicleId: number;
  maintenanceDate: Date;
  mileage: number | null;
  vendor: string | null;
  description: string | null;
  cost: number | null;
}
export async function listVehicleMaintenance(
  orgId: number,
  vehicleId?: number,
): Promise<VehicleMaintenance[]> {
  const where = vehicleId ? sql`AND vehicle_id = ${vehicleId}` : sql``;
  const res = await db.execute<VehicleMaintenance>(sql`
    SELECT id, vehicle_id AS "vehicleId", maintenance_date AS "maintenanceDate",
           mileage, vendor, description, cost
    FROM vehicle_maintenance
    WHERE org_id = ${orgId} ${where}
    ORDER BY maintenance_date DESC
  `);
  return res.rows;
}

export interface MaintenanceAlert {
  id: number;
  vehicleId: number;
  nextMaintenanceDate: Date;
  overdue: boolean;
}

export async function getMaintenanceAlerts(
  orgId: number,
  withinDays = 30,
): Promise<MaintenanceAlert[]> {

  const res = await db.execute<{
    id: number;
    next_maintenance_date: Date;
  }>(sql`
    SELECT id, next_maintenance_date
    FROM vehicles
    WHERE org_id = ${orgId}
      AND next_maintenance_date IS NOT NULL
      AND next_maintenance_date <= now() + (${withinDays} * interval '1 day')
  `);

  return res.rows.map((row) => ({
    id: row.id,
    vehicleId: row.id,
    nextMaintenanceDate: row.next_maintenance_date,
    overdue: row.next_maintenance_date <= new Date(),
  }));
}

export interface TelematicsData extends Record<string, unknown> {
  id: number;
  vehicleId: number;
  recordedAt: Date;
  location: string | null;
  odometer: number | null;
  engineHours: number | null;
  data: unknown;
}

export async function getLatestTelematics(
  vehicleId: number,
): Promise<TelematicsData | null> {
  const res = await db.execute<TelematicsData>(sql`
    SELECT id, vehicle_id AS "vehicleId", recorded_at AS "recordedAt",
           location, odometer, engine_hours AS "engineHours", data
    FROM vehicle_telematics
    WHERE vehicle_id = ${vehicleId}
    ORDER BY recorded_at DESC
    LIMIT 1
  `);
  return res.rows[0] ?? null;
}

import type { Document } from "@/lib/schema";

export async function listVehicleDocuments(
  vehicleId: number,
): Promise<Document[]> {
  const res = await db.execute<Document>(sql`
    SELECT * FROM documents
    WHERE vehicle_id = ${vehicleId}
    ORDER BY created_at DESC
  `);
  return res.rows;
}
async function _getVehicleDocuments(
  vehicleId: number,
): Promise<Document[]> {
  const res = await db.execute<Document>(sql`
    SELECT * FROM documents
    WHERE vehicle_id = ${vehicleId}
    ORDER BY created_at DESC
  `);
  return res.rows;
  
}
export const getVehicleDocuments = cache(_getVehicleDocuments);

export function getVehicleList ()
{
  throw new Error( 'Function not implemented.' )
}