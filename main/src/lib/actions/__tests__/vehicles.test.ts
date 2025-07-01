import { describe, it, expect } from 'vitest'
import { vehicleInputSchema } from '../vehicles'

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
