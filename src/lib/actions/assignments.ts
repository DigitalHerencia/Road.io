'use server'

import { db } from '@/lib/db'
import { loads, vehicles } from '@/lib/schema'
import { requirePermission } from '@/lib/rbac'
import { AUDIT_ACTIONS, AUDIT_RESOURCES, createAuditLog } from '@/lib/audit'
import { sql, eq } from 'drizzle-orm'
import { z } from 'zod'

const assignmentSchema = z.object({
  driverId: z.coerce.number().int().positive().optional(),
  vehicleId: z.coerce.number().int().positive().optional(),
})

export async function assignLoad(loadId: number, formData: FormData) {
  const user = await requirePermission('org:dispatcher:assign_drivers')
  const input = assignmentSchema.parse({
    driverId: formData.get('driverId'),
    vehicleId: formData.get('vehicleId'),
  })

  const [load] = await db
    .select()
    .from(loads)
    .where(eq(loads.id, loadId))
  if (!load) {
    return { success: false, error: 'Load not found' }
  }

  if (input.driverId) {
    const conflict = await db.execute(sql`
      SELECT 1 FROM loads
      WHERE assigned_driver_id = ${input.driverId}
        AND id <> ${loadId}
        AND status NOT IN ('delivered','cancelled')
      LIMIT 1
    `)
    if (conflict.rows.length > 0) {
      return { success: false, error: 'Driver already assigned to another load' }
    }
  }

  if (input.vehicleId) {
    const conflict = await db.execute(sql`
      SELECT 1 FROM loads
      WHERE assigned_vehicle_id = ${input.vehicleId}
        AND id <> ${loadId}
        AND status NOT IN ('delivered','cancelled')
      LIMIT 1
    `)
    if (conflict.rows.length > 0) {
      return { success: false, error: 'Vehicle already assigned to another load' }
    }
  }

  // Change the type here:
  const updateData: Partial<typeof loads.$inferInsert> = {
    status: input.driverId && input.vehicleId ? 'assigned' : load.status,
    updatedAt: new Date(),
  }
  
  if (input.driverId) {
    updateData.assignedDriverId = input.driverId
  }
  
  if (input.vehicleId) {
    updateData.assignedVehicleId = input.vehicleId
  }

  const [updated] = await db
    .update(loads)
    .set(updateData)
    .where(eq(loads.id, loadId))
    .returning()

  if (input.vehicleId) {
    const vehicleUpdateData: Record<string, unknown> = { updatedAt: new Date() }
    if (input.driverId) {
      vehicleUpdateData.currentDriverId = input.driverId
    }
    
    await db
      .update(vehicles)
      .set(vehicleUpdateData)
      .where(eq(vehicles.id, input.vehicleId))
    await createAuditLog({
      action: AUDIT_ACTIONS.VEHICLE_ASSIGN,
      resource: AUDIT_RESOURCES.VEHICLE,
      resourceId: input.vehicleId.toString(),
      details: { loadId, driverId: input.driverId, assignedBy: user.id },
    })
  }
  return { success: true, load: updated }
}
