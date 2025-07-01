import { db } from '@/lib/db';
import { loads } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import type { Load } from '@/types/loads';

export async function getAllLoads(orgId: number): Promise<Load[]> {
  return db.select().from(loads).where(eq(loads.orgId, orgId));
}

export async function getLoadById(id: number): Promise<Load | undefined> {
  const [load] = await db.select().from(loads).where(eq(loads.id, id));
  return load;
}
