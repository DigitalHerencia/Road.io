import { describe, it, expect, vi } from 'vitest'
vi.mock('../../src/lib/db', () => ({ db: { execute: vi.fn(), select: vi.fn(() => ({ where: vi.fn(() => ({ orderBy: vi.fn() })) })) } }))
import { db } from '../../src/lib/db'
import * as fetchers from '../../src/lib/fetchers/vehicles'

describe('getFleetOverview', () => {
  it('returns counts', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ count: 3 }] } as any)
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ status: 'ACTIVE', count: 2 }, { status: 'MAINTENANCE', count: 1 }] } as any)
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ count: 1 }] } as any)
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ count: 0 }] } as any)
    const res = await fetchers.getFleetOverview(1)
    expect(res.total).toBe(3)
    expect(res.active).toBe(2)
    expect(res.maintenance).toBe(1)
    expect(res.retired).toBe(0)
    expect(res.maintenanceDue).toBe(1)
  })
})

describe('getVehicleList', () => {
  it('queries with orgId', async () => {
    const where = vi.fn(() => ({ orderBy: vi.fn() }))
    vi.mocked(db.select).mockReturnValueOnce({ from: vi.fn(() => ({ where })) } as any)
    await fetchers.getVehicleList(1, 'make')
    expect(where).toHaveBeenCalled()
  })
})
