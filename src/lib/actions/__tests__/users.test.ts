import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateUserAction, bulkUpdateStatusAction } from '../users'

vi.mock('@/lib/db', () => ({
  db: {
    update: () => ({ set: () => ({ where: () => ({}) }) }),
  },
}))

vi.mock('@/lib/rbac', () => ({
  requirePermission: vi.fn(async () => ({ id: '1', orgId: 1 })),
}))

vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn(),
  AUDIT_ACTIONS: { USER_UPDATE: 'user.update' },
  AUDIT_RESOURCES: { USER: 'user' },
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

describe('updateUserAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates user with valid data', async () => {
    const form = new FormData()
    form.set('id', '1')
    form.set('email', 'a@test.com')
    form.set('role', 'ADMIN')
    form.set('status', 'ACTIVE')
    const result = await updateUserAction(form)
    expect(result.success).toBe(true)
  })

  it('fails with invalid email', async () => {
    const form = new FormData()
    form.set('id', '1')
    form.set('email', 'bad')
    form.set('role', 'ADMIN')
    form.set('status', 'ACTIVE')
    await expect(updateUserAction(form)).rejects.toThrow()
  })
})

describe('bulkUpdateStatusAction', () => {
  it('updates multiple users', async () => {
    const result = await bulkUpdateStatusAction({ ids: [1,2], status: 'INACTIVE' })
    expect(result.success).toBe(true)
  })
})

