'use server'

import { db } from '@/lib/db'
import { vehicles } from '@/lib/schema'
import { requirePermission } from '@/lib/rbac'
import { createAuditLog, AUDIT_ACTIONS, AUDIT_RESOURCES } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export const vehicleInputSchema = z.object({
  vin: z.string().min(1),
  licensePlate: z.string().min(1),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().int().gte(1900),
  type: z.string().optional(),
  capacity: z.coerce.number().int().optional(),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  ownerInfo: z.string().optional(),
  photoUrl: z.string().optional(),
  status: z.enum(['ACTIVE','MAINTENANCE','RETIRED']).optional(),
})
export type VehicleInput = z.infer<typeof vehicleInputSchema>

export async function createVehicle(data: VehicleInput) {
  const user = await requirePermission('org:admin:manage_users_and_roles')
  const values = vehicleInputSchema.parse(data)

  const [vehicle] = await db.insert(vehicles).values({
    orgId: user.orgId,
    ...values,
    status: values.status ?? 'ACTIVE'
  }).returning()

  await createAuditLog({
    action: AUDIT_ACTIONS.VEHICLE_CREATE,
    resource: AUDIT_RESOURCES.VEHICLE,
    resourceId: vehicle.id.toString(),
    details: { createdBy: user.id },
  })

  revalidatePath('/dashboard/vehicles')
  return { success: true, vehicle }
}

export async function updateVehicle(id: number, data: Partial<VehicleInput>) {
  const user = await requirePermission('org:admin:manage_users_and_roles')
  const values = vehicleInputSchema.partial().parse(data)

  const [vehicle] = await db
    .update(vehicles)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(vehicles.id, id))
    .returning()

  await createAuditLog({
    action: AUDIT_ACTIONS.VEHICLE_UPDATE,
    resource: AUDIT_RESOURCES.VEHICLE,
    resourceId: id.toString(),
    details: { updatedBy: user.id },
  })

  revalidatePath('/dashboard/vehicles')
  return { success: true, vehicle }
}
