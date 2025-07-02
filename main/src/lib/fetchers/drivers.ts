import { db } from '@/lib/db';
import { drivers, users } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';
import { DriverProfile } from '@/types/drivers';

export async function getAllDrivers(): Promise<DriverProfile[]> {
  const rows = await db
    .select({
      id: drivers.id,
      userId: drivers.userId,
      name: users.name,
      email: users.email,
      licenseNumber: drivers.licenseNumber,
      licenseExpiry: drivers.licenseExpiry,
      dotNumber: drivers.dotNumber,
      status: drivers.status,
      isAvailable: drivers.isAvailable,
      createdAt: drivers.createdAt,
      updatedAt: drivers.updatedAt,
    })
    .from(drivers)
    .innerJoin(users, eq(drivers.userId, users.id));

  return rows;
}

export async function getDriverById(id: number): Promise<DriverProfile | undefined> {
  const [row] = await db
    .select({
      id: drivers.id,
      userId: drivers.userId,
      name: users.name,
      email: users.email,
      licenseNumber: drivers.licenseNumber,
      licenseExpiry: drivers.licenseExpiry,
      dotNumber: drivers.dotNumber,
      status: drivers.status,
      isAvailable: drivers.isAvailable,
      createdAt: drivers.createdAt,
      updatedAt: drivers.updatedAt,
    })
    .from(drivers)
    .innerJoin(users, eq(drivers.userId, users.id))
    .where(eq(drivers.id, id));

  return row;
}

export async function getAvailableDrivers(): Promise<DriverProfile[]> {
  return db
    .select({
      id: drivers.id,
      userId: drivers.userId,
      name: users.name,
      email: users.email,
      licenseNumber: drivers.licenseNumber,
      licenseExpiry: drivers.licenseExpiry,
      dotNumber: drivers.dotNumber,
      status: drivers.status,
      isAvailable: drivers.isAvailable,
      createdAt: drivers.createdAt,
      updatedAt: drivers.updatedAt,
    })
    .from(drivers)
    .innerJoin(users, eq(drivers.userId, users.id))
    .where(eq(drivers.status, 'AVAILABLE'));
}

export interface DriverAssignmentStats {
  current: number;
  completed: number;
  completionRate: number;
}

export async function getDriverAssignmentStats(
  driverId: number,
): Promise<DriverAssignmentStats> {
  const result = await db.execute<{ current: number; completed: number }>(sql`
    SELECT
      count(*) FILTER (WHERE status NOT IN ('delivered','cancelled'))::int AS current,
      count(*) FILTER (WHERE status = 'delivered')::int AS completed
    FROM loads
    WHERE assigned_driver_id = ${driverId}
  `);

  const current = result.rows[0]?.current ?? 0;
  const completed = result.rows[0]?.completed ?? 0;
  const total = current + completed;

  return {
    current,
    completed,
    completionRate: total === 0 ? 0 : Number((completed / total).toFixed(2)),
  };
}
