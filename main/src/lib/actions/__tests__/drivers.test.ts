import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateDriverStatus } from '../drivers'

vi.mock('@/lib/db', () => ({
  db: {
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([{ id: 1, status: 'ON_DUTY' }])) }))
      }))
    }))
  }
}))

vi.mock('@/lib/rbac', () => ({ requirePermission: vi.fn(async () => ({ id: '1', orgId: 1 })) }))
vi.mock('@/lib/audit', () => ({ createAuditLog: vi.fn(), AUDIT_ACTIONS: { DRIVER_UPDATE: 'driver.update' }, AUDIT_RESOURCES: { DRIVER: 'driver' } }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

describe('updateDriverStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates driver status', async () => {
    const form = new FormData()
    form.set('id', '1')
    form.set('status', 'ON_DUTY')
    const result = await updateDriverStatus(form)
    expect(result.success).toBe(true)
  })

  it('fails with invalid status', async () => {
    const form = new FormData()
    form.set('id', '1')
    form.set('status', 'BAD')
    await expect(updateDriverStatus(form)).rejects.toThrow()
  })
})
