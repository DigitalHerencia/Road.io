import { db } from '@/lib/db';
import { loads, loadStatusEnum } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';
import type { Load } from '@/types/loads';

export async function getAllLoads(orgId: number): Promise<Load[]> {
  return db.select().from(loads).where(eq(loads.orgId, orgId));
}

export async function getLoadById(id: number): Promise<Load | undefined> {
  const [load] = await db.select().from(loads).where(eq(loads.id, id));
  return load;
}

export interface LoadFilters {
  status?: typeof loadStatusEnum.enumValues[number];
  driverId?: number;
  query?: string;
  start?: string;
  end?: string;
}

export async function searchLoads(orgId: number, filters: LoadFilters = {}): Promise<Load[]> {
  let query = sql`SELECT * FROM loads WHERE org_id = ${orgId}`;
  if (filters.status) {
    query = sql`${query} AND status = ${filters.status}`;
  }
  if (filters.driverId) {
    query = sql`${query} AND assigned_driver_id = ${filters.driverId}`;
  }
  if (filters.start) {
    query = sql`${query} AND (pickup_location->>'datetime')::timestamp >= ${filters.start}`;
  }
  if (filters.end) {
    query = sql`${query} AND (pickup_location->>'datetime')::timestamp <= ${filters.end}`;
  }
  if (filters.query) {
    const term = `%${filters.query}%`;
    query = sql`${query} AND (load_number ILIKE ${term} OR pickup_location->>'address' ILIKE ${term} OR delivery_location->>'address' ILIKE ${term})`;
  }
  query = sql`${query} ORDER BY updated_at DESC LIMIT ${limit} OFFSET ${offset}`;
  const result = await db.execute<Load>(query);
  return result.rows;
}
