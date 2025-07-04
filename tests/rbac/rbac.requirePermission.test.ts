import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as rbac from '@/lib/rbac'
import { SystemRoles } from '@/types/rbac'

const baseUser = {
  id: '1',
  clerkUserId: 'c1',
  email: 't@example.com',
  name: 'Test',
  orgId: 1,
  organizationName: 'Org',
  organizationSlug: 'org',
  role: SystemRoles.ADMIN,
  customRoleId: null,
  customRoleName: null,
  permissions: ['manage'],
  isActive: true,
  status: 'ACTIVE' as const,
}

describe('requirePermission', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('returns user when permission exists', async () => {
    vi.spyOn(rbac, 'requireAuth').mockResolvedValue(baseUser)
    const user = await rbac.requirePermission('manage')
    expect(user.id).toBe('1')
  })

  it('throws when permission missing', async () => {
    vi.spyOn(rbac, 'requireAuth').mockResolvedValue({ ...baseUser, permissions: [] })
    await expect(rbac.requirePermission('manage')).rejects.toThrow('Permission required')
  })
})
