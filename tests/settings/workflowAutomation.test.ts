import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateWorkflowAutomationSettingsAction } from '@/lib/actions/settings';

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

describe('updateWorkflowAutomationSettingsAction', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('updates workflow automation settings', async () => {
    const data = new FormData();
    data.set('enabled', 'true');
    data.set('approvalsRequired', 'true');
    const result = await updateWorkflowAutomationSettingsAction(data);
    expect(result).toBeUndefined();
  });
});
