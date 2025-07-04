/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
vi.mock('../../src/lib/db', () => ({ db: { execute: vi.fn(), select: vi.fn(() => ({ where: vi.fn(() => ({ orderBy: vi.fn() })) })) } }))
import { db } from '../../src/lib/db'
import * as fetchers from '../../src/lib/fetchers/vehicles'

describe('getFleetOverview', () => {
  it('returns counts', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ count: 3 }] } as any)
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ status: 'ACTIVE', count: 2 }, { status: 'MAINTENANCE', count: 1 }] } as any)
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ count: 1 }] } as any)
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ count: 0 }] } as any)
    const res = await fetchers.getFleetOverview(1)
    expect(res.total).toBe(3)
    expect(res.active).toBe(2)
    expect(res.maintenance).toBe(1)
    expect(res.retired).toBe(0)
    expect(res.maintenanceDue).toBe(1)
  })
})

describe('getVehicleList', () => {
  it('queries with orgId', async () => {
    const where = vi.fn(() => ({ orderBy: vi.fn() }))
    vi.mocked(db.select).mockReturnValueOnce({ from: vi.fn(() => ({ where })) } as any)
    await fetchers.getVehicleList()
    expect(where).toHaveBeenCalled()
  })
})

describe('getVehicleById', () => {
  it('calls where', async () => {
    const where = vi.fn(() => Promise.resolve([{ id: 1 }]))
    vi.mocked(db.select).mockReturnValueOnce({ from: vi.fn(() => ({ where })) } as any)
    await fetchers.getVehicleById(1)
    expect(where).toHaveBeenCalled()
  })
})

describe('listVehicleMaintenance', () => {
  it('maps rows', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ id: 1, vehicleId: 1, maintenanceDate: new Date(), mileage: 10, vendor: 'A', description: null, cost: 5 }] } as any)
    const res = await fetchers.listVehicleMaintenance(1)
    expect(res[0].id).toBe(1)
  })
})

describe('getMaintenanceAlerts', () => {
  it('returns alerts', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({ rows: [{ id: 1, next_maintenance_date: new Date() }] } as any)
    const res = await fetchers.getMaintenanceAlerts(1)
    expect(res).toHaveLength(1)
  })
})
