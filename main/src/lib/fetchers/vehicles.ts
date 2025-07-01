import { db } from '@/lib/db'
import { vehicles } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function getAllVehicles(orgId: number) {
  return db.select().from(vehicles).where(eq(vehicles.orgId, orgId))
}

export async function getVehicleById(id: number) {
  const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id))
  return vehicle
}
