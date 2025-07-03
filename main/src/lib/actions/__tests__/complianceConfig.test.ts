/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateComplianceConfigAction, recordHazmatEndorsementAction } from '../compliance'
import { db } from '@/lib/db'

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => Promise.resolve([{ settings: {} }])) })) })),
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) })) })),
    insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([{ id: 1 }])) })) }))
  }
}))
vi.mock('@/lib/rbac', () => ({ requirePermission: vi.fn(async () => ({ id: '1', orgId: 1 })) }))
vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn(),
  AUDIT_ACTIONS: { ORG_SETTINGS_UPDATE: 'org.update', DRIVER_UPDATE: 'driver.update' },
  AUDIT_RESOURCES: { ORGANIZATION: 'org', DRIVER: 'driver' }
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

describe('updateComplianceConfigAction', () => {
  beforeEach(() => { vi.clearAllMocks() })
  it('updates config', async () => {
    const form = new FormData()
    form.set('dotRules', 'true')
    form.set('environmental', 'true')
    form.set('emergencyContact', '911')
    await updateComplianceConfigAction(form)
    expect(db.update).toHaveBeenCalled()
  })
})

describe('recordHazmatEndorsementAction', () => {
  beforeEach(() => { vi.clearAllMocks() })
  it('records endorsement', async () => {
    const form = new FormData()
    form.set('driverId', '1')
    await recordHazmatEndorsementAction(form)
    expect(db.insert).toHaveBeenCalled()
  })
})
