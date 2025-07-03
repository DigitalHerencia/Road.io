'use server'

import { z } from 'zod'
import { createUser, getAllUsers, getUserByEmail } from '@/lib/db-utils'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1).optional(),
})

export async function listUsersAction() {
  const allUsers = await getAllUsers()
  return { success: true, users: allUsers, count: allUsers.length }
}

export async function createUserAction(data: { email: string; name?: string }) {
  const values = userSchema.parse(data)
  const existing = await getUserByEmail(values.email)
  if (existing) return { success: false, message: 'User with this email already exists' }
  const newUser = await createUser({ clerkUserId: 'api-' + Date.now(), ...values })
  return { success: true, user: newUser }
}

export async function testDbConnectionAction() {
  const rows = await db.select().from(users)
  return { success: true, users: rows, count: rows.length }
}

export async function createTestUserAction(data: { email: string; name?: string }) {
  const values = userSchema.parse(data)
  const [newUser] = await db
    .insert(users)
    .values({ clerkUserId: 'test-' + Date.now(), email: values.email, name: values.name })
    .returning()
  return { success: true, user: newUser }
}
