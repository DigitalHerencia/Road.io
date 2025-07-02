import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateCompanyProfileAction } from '@/lib/actions/settings';

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

vi.mock('fs', () => ({ promises: { mkdir: vi.fn(), writeFile: vi.fn() } }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

describe('updateCompanyProfileAction', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('updates profile with logo', async () => {
    const data = new FormData();
    data.set('companyName', 'Test');
    data.set('legalEntity', 'LLC');
    data.append('logo', new File(['a'], 'logo.png', { type: 'image/png' }));
    const result = await updateCompanyProfileAction(data);
    expect(result).toBeUndefined();
  });
});
