import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  updateApplicationSettingsAction,
  updateIntegrationConfigAction,
  generateIntegrationApiKey,
} from '@/lib/actions/admin'

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({ where: vi.fn(() => Promise.resolve([{ settings: {} }])) })),
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => ({ returning: vi.fn() })) })) })),
  },
}))
vi.mock('@/lib/rbac', () => ({ requireRole: vi.fn(async () => ({ id: '1', orgId: 1 })) }))
vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn(),
  AUDIT_ACTIONS: { ORG_SETTINGS_UPDATE: 'org.update' },
  AUDIT_RESOURCES: { ORGANIZATION: 'org' },
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/utils', () => ({ generateSecureToken: () => 'newkey' }))

const mockedDb = require('@/lib/db').db

beforeEach(() => {
  vi.clearAllMocks()
})

describe('updateApplicationSettingsAction', () => {
  it('updates settings', async () => {
    const form = new FormData()
    form.set('maintenanceMode', 'true')
    form.set('featureToggles', JSON.stringify({ a: true }))
    const res = await updateApplicationSettingsAction(form)
    expect(res.success).toBe(true)
    expect(mockedDb.update).toHaveBeenCalled()
  })
})

describe('updateIntegrationConfigAction', () => {
  it('updates integration config', async () => {
    const form = new FormData()
    form.set('service', 'maps')
    form.set('apiKey', 'abc')
    form.set('enabled', 'true')
    const res = await updateIntegrationConfigAction(form)
    expect(res.success).toBe(true)
    expect(mockedDb.update).toHaveBeenCalled()
  })
})

describe('generateIntegrationApiKey', () => {
  it('generates and stores key', async () => {
    const res = await generateIntegrationApiKey('maps')
    expect(res.apiKey).toBe('newkey')
    expect(mockedDb.update).toHaveBeenCalled()
  })
})
