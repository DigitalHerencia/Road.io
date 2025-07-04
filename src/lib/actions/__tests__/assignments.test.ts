import { describe, it, expect, vi, beforeEach } from 'vitest'
import { assignLoad } from '../assignments'
import { db } from '@/lib/db'

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({ from: () => ({ where: vi.fn(() => Promise.resolve([{ id: 1, status: 'pending' }])) }) })),
    update: vi.fn(() => ({ set: () => ({ where: () => ({ returning: () => Promise.resolve([{ id: 1, status: 'assigned' }]) }) }) })),
    execute: vi.fn(() => Promise.resolve({ rows: [] }))
  }
}))

vi.mock('@/lib/rbac', () => ({ requirePermission: vi.fn(async () => ({ id: '1', orgId: 1 })) }))
vi.mock('@/lib/audit', () => ({ createAuditLog: vi.fn(), AUDIT_ACTIONS: { LOAD_ASSIGN: 'load.assign' }, AUDIT_RESOURCES: { LOAD: 'load' } }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

describe('assignLoad', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns error when conflict detected', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({
      rows: [ { id: 1 } ],
      fields: [],
      command: '',
      rowCount: 0,
      rowAsArray: false
    })
    const form = new FormData()
    form.set('driverId', '2')
    form.set('vehicleId', '3')
    const result = await assignLoad(1, form)
    expect(result.success).toBe(false)
  })

  it('assigns when no conflict', async () => {
    const form = new FormData()
    form.set('driverId', '2')
    form.set('vehicleId', '3')
    const result = await assignLoad(1, form)
    expect(result.success).toBe(true)
  })
})
