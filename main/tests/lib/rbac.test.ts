import { describe, it, expect } from 'vitest';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/types/rbac';

const permissions = [
  'org:sys_profile:manage',
  'org:admin:manage_users_and_roles',
  'org:dispatcher:create_edit_loads',
];

describe('permission helpers', () => {
  it('checks single permission', () => {
    expect(hasPermission(permissions, 'org:sys_profile:manage')).toBe(true);
    expect(hasPermission(permissions, 'org:driver:log_hos')).toBe(false);
  });

  it('checks any permission', () => {
    expect(
      hasAnyPermission(permissions, [
        'org:driver:log_hos',
        'org:admin:manage_users_and_roles',
      ])
    ).toBe(true);
  });

  it('checks all permissions', () => {
    expect(
      hasAllPermissions(permissions, [
        'org:sys_profile:manage',
        'org:admin:manage_users_and_roles',
      ])
    ).toBe(true);
    expect(
      hasAllPermissions(permissions, [
        'org:sys_profile:manage',
        'org:driver:log_hos',
      ])
    ).toBe(false);
  });
});
