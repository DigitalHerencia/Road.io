import { describe, it, expect, vi } from 'vitest'
vi.mock('../../src/lib/db', () => ({ db: { execute: vi.fn() } }))
vi.mock('../../src/lib/rbac', () => ({ requirePermission: vi.fn() }))

import { db } from '../../src/lib/db'
import { fetchGrossMarginByLoad, fetchDriverProfitability } from '../../src/lib/fetchers/analytics'

describe('fetchGrossMarginByLoad', () => {
  it('calculates margin', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({
      rows: [{ load_id: 1, load_number: 'L1', revenue: 1000, fuel_cost: 400 }],
    } as any)
    const res = await fetchGrossMarginByLoad(1)
    expect(res[0].grossMargin).toBe(600)
  })
})

describe('fetchDriverProfitability', () => {
  it('returns profit per driver', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({
      rows: [{ driver_id: 2, driver_name: 'Bob', revenue: 2000, fuel_cost: 800 }],
    } as any)
    const res = await fetchDriverProfitability(1)
    expect(res[0].profit).toBe(1200)
  })
})
