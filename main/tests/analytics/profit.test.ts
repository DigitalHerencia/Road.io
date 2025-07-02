import { describe, it, expect, vi } from 'vitest'
vi.mock('../../src/lib/db', () => ({ db: { execute: vi.fn() } }))
vi.mock('../../src/lib/rbac', () => ({ requirePermission: vi.fn() }))
import { db } from '../../src/lib/db'
import { fetchDriverProfitability, fetchGrossMarginByLoad } from '../../src/lib/fetchers/analytics'

describe('fetchDriverProfitability', () => {
  it('calculates profit', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ driver_id: 1, name: 'John', revenue: 10000, fuel_cost: 4000 }] } as any)
    const res = await fetchDriverProfitability(1)
    expect(res[0].profit).toBe(6000)
  })
})

describe('fetchGrossMarginByLoad', () => {
  it('computes margin per load', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ id: 1, load_number: 'L1', assigned_driver_id: 1, distance: 100, rate: 10000 }] } as any)
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ driver_id: 1, total_cost: 5000 }] } as any)
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ driver_id: 1, total_distance: 200 }] } as any)
    const res = await fetchGrossMarginByLoad(1)
    expect(res[0].fuelCost).toBe(2500)
    expect(res[0].grossMargin).toBe(7500)
  })
})
