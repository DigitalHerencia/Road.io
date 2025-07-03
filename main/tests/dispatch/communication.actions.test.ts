import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  sendDriverMessageAction,
  broadcastEmergencyAlertAction,
  sendCustomerNotificationAction,
} from '@/lib/actions/dispatch'

vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([{ id: 1 }])) })) })),
    select: vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => Promise.resolve([{ id: 1 }])) })) })),
  },
}))
vi.mock('@/lib/rbac', () => ({ requirePermission: vi.fn(async () => ({ id: '1', orgId: 1 })) }))
vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn(),
  AUDIT_ACTIONS: { MESSAGE_SEND: 'm', EMERGENCY_ALERT: 'e', CUSTOMER_NOTIFICATION: 'c' },
  AUDIT_RESOURCES: { DRIVER: 'driver', LOAD: 'load' },
}))
vi.mock('@/lib/fetchers/settings', () => ({ getIntegrationSettings: vi.fn(async () => null) }))
vi.mock('@/lib/email', () => ({ sendEmail: vi.fn() }))

type DB = typeof import('@/lib/db').db
const mockedDb: DB = require('@/lib/db').db

beforeEach(() => { vi.clearAllMocks() })

describe('sendDriverMessageAction', () => {
  it('stores a message', async () => {
    const res = await sendDriverMessageAction({ driverId: 1, message: 'hi' })
    expect(res.success).toBe(true)
    expect(mockedDb.insert).toHaveBeenCalled()
  })
})

describe('broadcastEmergencyAlertAction', () => {
  it('creates messages for drivers', async () => {
    const res = await broadcastEmergencyAlertAction({ message: 'alert' })
    expect(res.success).toBe(true)
    expect(mockedDb.insert).toHaveBeenCalled()
  })
})

describe('sendCustomerNotificationAction', () => {
  it('sends an email', async () => {
    const res = await sendCustomerNotificationAction({ loadId: 1, email: 'a@b.com', message: 'update', type: 'status' })
    expect(res.success).toBe(true)
    const { sendEmail } = require('@/lib/email')
    expect(sendEmail).toHaveBeenCalled()
  })
})
