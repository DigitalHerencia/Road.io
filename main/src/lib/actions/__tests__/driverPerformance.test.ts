import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPerformanceReviewAction, assignSafetyProgramAction } from '../drivers'

vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([{ id: 1 }])) })) })),
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) })) })),
  },
}))

vi.mock('@/lib/rbac', () => ({ requirePermission: vi.fn(async () => ({ id: '1', orgId: 1 })) }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

describe('createPerformanceReviewAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  it('creates review with valid data', async () => {
    const form = new FormData()
    form.set('driverId', '1')
    form.set('score', '5')
    const result = await createPerformanceReviewAction(form)
    expect(result.success).toBe(true)
  })
})

describe('assignSafetyProgramAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  it('assigns program', async () => {
    const form = new FormData()
    form.set('driverId', '1')
    form.set('programId', '2')
    const result = await assignSafetyProgramAction(form)
    expect(result.success).toBe(true)
  })
})
