'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { trainingPrograms, driverTrainings } from '@/lib/schema'
import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/rbac'
import { createAuditLog, AUDIT_ACTIONS, AUDIT_RESOURCES } from '@/lib/audit'
import { eq } from 'drizzle-orm'

const programSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export async function createTrainingProgramAction(formData: FormData) {
  const data = programSchema.parse({
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    startDate: formData.get('startDate') || undefined,
    endDate: formData.get('endDate') || undefined,
  })

  const user = await requirePermission('org:admin:manage_users_and_roles')
  const [program] = await db
    .insert(trainingPrograms)
    .values({
      orgId: user.orgId,
      title: data.title,
      description: data.description,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      createdById: parseInt(user.id),
    })
    .returning()

  await createAuditLog({
    action: AUDIT_ACTIONS.TRAINING_CREATE,
    resource: AUDIT_RESOURCES.TRAINING_PROGRAM,
    resourceId: program.id.toString(),
  })

  revalidatePath('/drivers/training')
  // Return nothing for form action compatibility
}

const assignSchema = z.object({
  driverId: z.coerce.number(),
  programId: z.coerce.number(),
  scheduledAt: z.string().optional(),
})

export async function assignTrainingAction(formData: FormData) {
  const data = assignSchema.parse({
    driverId: formData.get('driverId'),
    programId: formData.get('programId'),
    scheduledAt: formData.get('scheduledAt') || undefined,
  })

  const user = await requirePermission('org:admin:manage_users_and_roles')
  const [record] = await db
    .insert(driverTrainings)
    .values({
      orgId: user.orgId,
      driverId: data.driverId,
      programId: data.programId,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
    })
    .returning()

  await createAuditLog({
    action: AUDIT_ACTIONS.TRAINING_ASSIGN,
    resource: AUDIT_RESOURCES.TRAINING_PROGRAM,
    resourceId: record.id.toString(),
  })

  revalidatePath(`/drivers/${data.driverId}`)
  return { success: true }
}

const completeSchema = z.object({
  recordId: z.coerce.number(),
  completedAt: z.string().optional(),
})

export async function completeTrainingAction(formData: FormData) {
  const data = completeSchema.parse({
    recordId: formData.get('recordId'),
    completedAt: formData.get('completedAt') || undefined,
  })

  await requirePermission('org:admin:manage_users_and_roles')
  await db
    .update(driverTrainings)
    .set({
      status: 'COMPLETED',
      completedAt: data.completedAt ? new Date(data.completedAt) : new Date(),
    })
    .where(eq(driverTrainings.id, data.recordId))

  revalidatePath('/drivers/training')
  return { success: true }
}
