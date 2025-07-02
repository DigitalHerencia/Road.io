'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { roles, users } from '@/lib/schema'
import { requirePermission } from '@/lib/rbac'
import { revalidatePath } from 'next/cache'
import { createAuditLog, AUDIT_ACTIONS, AUDIT_RESOURCES } from '@/lib/audit'
import { eq } from 'drizzle-orm'
import { SystemRoles } from '@/types/rbac'

const roleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  baseRole: z.nativeEnum(SystemRoles),
  permissions: z.array(z.string()).optional(),
})

export async function createRoleAction(data: z.infer<typeof roleSchema>) {
  const admin = await requirePermission('org:admin:manage_users_and_roles')
  const values = roleSchema.parse(data)
  const [role] = await db
    .insert(roles)
    .values({
      orgId: admin.orgId,
      name: values.name,
      description: values.description ?? null,
      baseRole: values.baseRole,
      permissions: values.permissions ?? [],
    })
    .returning()

  await createAuditLog({
    action: AUDIT_ACTIONS.ROLE_CREATE,
    resource: AUDIT_RESOURCES.ROLE,
    resourceId: role.id.toString(),
    details: { createdBy: admin.id },
  })

  revalidatePath('/dashboard/admin/roles')
  return { success: true, role }
}

const updateSchema = roleSchema.extend({ id: z.number() })

export async function updateRoleAction(data: z.infer<typeof updateSchema>) {
  const admin = await requirePermission('org:admin:manage_users_and_roles')
  const values = updateSchema.parse(data)
  const [role] = await db
    .update(roles)
    .set({
      name: values.name,
      description: values.description ?? null,
      baseRole: values.baseRole,
      permissions: values.permissions ?? [],
      updatedAt: new Date(),
    })
    .where(eq(roles.id, values.id))
    .returning()

  await createAuditLog({
    action: AUDIT_ACTIONS.ROLE_UPDATE,
    resource: AUDIT_RESOURCES.ROLE,
    resourceId: role.id.toString(),
    details: { updatedBy: admin.id },
  })

  revalidatePath('/dashboard/admin/roles')
  return { success: true, role }
}

export async function deleteRoleAction(id: number) {
  const admin = await requirePermission('org:admin:manage_users_and_roles')
  await db.delete(roles).where(eq(roles.id, id))

  await createAuditLog({
    action: AUDIT_ACTIONS.ROLE_DELETE,
    resource: AUDIT_RESOURCES.ROLE,
    resourceId: id.toString(),
    details: { deletedBy: admin.id },
  })

  revalidatePath('/dashboard/admin/roles')
  return { success: true }
}

export async function assignRoleAction(userId: number, roleId: number | null) {
  const admin = await requirePermission('org:admin:manage_users_and_roles')
  await db
    .update(users)
    .set({ customRoleId: roleId, updatedAt: new Date() })
    .where(eq(users.id, userId))

  await createAuditLog({
    action: AUDIT_ACTIONS.USER_ROLE_CHANGE,
    resource: AUDIT_RESOURCES.USER,
    resourceId: userId.toString(),
    details: { assignedRole: roleId, updatedBy: admin.id },
  })

  revalidatePath('/dashboard/admin/users')
  return { success: true }
}

