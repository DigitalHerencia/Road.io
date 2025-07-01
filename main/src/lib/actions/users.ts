'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { requirePermission } from '@/lib/rbac'
import { createAuditLog, AUDIT_ACTIONS, AUDIT_RESOURCES } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { eq, inArray } from 'drizzle-orm'
import { SystemRoles } from '@/types/rbac'

enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}
const updateSchema = z.object({
  id: z.coerce.number(),
  name: z.string().optional(),
  email: z.string().email(),
  role: z.nativeEnum(SystemRoles),
  status: z.nativeEnum(UserStatus),
})

export async function updateUserAction(formData: FormData) {
  const admin = await requirePermission('org:admin:manage_users_and_roles')
  const input = updateSchema.parse({
    id: formData.get('id'),
    name: formData.get('name') || undefined,
    email: formData.get('email'),
    role: formData.get('role'),
    status: formData.get('status'),
  })
  const userId = Number(input.id)
  await db
    .update(users)
    .set({
      name: input.name,
      email: input.email,
      role: input.role,
      status: input.status,
      isActive: input.status === 'ACTIVE',
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))

  await createAuditLog({
    action: AUDIT_ACTIONS.USER_UPDATE,
    resource: AUDIT_RESOURCES.USER,
    resourceId: input.id,
    details: { updatedBy: admin.id },
  })

  revalidatePath('/dashboard/admin/users')
  revalidatePath(`/dashboard/admin/users/${input.id}/edit`)
  return { success: true }
}

const bulkSchema = z.object({
  ids: z.array(z.coerce.number().int()).min(1),
  status: z.enum(['ACTIVE','INACTIVE','SUSPENDED']),
})
export type BulkStatusInput = z.infer<typeof bulkSchema>

export async function bulkUpdateStatusAction(data: BulkStatusInput) {
  const admin = await requirePermission('org:admin:manage_users_and_roles')
  const input = bulkSchema.parse(data)
  await db
    .update(users)
    .set({
      status: input.status,
      isActive: input.status === 'ACTIVE',
      updatedAt: new Date(),
    })
    .where(inArray(users.id, input.ids))

  await createAuditLog({
    action: AUDIT_ACTIONS.USER_UPDATE,
    resource: AUDIT_RESOURCES.USER,
    details: { updatedBy: admin.id, ids: input.ids, status: input.status },
  })

  revalidatePath('/dashboard/admin/users')
  return { success: true }
}

