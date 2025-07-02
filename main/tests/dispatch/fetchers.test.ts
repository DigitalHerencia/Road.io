import { describe, it, expect, vi } from 'vitest'
import { db } from '@/lib/db'
import { searchLoads } from '@/lib/fetchers/loads'

vi.mock('@/lib/db', () => ({ db: { execute: vi.fn() } }))

describe('searchLoads', () => {
  it('builds query and returns rows', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ id: 1 }] } as any)
    const rows = await searchLoads(1, { status: 'pending' })
    expect(db.execute).toHaveBeenCalled()
    expect(rows.length).toBe(1)
  })
})
