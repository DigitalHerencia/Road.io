import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  vehicleInputSchema,
  maintenanceRecordSchema,
  createVehicle,
  recordVehicleMaintenance,
  recordVehicleTelematics,
} from '../vehicles'

vi.mock('@/lib/db', () => ({
  db: {
    insert: () => ({ values: () => ({ returning: () => Promise.resolve([{ id: 1 }]) }) }),
  },
}))

vi.mock('@/lib/rbac', () => ({ requirePermission: vi.fn(async () => ({ id: '1', orgId: 1 })) }))

vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn(),
  AUDIT_ACTIONS: {
    VEHICLE_CREATE: 'vehicle.create',
    VEHICLE_MAINTENANCE: 'vehicle.maintenance',
    VEHICLE_TELEMATICS: 'vehicle.telematics',
  },
  AUDIT_RESOURCES: { VEHICLE: 'vehicle' },
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))
vi.mock('@/lib/fetchers/vehicles', () => ({ VEHICLE_CACHE_TAG: 'vehicles' }))

describe('vehicleInputSchema', () => {
  it('accepts valid data', () => {
    expect(() =>
      vehicleInputSchema.parse({
        vin: '1FTFW1EF1EFA00001',
        licensePlate: 'ABC123',
        make: 'Ford',
        model: 'F150',
        year: 2020
      })
    ).not.toThrow()
  })

  it('rejects invalid data', () => {
    expect(() => vehicleInputSchema.parse({ vin: '', licensePlate: '' })).toThrow()
  })
})

describe('maintenanceRecordSchema', () => {
  it('accepts valid data', () => {
    expect(() =>
      maintenanceRecordSchema.parse({
        maintenanceDate: new Date().toISOString(),
        mileage: 120000,
        vendor: 'Shop',
        cost: 25000,
      })
    ).not.toThrow()
  })

  it('rejects invalid date', () => {
    expect(() => maintenanceRecordSchema.parse({ maintenanceDate: '' })).toThrow()
  })
})

describe('createVehicle', () => {
  beforeEach(() => vi.clearAllMocks())
  it('inserts vehicle with valid data', async () => {
    const data = {
      vin: '1',
      licensePlate: 'A',
      make: 'Ford',
      model: 'F150',
      year: 2020,
    }
    const result = await createVehicle(data)
    expect(result.success).toBe(true)
  })
})

describe('recordVehicleMaintenance', () => {
  beforeEach(() => vi.clearAllMocks())
  it('creates maintenance record', async () => {
    const res = await recordVehicleMaintenance(1, { maintenanceDate: new Date() })
    expect(res.success).toBe(true)
  })
})

describe('recordVehicleTelematics', () => {
  beforeEach(() => vi.clearAllMocks())
  it('handles invalid json', async () => {
    const form = new FormData()
    form.set('vehicleId', '1')
    form.set('data', '{bad}')
    const result = await recordVehicleTelematics(form)
    expect(result.success).toBe(true)
  })
})
