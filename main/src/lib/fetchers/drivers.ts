import { db } from '@/lib/db';
import { drivers, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
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
      isAvailable: drivers.isAvailable,
      createdAt: drivers.createdAt,
      updatedAt: drivers.updatedAt,
    })
    .from(drivers)
    .innerJoin(users, eq(drivers.userId, users.id))
    .where(eq(drivers.id, id));

  return row;
}
