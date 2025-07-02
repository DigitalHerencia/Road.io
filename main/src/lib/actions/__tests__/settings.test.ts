import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateIntegrationSettingsAction, updateNotificationSettingsAction } from '../settings'

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: () => ({
        where: vi.fn(() => Promise.resolve([{ settings: {} }]))
      })
    })),
    update: vi.fn(() => ({
      set: () => ({ where: () => Promise.resolve() })
    }))
  }
}))

vi.mock('@/lib/rbac', () => ({ requirePermission: vi.fn(async () => ({ id: '1', orgId: 1 })) }))
vi.mock('@/lib/audit', () => ({ createAuditLog: vi.fn(), AUDIT_ACTIONS: { ORG_SETTINGS_UPDATE: 'org.update' }, AUDIT_RESOURCES: { ORGANIZATION: 'org' } }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

describe('updateIntegrationSettingsAction', () => {
  beforeEach(() => { vi.clearAllMocks() })
  it('updates integration settings', async () => {
    const form = new FormData()
    form.set('eldApiKey', 'key')
    const result = await updateIntegrationSettingsAction(form)
    expect(result.success).toBe(true)
  })
})

describe('updateNotificationSettingsAction', () => {
  beforeEach(() => { vi.clearAllMocks() })
  it('updates notification settings', async () => {
    const form = new FormData()
    form.set('emailEnabled', 'true')
    form.set('escalationEmail', 'a@test.com')
    const res = await updateNotificationSettingsAction(form)
    expect(res.success).toBe(true)
  })
  it('fails with invalid email', async () => {
    const form = new FormData()
    form.set('emailEnabled', 'true')
    form.set('escalationEmail', 'bad')
    await expect(updateNotificationSettingsAction(form)).rejects.toThrow()
  })
})
