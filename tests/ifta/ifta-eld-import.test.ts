import { describe, it, expect, vi, beforeEach } from 'vitest';
import { importEldCsvAction } from '../../src/lib/actions/ifta';

vi.mock('../../src/lib/db', () => ({
  db: {
    insert: vi.fn(() => ({ values: () => ({ returning: () => Promise.resolve([{ id: 1 }]) }) })),
  },
}));

vi.mock('../src/lib/rbac', () => ({
  requirePermission: vi.fn(async () => ({ id: '1', orgId: 1 })),
}));

vi.mock('../src/lib/audit', () => ({
  createAuditLog: vi.fn(),
  AUDIT_ACTIONS: { ELD_IMPORT: 'eld.import' },
  AUDIT_RESOURCES: { TRIP: 'trip' },
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('importEldCsvAction', () => {
  it('imports trips from csv', async () => {
    const csv = `driverId,vehicleId,loadId,startLat,startLng,startState,endLat,endLng,endState,startedAt,endedAt\n1,2,3,10,20,TX,11,21,TX,2024-01-01T00:00:00Z,2024-01-01T01:00:00Z`;
    const file = new File([csv], 'eld.csv');
    const fd = new FormData();
    fd.set('csv', file);
    const result = await importEldCsvAction(fd);
    expect(result).toBeUndefined();
  });
});
