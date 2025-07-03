import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateSystemConfigAction } from '@/lib/actions/settings'
import { getSystemConfig } from '@/lib/fetchers/settings'

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([{ settings: { systemConfig: { maintenance: { enabled: true }, backup: { frequency: 'daily', retentionDays: 30 } } } }]))
      }))
    })),
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) })) })),
  }
}))

vi.mock('@/lib/rbac', () => ({
  requirePermission: vi.fn(async () => ({ id: '1', orgId: 1 })),
  getCurrentUser: vi.fn(async () => ({ id: '1', orgId: 1 })),
}))

vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn(),
  AUDIT_ACTIONS: { ORG_SETTINGS_UPDATE: 'org.settings.update' },
  AUDIT_RESOURCES: { ORGANIZATION: 'organization' },
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

describe('system configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates system config successfully', async () => {
    const data = new FormData()
    data.set('maintenanceEnabled', 'true')
    data.set('backupFrequency', 'daily')
    await expect(updateSystemConfigAction(data)).resolves.toBeUndefined()
  })

  it('fetches system config', async () => {
    const config = await getSystemConfig()
    expect(config?.maintenance?.enabled).toBe(true)
    expect(config?.backup?.frequency).toBe('daily')
  })
})
