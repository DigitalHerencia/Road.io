import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { renderToString } from 'react-dom/server'

vi.mock('../../src/lib/actions/analytics', () => ({
  getLiveFleetStatusAction: vi.fn().mockResolvedValue({ activeLoads: 1, availableDrivers: 1, activeVehicles: 1 }),
  getPerformanceAlertsAction: vi.fn().mockResolvedValue([]),
}))
vi.mock('../../src/lib/rbac', () => ({ requirePermission: vi.fn() }))

import LiveFleetDashboard from '../../src/features/analytics/components/LiveFleetDashboard'

describe('LiveFleetDashboard component', () => {
  it('renders loading state', () => {
    const element = <LiveFleetDashboard orgId={1} />
    const html = renderToString(element)
    expect(html).toContain('Loading')
  })
})
