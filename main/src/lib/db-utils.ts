import { db } from './db';
import { users, type NewUser } from './schema';
import { eq } from 'drizzle-orm';

// User operations
export async function createUser(data: NewUser) {
  const [user] = await db.insert(users).values(data).returning();
  return user;
}

export async function getUserById(id: number) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

export async function getAllUsers() {
  return await db.select().from(users);
}
