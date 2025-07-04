import { describe, it, expect, vi } from 'vitest'
import { getMobileDispatchReportAction } from '@/lib/actions/dispatch'
import * as fetchers from '@/lib/fetchers/dispatch'

vi.mock('@/lib/fetchers/dispatch')

describe('getMobileDispatchReportAction', () => {
  it('aggregates dispatch metrics', async () => {
    vi.mocked(fetchers.fetchDispatchKPIs).mockResolvedValue({
      activeLoads: 1,
      completedLoads: 2,
      onTimeRate: 0.5,
      exceptionRate: 0.1,
    })
    vi.mocked(fetchers.fetchLoadCompletionMetrics).mockResolvedValue({
      totalLoads: 2,
      completedLoads: 2,
      onTimeDeliveries: 1,
      onTimeRate: 0.5,
    })
    vi.mocked(fetchers.fetchDriverProductivity).mockResolvedValue([])
    vi.mocked(fetchers.fetchExceptionRate).mockResolvedValue({
      totalLoads: 2,
      exceptionLoads: 0,
      exceptionRate: 0,
    })

    const report = await getMobileDispatchReportAction({ orgId: 1 })
    expect(report.kpis.activeLoads).toBe(1)
    expect(fetchers.fetchDriverProductivity).toHaveBeenCalledWith(1)
    expect(report.loadCompletion.totalLoads).toBe(2)
  })
})
