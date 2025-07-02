import { describe, it, expect, vi, beforeEach } from 'vitest'
import { acceptInvitationAction } from '@/lib/actions/admin'
import { db } from '@/lib/db'

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => Promise.resolve([{ id:1, orgId:1, email:'test@example.com', role:'MEMBER', token:'tok', expiresAt: new Date(Date.now()+1000) }])) })) })),
    insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([{ id: 2 }])) })) })),
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) })) }))
  }
}))

vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn(),
  AUDIT_ACTIONS: { USER_CREATE: 'user.create' },
  AUDIT_RESOURCES: { USER: 'user' },
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('acceptInvitationAction', () => {
  it('creates user and marks invitation accepted', async () => {
    const result = await acceptInvitationAction({ token: 'tok', name: 'Test', clerkUserId: 'clerk1' })
    expect(result.success).toBe(true)
    expect(db.insert).toHaveBeenCalled()
    expect(db.update).toHaveBeenCalled()
  })
})
