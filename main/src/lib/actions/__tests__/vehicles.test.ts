import { describe, it, expect } from 'vitest'
import { vehicleInputSchema, maintenanceRecordSchema } from '../vehicles'

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
