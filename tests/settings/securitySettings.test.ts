import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateSecuritySettingsAction } from '@/lib/actions/settings';

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => Promise.resolve([{ settings: {} }])) })) })),
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) })) })),
  },
}));

vi.mock('@/lib/rbac', () => ({
  requirePermission: vi.fn(async () => ({ id: '1', orgId: 1 })),
}));

vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn(),
  AUDIT_ACTIONS: { ORG_SETTINGS_UPDATE: 'org.settings.update' },
  AUDIT_RESOURCES: { ORGANIZATION: 'organization' },
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

describe('updateSecuritySettingsAction', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('updates security settings', async () => {
    const data = new FormData();
    data.set('regulatoryMode', 'true');
    data.set('documentManagement', 'true');
    data.set('auditTrails', 'true');
    const result = await updateSecuritySettingsAction(data);
    expect(result).toBeUndefined();
  });
});
