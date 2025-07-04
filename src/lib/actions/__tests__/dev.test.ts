import { describe, it, expect, vi } from 'vitest'
import { listUsersAction, createUserAction, testDbConnectionAction, createTestUserAction } from '../dev'

vi.mock('@/lib/db-utils', () => ({
  createUser: vi.fn(async (d) => ({ id: 1, ...d })),
  getAllUsers: vi.fn(async () => [{ id: 1 }]),
  getUserByEmail: vi.fn(async () => null),
}))

vi.mock('@/lib/db', () => ({
  db: {
    select: () => ({ from: () => Promise.resolve([{ id: 1 }]) }),
    insert: () => ({ values: () => ({ returning: () => Promise.resolve([{ id: 2 }]) }) })
  }
}))

vi.mock('@/lib/schema', () => ({ users: {} }))

describe('listUsersAction', () => {
  it('returns users', async () => {
    const res = await listUsersAction()
    expect(res.success).toBe(true)
    expect(res.users.length).toBeGreaterThan(0)
  })
})

describe('createUserAction', () => {
  it('creates user', async () => {
    const res = await createUserAction({ email: 'a@test.com' })
    expect(res.success).toBe(true)
  })
})

describe('testDbConnectionAction', () => {
  it('returns rows', async () => {
    const res = await testDbConnectionAction()
    expect(res.success).toBe(true)
  })
})

describe('createTestUserAction', () => {
  it('creates test user', async () => {
    const res = await createTestUserAction({ email: 'b@test.com' })
    expect(res.success).toBe(true)
  })
})
