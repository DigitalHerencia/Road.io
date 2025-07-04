import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { renderToString } from 'react-dom/server'
vi.mock('../../src/lib/db', () => ({ db: { execute: vi.fn() } }))
vi.mock('../../src/lib/fetchers/vehicles')
import FleetDashboard from '../../src/features/vehicles/components/FleetDashboard'
import * as fetchers from '../../src/lib/fetchers/vehicles'

describe('FleetDashboard', () => {
  it('renders metrics', async () => {
    vi.mocked(fetchers.getFleetOverview).mockResolvedValue({
      total: 3,
      active: 2,
      maintenance: 1,
      retired: 0,
      maintenanceDue: 1,
      inspectionDue: 0,
    })
    const el = await FleetDashboard({ orgId: 1 })
    const html = renderToString(el)
    expect(html).toContain('Fleet Size')
    expect(html).toContain('Maintenance Due')
  })
})
