/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
vi.mock('../src/lib/db', () => ({ db: { select: vi.fn() } }))
vi.mock('@clerk/nextjs/server', () => ({ auth: vi.fn() }))

import { db } from '../../src/lib/db'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUser } from '../../src/lib/rbac'
import { SystemRoles } from '../../src/types/rbac'

const mockRow = {
  id: 1,
  clerkUserId: 'clerk1',
  email: 'test@example.com',
  name: 'Tester',
  orgId: 1,
  organizationName: 'Acme',
  organizationSlug: 'acme',
  role: SystemRoles.DISPATCHER,
  customRoleId: 2,
  customRoleName: 'Custom',
  customPermissions: ['org:test:perm'],
  status: 'ACTIVE',
  isActive: true
}

describe('getCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns user with custom role permissions', async () => {
    const where = vi.fn().mockResolvedValueOnce([mockRow])
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn(() => ({
        innerJoin: vi.fn(() => ({
          leftJoin: vi.fn(() => ({ where }))
        }))
      }))
    } as any)
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk1' } as any)

    const user = await getCurrentUser()
    expect(user?.customRoleName).toBe('Custom')
    expect(user?.permissions).toContain('org:test:perm')
  })

  it('returns null when no user found', async () => {
    const where = vi.fn().mockResolvedValueOnce([])
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn(() => ({
        innerJoin: vi.fn(() => ({
          leftJoin: vi.fn(() => ({ where }))
        }))
      }))
    } as any)
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk1' } as any)

    const user = await getCurrentUser()
    expect(user).toBeNull()
  })
})
