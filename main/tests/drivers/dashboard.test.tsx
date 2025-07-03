import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { renderToString } from 'react-dom/server'
vi.mock('../../src/lib/actions/drivers', () => ({ getDriverDashboardAction: vi.fn() }))
import DriverDashboard from '../../src/features/drivers/components/DriverDashboard'
import { getDriverDashboardAction } from '../../src/lib/actions/drivers'

describe('DriverDashboard component', () => {
  it('renders stats', async () => {
    vi.mocked(getDriverDashboardAction).mockResolvedValue({
      totalDrivers: 2,
      availableDrivers: 1,
      onDutyDrivers: 1,
      scheduledLoads: 5,
      upcomingTrainings: 2,
      pendingComplianceTasks: 3,
      recentPayStatements: 4,
    } as any)
    const element = await DriverDashboard({ orgId: 1 })
    const html = renderToString(element)
    expect(html).toContain('Total Drivers')
    expect(html).toContain('Scheduled Loads')
  })
})
