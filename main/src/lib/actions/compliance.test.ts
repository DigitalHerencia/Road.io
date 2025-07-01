import { describe, it, expect } from 'vitest';
import { generateUniqueFilename } from './compliance';

describe('generateUniqueFilename', () => {
  it('creates unique names preserving extension', () => {
    const a = generateUniqueFilename('doc.pdf');
    const b = generateUniqueFilename('doc.pdf');
    expect(a).not.toBe(b);
    expect(a.endsWith('.pdf')).toBe(true);
  });
});
import { uploadDocumentsAction, searchDocumentsAction } from './compliance';
import { vi, beforeEach } from 'vitest';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    insert: () => ({ values: () => ({ returning: () => Promise.resolve([{ id: 1 }]) }) }),
    execute: vi.fn(),
  },
}));
vi.mock('@/lib/rbac', () => ({
  requirePermission: vi.fn(async () => ({ id: '1', orgId: 1 })),
}));
vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn(),
  AUDIT_ACTIONS: { DOCUMENT_UPLOAD: 'doc.upload' },
  AUDIT_RESOURCES: { DOCUMENT: 'document' },
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('fs', () => ({ promises: { mkdir: vi.fn(), writeFile: vi.fn() } }));
vi.mock('drizzle-orm', () => ({ sql: vi.fn() }));

describe('uploadDocumentsAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles multiple files', async () => {
    const formData = new FormData();
    formData.set('category', 'driver');
    formData.append('documents', new File(['a'], 'a.txt', { type: 'text/plain' }));
    formData.append('documents', new File(['b'], 'b.txt', { type: 'text/plain' }));
    const result = await uploadDocumentsAction(formData);
    expect(result.success).toBe(true);
    expect(result.documents.length).toBe(2);
  });
});

describe('searchDocumentsAction', () => {
  it('returns found documents', async () => {
    const formData = new FormData();
    formData.set('query', 'report');
    const rows = [{ id: 1, fileName: 'report.pdf' }];
    vi.mocked(db.execute).mockResolvedValue({ rows } as unknown as { rows: { id: number; fileName: string }[] });
    const result = await searchDocumentsAction(formData);
    expect(result.success).toBe(true);
    expect(result.documents[0].fileName).toBe('report.pdf');
  });
});
