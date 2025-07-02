import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { renderToString } from 'react-dom/server'
vi.mock('../../src/lib/fetchers/analytics')
import RevenueMetrics from '../../src/features/analytics/components/RevenueMetrics'
import * as fetchers from '../../src/lib/fetchers/analytics'

describe('RevenueMetrics component', () => {
  it('renders revenue tables', async () => {
    vi.mocked(fetchers.fetchLoadRevenue).mockResolvedValue([
      { id: 1, loadNumber: 'L1', revenue: 1000 },
    ])
    vi.mocked(fetchers.fetchSeasonalRevenue).mockResolvedValue([
      { period: '2024-01', totalRevenue: 1000 },
    ])

    const element = await RevenueMetrics({ orgId: 1 })
    const html = renderToString(element)
    expect(html).toContain('Load Revenue')
    expect(html).toContain('Seasonal Revenue Trends')
  })
})
