import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generatePayStatementAction } from '@/lib/actions/payroll'

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => Promise.resolve([{ total: 100 }])),
    insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([{ id: 1 }])) })) })),
  },
}))

vi.mock('@/lib/rbac', () => ({
  requirePermission: vi.fn(async () => ({ id: '1', orgId: 1 })),
}))

vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn(),
  AUDIT_ACTIONS: { PAY_STATEMENT_CREATE: 'pay_statement.create' },
  AUDIT_RESOURCES: { PAY_STATEMENT: 'pay_statement' },
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

describe('generatePayStatementAction', () => {
  beforeEach(() => { vi.clearAllMocks() })
  it('calculates net pay', async () => {
    const data = new FormData()
    data.set('driverId', '1')
    data.set('periodStart', '2024-01-01')
    data.set('periodEnd', '2024-01-07')
    data.set('miles', '1000')
    data.set('ratePerMile', '50')
    data.set('perDiem', '200')
    const res = await generatePayStatementAction(data)
    expect(res.success).toBe(true)
  })
})
