import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateUserPreferencesAction } from '@/lib/actions/settings';

vi.mock('@/lib/db', () => ({
  db: {
    select: () => ({ from: () => ({ where: () => [] }) }),
    insert: () => ({ values: () => Promise.resolve([{ id: 1 }]) }),
    update: () => ({ set: () => ({ where: () => Promise.resolve() }) }),
  },
}));

vi.mock('@/lib/rbac', () => ({
  requireAuth: vi.fn(async () => ({ id: '1', orgId: 1 })),
}));

vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn(),
  AUDIT_ACTIONS: { USER_UPDATE: 'user.update' },
  AUDIT_RESOURCES: { USER: 'user' },
}));

describe('updateUserPreferencesAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates preferences successfully', async () => {
    const data = new FormData();
    data.set('displayName', 'Test');
    data.set('theme', 'dark');
    await expect(updateUserPreferencesAction(data)).resolves.toBeUndefined();
  });
});
