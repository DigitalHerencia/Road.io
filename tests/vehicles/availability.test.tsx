import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { renderToString } from 'react-dom/server'
vi.mock('../../src/lib/db', () => ({ db: { execute: vi.fn() } }))
import { db } from '../../src/lib/db'
import * as fetchers from '../../src/lib/fetchers/vehicles'
import VehicleAvailabilityList from '../../src/features/vehicles/components/VehicleAvailabilityList'
import { AUDIT_ACTIONS, AUDIT_RESOURCES } from '../../src/lib/audit'

describe('getVehicleAvailability', () => {
  it('maps rows', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({
      rows: [
        { id: 1, make: 'Ford', model: 'F150', status: 'ACTIVE', is_assigned: false, next_maintenance_date: null },
      ],
    } as any)
    const res = await fetchers.getVehicleAvailability(1)
    expect(res[0].isAssigned).toBe(false)
  })
})

describe('getVehicleAssignmentHistory', () => {
  it('returns audit logs', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          resource: AUDIT_RESOURCES.VEHICLE,
          action: AUDIT_ACTIONS.VEHICLE_ASSIGN,
          resourceId: '1',
          details: { loadId: 2 },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    } as any)
    const res = await fetchers.getVehicleAssignmentHistory(1)
    expect(res).toHaveLength(1)
  })
})

describe('VehicleAvailabilityList', () => {
  it('renders table', async () => {
    vi.spyOn(fetchers, 'getVehicleAvailability').mockResolvedValue([
      { id: 1, make: 'Ford', model: 'F150', status: 'ACTIVE', isAssigned: false, nextMaintenanceDate: null },
    ])
    const el = await VehicleAvailabilityList({ orgId: 1 })
    const html = renderToString(el)
    expect(html).toContain('Make')
  })
})
