import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTrainingProgramAction } from '@/lib/actions/training'

vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([{ id: 1 }])) })) })),
  },
}))

vi.mock('@/lib/rbac', () => ({
  requirePermission: vi.fn(async () => ({ id: '1', orgId: 1 })),
}))

vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn(),
  AUDIT_ACTIONS: { TRAINING_CREATE: 'training.create' },
  AUDIT_RESOURCES: { TRAINING_PROGRAM: 'training_program' },
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

describe('createTrainingProgramAction', () => {
  beforeEach(() => { vi.clearAllMocks() })
  it('creates a program', async () => {
    const data = new FormData()
    data.set('title', 'Orientation')
    await expect(createTrainingProgramAction(data)).resolves.toBeUndefined()
  })
})
