import { describe, it, expect, vi, beforeEach } from 'vitest'
import { uploadDocumentsAction } from '@/lib/actions/compliance'

vi.mock('@/lib/db', () => ({
  db: {
    insert: () => ({ values: () => ({ returning: () => Promise.resolve([{ id: 1 }]) }) })
  }
}))
vi.mock('@/lib/rbac', () => ({ requirePermission: vi.fn(async () => ({ id: '1', orgId: 1 })) }))
vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn(),
  AUDIT_ACTIONS: { DOCUMENT_UPLOAD: 'doc.upload' },
  AUDIT_RESOURCES: { DOCUMENT: 'document' }
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('fs', () => ({ promises: { mkdir: vi.fn(), writeFile: vi.fn() } }))

beforeEach(() => vi.clearAllMocks())

describe('uploadDocumentsAction', () => {
  it('uploads multiple files', async () => {
    const form = new FormData()
    form.set('category', 'driver')
    form.append('documents', new File(['a'], 'a.pdf', { type: 'application/pdf' }))
    form.append('documents', new File(['b'], 'b.pdf', { type: 'application/pdf' }))
    const res = await uploadDocumentsAction(form)
    expect(res.success).toBe(true)
    expect(res.documents.length).toBe(2)
  })

  it('supports batch uploads across categories', async () => {
    const driver = new FormData()
    driver.set('category', 'driver')
    driver.append('documents', new File(['a'], 'a.pdf', { type: 'application/pdf' }))
    const safety = new FormData()
    safety.set('category', 'safety')
    safety.append('documents', new File(['b'], 'b.pdf', { type: 'application/pdf' }))
    const first = await uploadDocumentsAction(driver)
    const second = await uploadDocumentsAction(safety)
    expect(first.success).toBe(true)
    expect(second.success).toBe(true)
  })

  it('rejects unsupported file types', async () => {
    const form = new FormData()
    form.set('category', 'driver')
    form.append('documents', new File(['a'], 'a.exe', { type: 'application/x-msdownload' }))
    await expect(uploadDocumentsAction(form)).rejects.toThrow()
  })
})
