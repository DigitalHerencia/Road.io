'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { drivers, users } from '@/lib/schema'
import { createDriverMessage } from '@/lib/fetchers/drivers'
import { fetchDriverMessages } from '@/lib/fetchers/drivers'
import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/rbac'
import { createAuditLog, AUDIT_ACTIONS, AUDIT_RESOURCES } from '@/lib/audit'
import { SystemRoles } from '@/types/rbac'
import { eq } from 'drizzle-orm'

const createDriverSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  licenseNumber: z.string().min(1),
  licenseClass: z.string().min(1),
  endorsements: z.string().optional(),
  licenseExpiry: z.string().optional(),
  dotNumber: z.string().optional()
})

export type CreateDriverInput = z.infer<typeof createDriverSchema>

export async function createDriver(formData: FormData) {
  const input = createDriverSchema.parse({
    email: formData.get('email'),
    name: formData.get('name'),
    licenseNumber: formData.get('licenseNumber'),
    licenseClass: formData.get('licenseClass'),
    endorsements: formData.get('endorsements') || undefined,
    licenseExpiry: formData.get('licenseExpiry') || undefined,
    dotNumber: formData.get('dotNumber') || undefined
  })

  const current = await requirePermission('org:admin:manage_users_and_roles')

  const [user] = await db.insert(users).values({
    clerkUserId: 'local-' + Date.now(),
    email: input.email,
    name: input.name,
    orgId: current.orgId,
    role: SystemRoles.DRIVER
  }).returning()

  const [driver] = await db.insert(drivers).values({
    userId: user.id,
    licenseNumber: input.licenseNumber,
    licenseClass: input.licenseClass,
    endorsements: input.endorsements,
    licenseExpiry: input.licenseExpiry ? new Date(input.licenseExpiry) : null,
    dotNumber: input.dotNumber
  }).returning()

  await createAuditLog({
    action: AUDIT_ACTIONS.DRIVER_CREATE,
    resource: AUDIT_RESOURCES.DRIVER,
    resourceId: driver.id.toString(),
    details: { createdBy: current.id }
  })

  revalidatePath('/drivers')
  return { success: true }
}

const updateDriverSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  licenseNumber: z.string().min(1),
  licenseClass: z.string().min(1),
  endorsements: z.string().optional(),
  licenseExpiry: z.string().optional(),
  dotNumber: z.string().optional()
})

export type UpdateDriverInput = z.infer<typeof updateDriverSchema>

export async function updateDriver(formData: FormData) {
  const input = updateDriverSchema.parse({
    id: formData.get('id'),
    email: formData.get('email'),
    name: formData.get('name'),
    licenseNumber: formData.get('licenseNumber'),
    licenseClass: formData.get('licenseClass'),
    endorsements: formData.get('endorsements') || undefined,
    licenseExpiry: formData.get('licenseExpiry') || undefined,
    dotNumber: formData.get('dotNumber') || undefined
  })

  const driverId = parseInt(input.id)

  const current = await requirePermission('org:admin:manage_users_and_roles')

  const [driver] = await db.select().from(drivers).where(eq(drivers.id, driverId))
  if (!driver) {
    throw new Error('Driver not found')
  }

  await db.update(users).set({
    name: input.name,
    email: input.email,
    updatedAt: new Date()
  }).where(eq(users.id, driver.userId))

  await db.update(drivers).set({
    licenseNumber: input.licenseNumber,
    licenseClass: input.licenseClass,
    endorsements: input.endorsements,
    licenseExpiry: input.licenseExpiry ? new Date(input.licenseExpiry) : null,
    dotNumber: input.dotNumber,
    updatedAt: new Date()
  }).where(eq(drivers.id, driverId))

  await createAuditLog({
    action: AUDIT_ACTIONS.DRIVER_UPDATE,
    resource: AUDIT_RESOURCES.DRIVER,
    resourceId: driverId.toString(),
    details: { updatedBy: current.id }
  })

  revalidatePath('/drivers')
  revalidatePath(`/drivers/${driverId}`)
  return { success: true }
}

const statusSchema = z.object({
  id: z.string(),
  status: z.enum(['AVAILABLE', 'ON_DUTY', 'OFF_DUTY'])
})

export async function updateDriverStatus(formData: FormData) {
  const input = statusSchema.parse({
    id: formData.get('id'),
    status: formData.get('status')
  })

  const driverId = parseInt(input.id)
  await requirePermission('org:dispatcher:assign_drivers')

  const [updated] = await db
    .update(drivers)
    .set({
      status: input.status,
      isAvailable: input.status === 'AVAILABLE',
      updatedAt: new Date()
    })
    .where(eq(drivers.id, driverId))
    .returning()

  await createAuditLog({
    action: AUDIT_ACTIONS.DRIVER_UPDATE,
    resource: AUDIT_RESOURCES.DRIVER,
    resourceId: driverId.toString(),
    details: { status: updated.status }
  })

  revalidatePath('/drivers')
  revalidatePath(`/drivers/${driverId}`)
  return { success: true }
}

// Record a driver violation
export const violationSchema = z.object({
  driverId: z.coerce.number(),
  type: z.string().min(1),
  description: z.string().optional(),
  occurredAt: z.string().optional(),
})
export type RecordViolationInput = z.infer<typeof violationSchema>

export async function recordDriverViolation(
  data: FormData | RecordViolationInput,
) {
  const values = violationSchema.parse(
    data instanceof FormData
      ? {
          driverId: data.get('driverId'),
          type: data.get('type'),
          description: data.get('description') || undefined,
          occurredAt: data.get('occurredAt') || undefined,
        }
      : data,
  )

  const user = await requirePermission('org:admin:manage_users_and_roles')

  await db.insert(driverViolations).values({
    orgId: user.orgId,
    driverId: values.driverId,
    type: values.type,
    description: values.description,
    occurredAt: values.occurredAt ? new Date(values.occurredAt) : new Date(),
  })

  await createAuditLog({
    action: AUDIT_ACTIONS.DRIVER_UPDATE,
    resource: AUDIT_RESOURCES.DRIVER,
    resourceId: values.driverId.toString(),
    details: { violation: values.type },
  })

  revalidatePath(`/drivers/${values.driverId}`)
  return { success: true }
}

// Add a driver certification (e.g., DOT medical)
export const certificationSchema = z.object({
  driverId: z.coerce.number(),
  type: z.string().min(1),
  issuedAt: z.string().optional(),
  expiresAt: z.string().optional(),
})
export type AddCertificationInput = z.infer<typeof certificationSchema>

export async function addDriverCertification(
  data: FormData | AddCertificationInput,
) {
  const values = certificationSchema.parse(
    data instanceof FormData
      ? {
          driverId: data.get('driverId'),
          type: data.get('type'),
          issuedAt: data.get('issuedAt') || undefined,
          expiresAt: data.get('expiresAt') || undefined,
        }
      : data,
  )

  const user = await requirePermission('org:admin:manage_users_and_roles')

  await db.insert(driverCertifications).values({
    orgId: user.orgId,
    driverId: values.driverId,
    type: values.type,
    issuedAt: values.issuedAt ? new Date(values.issuedAt) : null,
    expiresAt: values.expiresAt ? new Date(values.expiresAt) : null,
  })

  await createAuditLog({
    action: AUDIT_ACTIONS.DRIVER_UPDATE,
    resource: AUDIT_RESOURCES.DRIVER,
    resourceId: values.driverId.toString(),
    details: { certification: values.type },
  })

  revalidatePath(`/drivers/${values.driverId}`)
  return { success: true }
const messageSchema = z.object({
  driverId: z.coerce.number().int().positive(),
  sender: z.enum(['DRIVER', 'DISPATCH']).default('DISPATCH'),
  message: z.string().min(1)
})

export async function sendDriverMessage(formData: FormData) {
  const { driverId, sender, message } = messageSchema.parse({
    driverId: formData.get('driverId'),
    sender: formData.get('sender'),
    message: formData.get('message')
  })

  const current = await requirePermission('org:dispatcher:send_messages')

  await createDriverMessage({
    orgId: current.orgId,
    driverId,
    sender,
    message,
  })

  revalidatePath(`/drivers/${driverId}/messages`)
  return { success: true }
}

export async function getDriverMessagesAction(params: { driverId: number }) {
  const { driverId } = messageSchema.pick({ driverId: true }).parse(params)
  return fetchDriverMessages(driverId)

}
