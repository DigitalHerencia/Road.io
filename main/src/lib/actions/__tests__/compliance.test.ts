
/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  generateUniqueFilename,
  uploadDocumentsAction,
  searchDocumentsAction,
  sendExpirationAlerts,
  sendRenewalReminders,
  markDocumentReviewed,
  recordAnnualReview,
  recordVehicleInspection,
  recordAccident,
  calculateSmsScore
  ,generateComplianceReportAction,
  exportComplianceAuditLogsAction
} from '@/lib/actions/compliance'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'

vi.mock('@/lib/db', () => ({
  db: {
    insert: () => ({ values: () => ({ returning: () => Promise.resolve([{ id: 1 }]) }) }),
    execute: vi.fn(),
    update: vi.fn()
  }
}))
vi.mock('@/lib/rbac', () => ({ requirePermission: vi.fn(async () => ({ id: '1', orgId: 1 })) }))
vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn(),
  AUDIT_ACTIONS: { DOCUMENT_UPLOAD: 'doc.upload', DOCUMENT_EXPIRATION_ALERT: 'doc.expiration', COMPLIANCE_REVIEW: 'compliance.review' },
  AUDIT_RESOURCES: { DOCUMENT: 'document', COMPLIANCE: 'compliance' }
}))
vi.mock('@/lib/email', () => ({ sendEmail: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('fs', () => ({ promises: { mkdir: vi.fn(), writeFile: vi.fn() } }))
vi.mock('drizzle-orm', () => ({ sql: vi.fn() }))
vi.mock('pdfkit', () => {
  return {
    default: vi.fn(() => ({
      pipe: vi.fn(),
      fontSize: vi.fn().mockReturnThis(),
      text: vi.fn().mockReturnThis(),
      moveDown: vi.fn(),
      end: vi.fn()
    }))
  }
})
vi.mock('@/lib/fetchers/compliance', () => ({
  getComplianceReportData: vi.fn(async () => ({
    status: { active: 1, underReview: 0 },
    annualReviews: 1,
    vehicleInspections: 1,
    accidents: 0
  })),
  listComplianceAuditLogs: vi.fn(async () => [{ id: 1, action: 'a', resource: 'document', resourceId: '1', details: {}, createdAt: new Date() }])
}))

describe('generateUniqueFilename', () => {
  it('creates unique names preserving extension', () => {
    const a = generateUniqueFilename('doc.pdf')
    const b = generateUniqueFilename('doc.pdf')
    expect(a).not.toBe(b)
    expect(a.endsWith('.pdf')).toBe(true)
  })
})

describe('uploadDocumentsAction', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('handles multiple files', async () => {
    const formData = new FormData()
    formData.set('category', 'driver')
    formData.append('documents', new File(['a'], 'a.txt', { type: 'text/plain' }))
    formData.append('documents', new File(['b'], 'b.txt', { type: 'text/plain' }))
    const result = await uploadDocumentsAction(formData)
    expect(result.success).toBe(true)
    expect(result.documents.length).toBe(2)
  })

  it('accepts expiration date', async () => {
    const formData = new FormData()
    formData.set('category', 'driver')
    formData.set('expiresAt', '2025-01-01')
    formData.append('documents', new File(['a'], 'a.txt', { type: 'text/plain' }))
    const result = await uploadDocumentsAction(formData)
    expect(result.success).toBe(true)
  })
})

describe('searchDocumentsAction', () => {
  it('returns found documents', async () => {
    const formData = new FormData()
    formData.set('query', 'report')
    const rows = [{ id: 1, fileName: 'report.pdf' }]
    vi.mocked(db.execute).mockResolvedValue({ rows } as any)
    const result = await searchDocumentsAction(formData)
    expect(result.success).toBe(true)
    expect(result.documents[0].fileName).toBe('report.pdf')
  })
})

describe('sendExpirationAlerts', () => {
  it('sends emails for expiring docs', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ id: 1, fileName: 'a.pdf', email: 'a@test.com', expiresAt: new Date() }] } as any)
    const result = await sendExpirationAlerts()
    expect(result.success).toBe(true)
    expect(result.count).toBe(1)
    expect(sendEmail).toHaveBeenCalled()
  })
})

describe('recordAnnualReview', () => {
  beforeEach(() => { vi.clearAllMocks() })
  it('creates a review record', async () => {
    const form = new FormData()
    form.set('driverId', '1')
    form.set('reviewDate', '2024-01-01')
    const result = await recordAnnualReview(form)
    expect(result.success).toBe(true)
  })
})

describe('recordVehicleInspection', () => {
  beforeEach(() => { vi.clearAllMocks() })
  it('creates an inspection record', async () => {
    const form = new FormData()
    form.set('vehicleId', '2')
    form.set('inspectionDate', '2024-01-02')
    const result = await recordVehicleInspection(form)
    expect(result.success).toBe(true)
  })
})

describe('recordAccident', () => {
  beforeEach(() => { vi.clearAllMocks() })
  it('creates an accident record', async () => {
    const form = new FormData()
    form.set('occurredAt', '2024-01-03')
    const result = await recordAccident(form)
    expect(result.success).toBe(true)
  })
})

describe('calculateSmsScore', () => {
  beforeEach(() => { vi.clearAllMocks() })
  it('returns summary counts', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ count: 1 }] } as any)
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ count: 2 }] } as any)
    const result = await calculateSmsScore(1)
    expect(result.score).toBe(1 * 2 + 2)
  })
})

describe('sendRenewalReminders', () => {
  it('sends renewal emails', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ id: 2, fileName: 'b.pdf', email: 'b@test.com', expiresAt: new Date() }] } as any)
    const result = await sendRenewalReminders()
    expect(result.success).toBe(true)
    expect(result.count).toBe(1)
    expect(sendEmail).toHaveBeenCalled()
  })
})

describe('markDocumentReviewed', () => {
  it('updates document review fields', async () => {
    vi.mocked(db.update).mockReturnValueOnce({ set: () => ({ where: () => ({ returning: () => Promise.resolve([{ id: 1 }]) }) }) } as any)
    const result = await markDocumentReviewed(1)
    expect(result.success).toBe(true)
  })
})

describe('generateComplianceReportAction', () => {
  it('creates a report and logs audit', async () => {
    const form = new FormData()
    form.set('category', 'driver')
    const result = await generateComplianceReportAction(form)
    expect(result.success).toBe(true)
  })
})

describe('exportComplianceAuditLogsAction', () => {
  it('returns csv response', async () => {
    const res = await exportComplianceAuditLogsAction(1)
    expect(res.headers.get('content-type')).toBe('text/csv')
  })
})
