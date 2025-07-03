import { describe, it, expect, vi, beforeEach } from 'vitest'
import { bulkUpdateUsersAction } from '@/lib/actions/admin'
import { db } from '@/lib/db'

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([{ id: 1 }, { id: 2 }])),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([{ id: 1 }, { id: 2 }])),
        })),
      })),
    })),
  },
}))

vi.mock('@/lib/rbac', () => ({
  requirePermission: vi.fn(async () => ({ id: '1', orgId: 1 })),
}))

vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn(),
  AUDIT_ACTIONS: { USER_BULK_UPDATE: 'user.bulk_update' },
  AUDIT_RESOURCES: { USER: 'user' },
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('bulkUpdateUsersAction', () => {
  it('updates users in one query', async () => {
    const result = await bulkUpdateUsersAction({ userIds: [1, 2], action: 'deactivate' })
    expect(result.success).toBe(true)
    expect(result.updatedCount).toBe(2)
    expect(db.update).toHaveBeenCalledTimes(1)
  })
})
