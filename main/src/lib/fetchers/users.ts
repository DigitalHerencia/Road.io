import { db } from '@/lib/db'
import { users, roles } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import type { UserProfile } from '@/types/users'

export async function getOrgUsers(orgId: number): Promise<UserProfile[]> {
  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      orgId: users.orgId,
      role: users.role,
      customRoleId: users.customRoleId,
      customRoleName: roles.name,
      status: users.status,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .leftJoin(roles, eq(users.customRoleId, roles.id))
    .where(eq(users.orgId, orgId))
}

export async function getUserById(id: number): Promise<UserProfile | undefined> {
  const [row] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      customRoleId: users.customRoleId,
      customRoleName: roles.name,
      status: users.status,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .leftJoin(roles, eq(users.customRoleId, roles.id))
    .where(eq(users.id, id))
  return row
}

