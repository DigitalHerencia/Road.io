import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTaxRateAction, calculateTaxAction, processReceiptAction } from '../src/lib/actions/ifta';

const mockWhere = vi.fn();
vi.mock('../src/lib/db', () => ({
  db: {
    insert: vi.fn(() => ({ values: () => ({ returning: () => Promise.resolve([{ id: 1 }]) }) })),
    select: vi.fn(() => ({ from: vi.fn(() => ({ where: mockWhere })) })),
    execute: vi.fn(() => Promise.resolve({ rows: [{ count: 0 }] })),
  },
}));

vi.mock('../src/lib/rbac', () => ({ requirePermission: vi.fn(async () => ({ id: '1', orgId: 1 })) }));
vi.mock('../src/lib/audit', () => ({
  createAuditLog: vi.fn(),
  AUDIT_ACTIONS: { DOCUMENT_UPLOAD: 'document.upload' },
  AUDIT_RESOURCES: { IFTA_REPORT: 'ifta_report' },
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('fs', () => ({ promises: { mkdir: vi.fn(), writeFile: vi.fn() } }));

beforeEach(() => {
  vi.clearAllMocks();
  mockWhere.mockResolvedValueOnce([]);
});

describe('createTaxRateAction', () => {
  it('creates rate', async () => {
    const fd = new FormData();
    fd.set('state', 'TX');
    fd.set('quarter', '2024Q1');
    fd.set('rate', '50');
    fd.set('effectiveDate', '2024-01-01');
    const result = await createTaxRateAction(fd);
    expect(result.success).toBe(true);
  });
});

describe('processReceiptAction', () => {
  it('processes receipt', async () => {
    const fd = new FormData();
    fd.set('receipt', new File(['a'], 'r.png'));
    const result = await processReceiptAction(fd);
    expect(result.success).toBe(true);
  });
});

describe('calculateTaxAction', () => {
  it('returns total tax', async () => {
    mockWhere.mockResolvedValueOnce([{ state: 'TX', rate: 50 }]);
    mockWhere.mockResolvedValueOnce([{ state: 'TX', quantity: 100 }]);
    const fd = new FormData();
    fd.set('year', '2024');
    fd.set('quarter', 'Q1');
    const result = await calculateTaxAction(fd);
    expect(result.success).toBe(true);
    expect(result.totalTax).toBe(5000);
  });
});
