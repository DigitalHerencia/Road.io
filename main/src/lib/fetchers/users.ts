import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import type { UserProfile } from '@/types/users'

export async function getOrgUsers(orgId: number): Promise<UserProfile[]> {
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      orgId: users.orgId,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.orgId, orgId));
  return rows.map((r) => ({
    ...r,
    role: r.role as import('@/types/rbac').SystemRoles,
    status: r.isActive ? 'ACTIVE' : 'INACTIVE',
    customRoleId: null,
    customRoleName: null,
  }));
}

export async function getUserById(id: number): Promise<UserProfile | undefined> {
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, id));
  const [row] = rows.map((r) => ({
    ...r,
    role: r.role as import('@/types/rbac').SystemRoles,
    status: r.isActive ? 'ACTIVE' : 'INACTIVE',
    customRoleId: null,
    customRoleName: null,
  }));
  return row;
}

export async function getUserList(
  orgId: number,
  sort: 'name' | 'email' | 'role' | 'createdAt' = 'createdAt',
  status?: 'ACTIVE' | 'INACTIVE',
): Promise<UserProfile[]> {
  let queryBuilder = db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      orgId: users.orgId,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users);

  const conditions = [eq(users.orgId, orgId)];
  
  if (status) {
    conditions.push(eq(users.isActive, status === 'ACTIVE'));
  }

  const columnMap = {
    name: users.name,
    email: users.email,
    role: users.role,
    createdAt: users.createdAt,
  } as const;

  const rows = await queryBuilder
    .where(conditions.length > 1 ? and(...conditions) : conditions[0])
    .orderBy(columnMap[sort] ?? users.createdAt);

  return rows.map((r) => ({
    ...r,
    role: r.role as import('@/types/rbac').SystemRoles,
    status: r.isActive ? 'ACTIVE' : 'INACTIVE',
    customRoleId: null,
    customRoleName: null,
  }));
}