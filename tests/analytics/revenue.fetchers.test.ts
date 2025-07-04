import { describe, it, expect, vi } from 'vitest'
vi.mock('../../src/lib/db', () => ({ db: { execute: vi.fn() } }))
vi.mock('../../src/lib/rbac', () => ({ requirePermission: vi.fn() }))
import { db } from '../../src/lib/db'
import { fetchLoadRevenue, fetchSeasonalRevenue } from '../../src/lib/fetchers/analytics'

describe('fetchLoadRevenue', () => {
  it('returns revenue per load', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ id: 1, load_number: 'L1', revenue: 1000 }] } as any)
    const res = await fetchLoadRevenue(1)
    expect(res[0].revenue).toBe(1000)
  })
})

describe('fetchSeasonalRevenue', () => {
  it('groups revenue by month', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ period: '2024-01', total: 5000 }] } as any)
    const res = await fetchSeasonalRevenue(1)
    expect(res[0].totalRevenue).toBe(5000)
  })
})
