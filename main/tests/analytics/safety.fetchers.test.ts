import { describe, it, expect, vi } from 'vitest'
vi.mock('../../src/lib/db', () => ({ db: { execute: vi.fn() } }))
vi.mock('../../src/lib/rbac', () => ({ requirePermission: vi.fn() }))

import { db } from '../../src/lib/db'
import { fetchAccidentRate, fetchSafetyIncidents } from '../../src/lib/fetchers/analytics'

describe('fetchAccidentRate', () => {
  it('calculates accidents per million miles', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ sum: 1000 }] } as any)
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ count: 2 }] } as any)
    const res = await fetchAccidentRate(1)
    const expected = 2 / (1000 / 1e6)
    expect(res.accidentsPerMillionMiles).toBeCloseTo(expected, 2)
  })
})

describe('fetchSafetyIncidents', () => {
  it('returns list of incidents', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          occurred_at: new Date('2024-01-01'),
          description: 'Test',
          injuries: false,
          fatalities: false,
        },
      ],
    } as any)
    const res = await fetchSafetyIncidents(1)
    expect(res[0].description).toBe('Test')
  })
})

