import { db } from '@/lib/db'
import { trainingPrograms, driverTrainings } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function getTrainingPrograms(orgId: number) {
  return db.select().from(trainingPrograms).where(eq(trainingPrograms.orgId, orgId))
}

export async function getDriverTrainingRecords(driverId: number) {
  return db
    .select({
      id: driverTrainings.id,
      status: driverTrainings.status,
      scheduledAt: driverTrainings.scheduledAt,
      completedAt: driverTrainings.completedAt,
      title: trainingPrograms.title,
    })
    .from(driverTrainings)
    .innerJoin(trainingPrograms, eq(driverTrainings.programId, trainingPrograms.id))
    .where(eq(driverTrainings.driverId, driverId))
}
