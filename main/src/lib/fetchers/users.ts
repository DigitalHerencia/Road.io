import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import type { UserProfile } from '@/types/users'

export async function getOrgUsers(orgId: number): Promise<UserProfile[]> {
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      orgId: users.orgId,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.orgId, orgId));
  return rows.map((r) => ({
    ...r,
    role: r.role as import('@/types/rbac').SystemRoles,
    status: 'ACTIVE' as const,
  }));
}

export async function getUserById(id: number): Promise<UserProfile | undefined> {
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, id));
  const [row] = rows.map((r) => ({
    ...r,
    role: r.role as import('@/types/rbac').SystemRoles,
    status: 'ACTIVE' as const,
  }));
  return row;
}