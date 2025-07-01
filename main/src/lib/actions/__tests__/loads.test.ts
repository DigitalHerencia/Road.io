import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLoad } from '../loads';

vi.mock('@/lib/db', () => ({
  db: {
    insert: () => ({ values: () => ({ returning: () => Promise.resolve([{ id: 1 }]) }) }),
  },
}));

vi.mock('@/lib/rbac', () => ({
  requirePermission: vi.fn(async () => ({ id: '1', orgId: 1 })),
  getCurrentUser: vi.fn(async () => ({ id: '1', orgId: 1, role: 'DISPATCHER' })),
}));

vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn(),
  AUDIT_ACTIONS: { LOAD_CREATE: 'load.create', LOAD_STATUS_CHANGE: 'load.status' },
  AUDIT_RESOURCES: { LOAD: 'load' },
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

describe('createLoad', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates load with valid data', async () => {
    const data = new FormData();
    data.set('loadNumber', 'L100');
    data.set('pickupAddress', 'A');
    data.set('pickupTime', '2024-01-01T10:00');
    data.set('deliveryAddress', 'B');
    data.set('deliveryTime', '2024-01-02T10:00');
    const result = await createLoad(data);
    expect(result.success).toBe(true);
  });

  it('fails with invalid data', async () => {
    const data = new FormData();
    data.set('loadNumber', '');
    await expect(createLoad(data)).rejects.toThrow();
  });
});
