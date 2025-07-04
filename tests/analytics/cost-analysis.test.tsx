import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { renderToString } from 'react-dom/server'
vi.mock('../../src/lib/db', () => ({ db: { execute: vi.fn() } }))
vi.mock('../../src/lib/fetchers/analytics')
import CostAnalysis from '../../src/features/analytics/components/CostAnalysis'
import * as fetchers from '../../src/lib/fetchers/analytics'

describe('CostAnalysis component', () => {
  it('renders cost cards', async () => {
    vi.mocked(fetchers.fetchFuelCost).mockResolvedValue({ totalFuelCost: 5000 })
    vi.mocked(fetchers.fetchTotalCostOfOwnership).mockResolvedValue({ loadCost: 10000, fuelCost: 5000, totalCost: 15000 })
    const element = await CostAnalysis({ orgId: 1 })
    const html = renderToString(element)
    expect(html).toContain('Fuel Cost')
    expect(html).toContain('Total Cost of Ownership')
  })
})
