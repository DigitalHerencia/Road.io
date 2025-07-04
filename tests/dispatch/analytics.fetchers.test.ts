import { describe, it, expect, vi } from 'vitest'
vi.mock('../../src/lib/db', () => ({ db: { execute: vi.fn() } }))
vi.mock('../../src/lib/rbac', () => ({ requirePermission: vi.fn() }))
import { db } from '../../src/lib/db'
import { fetchExceptionRate, fetchDriverProductivity } from '../../src/lib/fetchers/dispatch'

describe('fetchExceptionRate', () => {
  it('calculates exception rate', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ total: 10, exceptions: 2 }] } as any)
    const res = await fetchExceptionRate(1)
    expect(res.exceptionRate).toBeCloseTo(0.2, 2)
  })
})

describe('fetchDriverProductivity', () => {
  it('maps results', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ driver_id: 1, driver_name: 'A', completed: 5 }] } as any)
    const res = await fetchDriverProductivity(1)
    expect(res[0].completedLoads).toBe(5)
  })
})

