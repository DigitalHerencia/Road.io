import { describe, it, expect, vi, beforeEach } from 'vitest'
import { inviteUserAction } from '@/lib/actions/admin'

vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{ id: 1 }]))
      }))
    }))
  }
}))
vi.mock('@/lib/rbac', () => ({ requirePermission: vi.fn(async () => ({ id: '1', orgId: 1, organizationName: 'Acme' })) }))
vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn(),
  AUDIT_ACTIONS: { USER_INVITE: 'invite' },
  AUDIT_RESOURCES: { USER: 'user' }
}))
vi.mock('@/lib/email', () => ({ sendEmail: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/utils', () => ({ generateSecureToken: () => 'tok' }))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('inviteUserAction', () => {
  it('sends an invitation email', async () => {
    const form = new FormData()
    form.set('email', 'test@example.com')
    form.set('role', 'MEMBER')
    const res = await inviteUserAction(form)
    expect(res.success).toBe(true)
    const { sendEmail } = require('@/lib/email')
    expect(sendEmail).toHaveBeenCalled()
  })
})
