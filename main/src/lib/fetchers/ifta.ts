import { db } from '@/lib/db'
import { trips } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function getTripsByOrg(orgId: number) {
  return await db.select().from(trips).where(eq(trips.orgId, orgId))
}
