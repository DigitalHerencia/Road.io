import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { renderToString } from 'react-dom/server'
vi.mock('../../src/lib/fetchers/analytics')
import ProfitMetrics from '../../src/features/analytics/components/ProfitMetrics'
import * as fetchers from '../../src/lib/fetchers/analytics'

describe('ProfitMetrics component', () => {
  it('renders tables', async () => {
    vi.mocked(fetchers.fetchGrossMarginByLoad).mockResolvedValue([
      { id: 1, loadNumber: 'L1', revenue: 10000, fuelCost: 2000, grossMargin: 8000 },
    ])
    vi.mocked(fetchers.fetchDriverProfitability).mockResolvedValue([
      { driverId: 1, driverName: 'John', revenue: 10000, fuelCost: 2000, profit: 8000 },
    ])
    const element = await ProfitMetrics({ orgId: 1 })
    const html = renderToString(element)
    expect(html).toContain('Gross Margin by Load')
    expect(html).toContain('Driver Profitability')
  })
})
