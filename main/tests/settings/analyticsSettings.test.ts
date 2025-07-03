import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateAnalyticsSettingsAction } from '@/lib/actions/settings';

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

describe('updateAnalyticsSettingsAction', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('updates analytics settings', async () => {
    const data = new FormData();
    data.set('usageTracking', 'true');
    data.set('optimizationInsights', 'true');
    data.set('performanceMonitoring', 'true');
    data.set('errorTracking', 'true');
    const result = await updateAnalyticsSettingsAction(data);
    expect(result).toBeUndefined();
  });
});
