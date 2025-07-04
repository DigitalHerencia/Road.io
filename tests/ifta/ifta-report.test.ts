import { describe, it, expect, vi, beforeEach } from 'vitest';
const mockWhere = vi.fn();
vi.mock('../src/lib/db', () => ({
  db: {
    select: vi.fn(() => ({ from: vi.fn(() => ({ where: mockWhere })) })),
    insert: vi.fn(() => ({
      values: () => ({ returning: () => Promise.resolve([{ id: 1 }]) }),
    })),
  },
}));

vi.mock('@/lib/rbac', () => ({
  requirePermission: vi.fn(async () => ({ id: '1', orgId: 1 })),
}));

vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn(),
  AUDIT_ACTIONS: { IFTA_REPORT_GENERATE: 'ifta.report.generate' },
  AUDIT_RESOURCES: { IFTA_REPORT: 'ifta_report' },
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('fs', () => ({
  promises: { mkdir: vi.fn() },
  createWriteStream: vi.fn(() => ({ on: (_e: string, cb: () => void) => cb() })),
}));

import { generateIftaReportAction } from '../../src/lib/actions/ifta';
vi.mock('pdfkit', () => ({
  default: vi.fn().mockImplementation(() => ({
    pipe: vi.fn(),
    fontSize: vi.fn().mockReturnThis(),
    text: vi.fn().mockReturnThis(),
    moveDown: vi.fn().mockReturnThis(),
    end: vi.fn(),
  })),
}));

describe('generateIftaReportAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWhere.mockResolvedValueOnce([
      { state: 'TX', quantity: 100, purchaseDate: new Date() },
    ]);
    mockWhere.mockResolvedValueOnce([{ state: 'TX', quarter: '2024Q1', rate: 50 }]);
  });

  it('generates report successfully', async () => {
    const fd = new FormData();
    fd.set('year', '2024');
    fd.set('quarter', 'Q1');
    const result = await generateIftaReportAction(fd);
    expect(result.success).toBe(true);
  });
});
