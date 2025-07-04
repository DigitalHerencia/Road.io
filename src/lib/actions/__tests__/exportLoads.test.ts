import { describe, it, expect, vi, beforeEach } from 'vitest'
import { bulkExportLoads } from '../loads'

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: () => ({
        where: vi.fn(() => Promise.resolve([
          {
            loadNumber: 'L1',
            status: 'pending',
            pickupLocation: { address: 'A' },
            deliveryLocation: { address: 'B' },
            rate: 100,
          },
        ])),
      }),
    })),
  },
}))
vi.mock('@/lib/rbac', () => ({ requirePermission: vi.fn(async () => ({ id: '1', orgId: 1 })) }))

describe('bulkExportLoads', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  it('returns csv response', async () => {
    const res = await bulkExportLoads([1])
    expect(res.headers.get('content-type')).toBe('text/csv')
  })
})
