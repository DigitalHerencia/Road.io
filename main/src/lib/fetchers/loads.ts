import { db } from '@/lib/db';
import { loads, loadStatusEnum } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';
import type { Load } from '@/types/loads';

export async function getAllLoads(orgId: number): Promise<Load[]> {
  const results = await db.select().from(loads).where(eq(loads.orgId, orgId));
  return results.map(load => ({
    ...load,
    pickupLocation: load.pickupLocation as { address: string; lat: number; lng: number; datetime: string; },
    deliveryLocation: load.deliveryLocation as { address: string; lat: number; lng: number; datetime: string; }
  }));
}

export async function getLoadById(id: number): Promise<Load | undefined> {
  const [load] = await db.select().from(loads).where(eq(loads.id, id));
  if (!load) return undefined;
  
  return {
    ...load,
    pickupLocation: load.pickupLocation as { address: string; lat: number; lng: number; datetime: string; },
    deliveryLocation: load.deliveryLocation as { address: string; lat: number; lng: number; datetime: string; }
  };
}

export interface LoadFilters {
  status?: typeof loadStatusEnum.enumValues[number];
  driverId?: number;
  query?: string;
  start?: string;
  end?: string;
  limit?: number;
  offset?: number;
}

export async function searchLoads(orgId: number, filters: LoadFilters = {}): Promise<Load[]> {
  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;
  
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
  const result = await db.execute<Record<string, unknown>>(query);
  return result.rows.map(load => ({
    ...load,
    pickupLocation: load.pickupLocation as { address: string; lat: number; lng: number; datetime: string; },
    deliveryLocation: load.deliveryLocation as { address: string; lat: number; lng: number; datetime: string; }
  })) as Load[];
}
