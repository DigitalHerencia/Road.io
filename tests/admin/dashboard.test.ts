import { describe, it, expect, vi } from 'vitest'
vi.mock('../../src/lib/db', () => ({ db: { execute: vi.fn() } }))
vi.mock('os', () => ({
  uptime: vi.fn(() => 100),
  loadavg: vi.fn(() => [0.5]),
  totalmem: vi.fn(() => 1000),
  freemem: vi.fn(() => 200),
}))
import { db } from '../../src/lib/db'
import { fetchSystemMetrics, fetchRecentAuditLogs } from '../../src/lib/fetchers/admin'

describe('fetchSystemMetrics', () => {
  it('returns system stats', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ count: 2 }] } as any)
    const res = await fetchSystemMetrics()
    expect(res.uptime).toBe(100)
    expect(res.dbConnections).toBe(2)
  })
})

describe('fetchRecentAuditLogs', () => {
  it('returns recent logs', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ id: 1, action: 'a', resource: 'r', userId: 1, createdAt: new Date() }] } as any)
    const res = await fetchRecentAuditLogs(1, 1)
    expect(res.length).toBe(1)
    expect(res[0].action).toBe('a')
  })
})
