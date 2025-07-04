import { db } from '@/lib/db'
import { payStatements } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function getPayStatements(driverId: number) {
  return db.select().from(payStatements).where(eq(payStatements.driverId, driverId))
}
