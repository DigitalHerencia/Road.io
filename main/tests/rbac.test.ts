import { describe, it, expect } from 'vitest';
import { hasPermission, hasAnyPermission, hasAllPermissions, canAccessResource } from '@/types/rbac';

const userPermissions = [
  'org:sys_profile:manage',
  'org:dispatcher:create_edit_loads',
  'org:driver:view_assigned_loads',
];

describe('RBAC utilities', () => {
  it('hasPermission returns true when permission exists', () => {
    expect(hasPermission(userPermissions, 'org:sys_profile:manage')).toBe(true);
  });

  it('hasPermission returns false when permission missing', () => {
    expect(hasPermission(userPermissions, 'org:admin:manage_users')).toBe(false);
  });

  it('hasAnyPermission returns true when at least one permission matches', () => {
    const perms = ['org:admin:manage_users', 'org:driver:view_assigned_loads'];
    expect(hasAnyPermission(userPermissions, perms)).toBe(true);
  });

  it('hasAllPermissions returns true only when all permissions match', () => {
    const perms = ['org:sys_profile:manage', 'org:driver:view_assigned_loads'];
    expect(hasAllPermissions(userPermissions, perms)).toBe(true);
    expect(
      hasAllPermissions(userPermissions, [...perms, 'org:unknown:action'])
    ).toBe(false);
  });

  it('canAccessResource builds permission string correctly', () => {
    expect(
      canAccessResource(userPermissions, 'driver', 'view_assigned_loads')
    ).toBe(true);
    expect(
      canAccessResource(userPermissions, 'driver', 'update_load_status')
    ).toBe(false);
  });
});
