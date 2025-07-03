import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchLoadCompletionMetrics } from '@/lib/fetchers/dispatch'
import { clearCache } from '@/lib/cache'

vi.mock('@/lib/db', () => ({ db: { execute: vi.fn() } }))
vi.mock('@/lib/rbac', () => ({ requirePermission: vi.fn() }))
import { db } from '@/lib/db'

describe('dispatch fetcher caching', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearCache()
  })

  it('caches load completion metrics', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ total: 1, completed: 1, on_time: 1 }] } as any)
    const first = await fetchLoadCompletionMetrics(1)
    expect(first.totalLoads).toBe(1)
    const second = await fetchLoadCompletionMetrics(1)
    expect(db.execute).toHaveBeenCalledTimes(1)
    expect(second.completedLoads).toBe(1)
  })
})
