import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
vi.mock('../../src/lib/fetchers/analytics')

import ProfitMetrics from '../../src/features/analytics/components/ProfitMetrics'
import * as fetchers from '../../src/lib/fetchers/analytics'

describe('ProfitMetrics component', () => {
  it('renders profit tables', async () => {
    vi.mocked(fetchers.fetchGrossMarginByLoad).mockResolvedValue([
      {
        id: 1, loadNumber: 'L1', revenue: 1000, fuelCost: 400, grossMargin: 600,
        loadId: undefined
      },
    ])
    vi.mocked(fetchers.fetchDriverProfitability).mockResolvedValue([
      { driverId: 2, driverName: 'Bob', revenue: 2000, fuelCost: 800, profit: 1200 },
    ])

    const element = await ProfitMetrics({ orgId: 1 })
    const html = renderToString(element)
    expect(html).toContain('Gross Margin by Load')
    expect(html).toContain('Driver Profitability')
  })
})