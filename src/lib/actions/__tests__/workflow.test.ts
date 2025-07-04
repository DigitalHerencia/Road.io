/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createComplianceWorkflowAction,
  createComplianceTaskAction,
  completeComplianceTaskAction,
} from '../compliance'
import { db } from '@/lib/db'

vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(() => ({ values: () => ({ returning: () => Promise.resolve([{ id: 1, workflowId: 1 }]) }) })),
    update: vi.fn(() => ({ set: () => ({ where: () => ({ returning: () => Promise.resolve([{ id: 1, workflowId: 1 }]) }) }) })),
  }
}))
vi.mock('@/lib/rbac', () => ({ requirePermission: vi.fn(async () => ({ id: '1', orgId: 1 })) }))
vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn(),
  AUDIT_ACTIONS: {
    COMPLIANCE_WORKFLOW_CREATE: 'w.create',
    COMPLIANCE_TASK_CREATE: 't.create',
    COMPLIANCE_TASK_COMPLETE: 't.complete'
  },
  AUDIT_RESOURCES: { COMPLIANCE: 'compliance' }
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

describe('createComplianceWorkflowAction', () => {
  beforeEach(() => { vi.clearAllMocks() })
  it('creates workflow', async () => {
    const form = new FormData()
    form.set('name', 'Test')
    const res = await createComplianceWorkflowAction(form)
    expect(res.success).toBe(true)
  })
})

describe('createComplianceTaskAction', () => {
  beforeEach(() => { vi.clearAllMocks() })
  it('creates task', async () => {
    const form = new FormData()
    form.set('workflowId', '1')
    form.set('title', 'Do it')
    const res = await createComplianceTaskAction(form)
    expect(res.success).toBe(true)
  })
})

describe('completeComplianceTaskAction', () => {
  beforeEach(() => { vi.clearAllMocks() })
  it('marks task complete', async () => {
    const form = new FormData()
    form.set('taskId', '1')
    const res = await completeComplianceTaskAction(form)
    expect(res.success).toBe(true)
  })
})
