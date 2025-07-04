import { describe, it, expect, vi } from 'vitest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

const sqlite = new Database(':memory:')
sqlite.exec(`CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, clerk_user_id TEXT, email TEXT, name TEXT, org_id INTEGER, role TEXT, status TEXT, is_active INTEGER, created_at TEXT, updated_at TEXT)`)

const db = drizzle(sqlite)
const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clerkUserId: text('clerk_user_id'),
  email: text('email'),
  name: text('name'),
  orgId: integer('org_id'),
  role: text('role'),
  status: text('status'),
  isActive: integer('is_active'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
})

vi.mock('@/lib/db', () => ({ db }))
vi.mock('@/lib/schema', () => ({ users }))

import type { NewUser } from '@/lib/schema'

import { createUser, getUserById } from '@/lib/db-utils'

describe('db utils with sqlite', () => {
  it('inserts and fetches user', async () => {
    const newUser = {
      clerkUserId: 'c1',
      email: 'a@test.com',
      name: 'A',
      orgId: 1,
      role: 'MEMBER',
      status: 'ACTIVE',
      isActive: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const inserted = await createUser(newUser as unknown as NewUser)
    const fetched = await getUserById(inserted.id)
    expect(fetched?.email).toBe('a@test.com')
  })
})
