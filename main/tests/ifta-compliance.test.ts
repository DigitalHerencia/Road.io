import { describe, it, expect, vi } from 'vitest';
import { uploadIftaDocumentsAction, recordIftaAuditResponseAction } from '../src/lib/actions/ifta';

vi.mock('../src/lib/actions/compliance', () => ({
  uploadDocumentsAction: vi.fn(async () => ({ success: true }))
}));

vi.mock('../src/lib/db', () => ({
  db: {
    insert: vi.fn(() => ({ values: () => ({ returning: () => Promise.resolve([{ id: 1 }]) }) }))
  }
}));

vi.mock('@/lib/rbac', () => ({
  requirePermission: vi.fn(async () => ({ id: '1', orgId: 1 }))
}));

vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn(),
  AUDIT_ACTIONS: { COMPLIANCE_REVIEW: 'compliance.review' },
  AUDIT_RESOURCES: { IFTA_REPORT: 'ifta_report' }
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

describe('uploadIftaDocumentsAction', () => {
  it('calls compliance upload action', async () => {
    const fd = new FormData();
    const result = await uploadIftaDocumentsAction(fd);
    expect(result.success).toBe(true);
  });
});

describe('recordIftaAuditResponseAction', () => {
  it('stores audit response', async () => {
    const fd = new FormData();
    fd.set('question', 'q');
    fd.set('response', 'a');
    const result = await recordIftaAuditResponseAction(fd);
    expect(result.success).toBe(true);
  });
});
