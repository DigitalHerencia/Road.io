/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { listIftaReports } from '../../src/lib/fetchers/ifta'
import { db } from '../../src/lib/db'

vi.mock('@/lib/db', () => ({
  db: { select: vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn() })) })) }
}))

describe('listIftaReports', () => {
  it('queries by orgId', async () => {
    const where = vi.fn()
    vi.mocked(db.select).mockReturnValueOnce({ from: vi.fn(() => ({ where })) } as any)
    await listIftaReports(1)
    expect(where).toHaveBeenCalled()
  })
})
