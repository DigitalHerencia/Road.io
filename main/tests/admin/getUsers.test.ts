import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getUsersAction } from '@/lib/actions/admin'

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => Promise.resolve([
            { id: 1, name: 'Test', email: 't@example.com', role: 'MEMBER', isActive: true, lastLoginAt: new Date(), createdAt: new Date(), updatedAt: new Date() }
          ]))
        }))
      }))
    }))
  }
}))

vi.mock('@/lib/rbac', () => ({ requirePermission: vi.fn(async () => ({ id: '1', orgId: 1 })) }))

beforeEach(() => vi.clearAllMocks())

describe('getUsersAction', () => {
  it('returns list of users', async () => {
    const res = await getUsersAction()
    expect(res.success).toBe(true)
    expect(res.users?.length).toBe(1)
    expect(res.users?.[0].email).toBe('t@example.com')
  })
})
