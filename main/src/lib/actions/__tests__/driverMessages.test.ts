import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendDriverMessage } from '../drivers'

vi.mock('@/lib/fetchers/drivers', () => ({
  createDriverMessage: vi.fn(() => Promise.resolve({ id: 1 })),
  fetchDriverMessages: vi.fn(),
}))
vi.mock('@/lib/rbac', () => ({ requirePermission: vi.fn(async () => ({ orgId: 1 })) }))
vi.mock('@/lib/audit', () => ({ createAuditLog: vi.fn(), AUDIT_ACTIONS: {}, AUDIT_RESOURCES: {} }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

describe('sendDriverMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends valid message', async () => {
    const form = new FormData()
    form.set('driverId', '1')
    form.set('sender', 'DISPATCH')
    form.set('message', 'test')
    const result = await sendDriverMessage(form)
    expect(result.success).toBe(true)
  })

  it('rejects empty message', async () => {
    const form = new FormData()
    form.set('driverId', '1')
    form.set('message', '')
    await expect(sendDriverMessage(form)).rejects.toThrow()
  })
})
