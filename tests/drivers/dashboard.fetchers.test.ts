import { describe, it, expect, vi } from 'vitest'
vi.mock('../../src/lib/db', () => ({ db: { execute: vi.fn() } }))
vi.mock('../../src/lib/rbac', () => ({ requirePermission: vi.fn() }))
import { db } from '../../src/lib/db'
import { getDriverDashboardStats } from '../../src/lib/fetchers/drivers'

describe('getDriverDashboardStats', () => {
  it('returns dashboard metrics', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ total: 2, available: 1, on_duty: 1 }] } as any)
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ count: 5 }] } as any)
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ count: 2 }] } as any)
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ count: 3 }] } as any)
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ count: 4 }] } as any)

    const res = await getDriverDashboardStats(1)
    expect(res.totalDrivers).toBe(2)
    expect(res.scheduledLoads).toBe(5)
    expect(res.upcomingTrainings).toBe(2)
    expect(res.pendingComplianceTasks).toBe(3)
    expect(res.recentPayStatements).toBe(4)
  })
})
