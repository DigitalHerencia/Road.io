import { describe, it, expect, vi } from 'vitest'
import {
  getFuelEfficiencyAction,
  getRouteEfficiencyAction,
  getTaxOptimizationAction,
} from '../src/lib/actions/ifta'
import * as fetchers from '../src/lib/fetchers/ifta'

vi.mock('../src/lib/fetchers/ifta')

describe('ifta analytics actions', () => {
  it('gets fuel efficiency', async () => {
    vi.mocked(fetchers.fetchFuelEfficiency).mockResolvedValue({ totalMiles: 1000, totalGallons: 100, mpg: 10 })
    const res = await getFuelEfficiencyAction({ orgId: 1 })
    expect(res.mpg).toBe(10)
    expect(fetchers.fetchFuelEfficiency).toHaveBeenCalledWith(1)
  })

  it('gets route efficiency', async () => {
    vi.mocked(fetchers.fetchRouteEfficiency).mockResolvedValue({ tripCount: 5, averageDistance: 200 })
    const res = await getRouteEfficiencyAction({ orgId: 1 })
    expect(res.tripCount).toBe(5)
    expect(fetchers.fetchRouteEfficiency).toHaveBeenCalledWith(1)
  })

  it('gets tax optimization states', async () => {
    vi.mocked(fetchers.fetchTaxEfficientStates).mockResolvedValue([{ state: 'TX', rate: 50 }])
    const res = await getTaxOptimizationAction({ orgId: 1 })
    expect(res[0].state).toBe('TX')
    expect(fetchers.fetchTaxEfficientStates).toHaveBeenCalledWith(1)
  })

  it('validates orgId', async () => {
    await expect(getFuelEfficiencyAction({ orgId: 0 } as any)).rejects.toThrow()
  })
})
