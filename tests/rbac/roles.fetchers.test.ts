/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
vi.mock('../../src/lib/db', () => ({ db: { select: vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn() })) })) } }))
import { db } from '../../src/lib/db'
import { getOrgRoles } from '../../src/lib/fetchers/roles'

describe('getOrgRoles', () => {
  it('calls db.select with orgId', async () => {
    const where = vi.fn()
    vi.mocked(db.select).mockReturnValueOnce({ from: vi.fn(() => ({ where })) } as any)
    await getOrgRoles(1)
    expect(where).toHaveBeenCalled()
  })
})

