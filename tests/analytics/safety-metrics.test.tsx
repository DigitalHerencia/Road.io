import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { renderToString } from 'react-dom/server'
vi.mock('../../src/lib/fetchers/analytics')

import SafetyMetrics from '../../src/features/analytics/components/SafetyMetrics'
import * as fetchers from '../../src/lib/fetchers/analytics'

describe('SafetyMetrics component', () => {
  it('renders accident rate and incidents', async () => {
    vi.mocked(fetchers.fetchAccidentRate).mockResolvedValue({
      totalMiles: 1000,
      accidents: 2,
      accidentsPerMillionMiles: 2000,
    })
    vi.mocked(fetchers.fetchSafetyIncidents).mockResolvedValue([
      { id: 1, occurredAt: new Date('2024-01-01'), description: 'Test', injuries: false, fatalities: false },
    ])

    const element = await SafetyMetrics({ orgId: 1 })
    const html = renderToString(element)
    expect(html).toContain('Accident Rate')
    expect(html).toContain('Recent Incidents')
  })
})

