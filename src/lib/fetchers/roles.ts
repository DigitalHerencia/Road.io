import { db } from '@/lib/db'
import { roles } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import type { Role } from '@/types/roles'

export async function getOrgRoles(orgId: number): Promise<Role[]> {
  return db
    .select()
    .from(roles)
    .where(eq(roles.orgId, orgId)) as unknown as Role[]
}

export async function getRoleById(id: number): Promise<Role | undefined> {
  const [row] = await db.select().from(roles).where(eq(roles.id, id))
  return row as Role | undefined
}

