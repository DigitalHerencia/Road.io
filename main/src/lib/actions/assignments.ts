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

  const [updated] = await db
    .update(loads)
    .set({
      assignedDriverId: (input.driverId ?? null) as number | null,
      assignedVehicleId: (input.vehicleId ?? null) as number | null,
      status: input.driverId && input.vehicleId ? 'assigned' : load.status,
      updatedAt: new Date(),
    })
    .where(eq(loads.id, loadId))
    .returning()

  if (input.vehicleId) {
    await db
      .update(vehicles)
      .set({ currentDriverId: (input.driverId ?? null) as number | null, updatedAt: new Date() })
      .where(eq(vehicles.id, input.vehicleId!))
  }

  await createAuditLog({
    action: AUDIT_ACTIONS.LOAD_ASSIGN,
    resource: AUDIT_RESOURCES.LOAD,
    resourceId: loadId.toString(),
    details: { driverId: input.driverId, vehicleId: input.vehicleId, assignedBy: user.id },
  })

  return { success: true, load: updated }
}
