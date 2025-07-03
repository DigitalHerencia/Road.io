import { describe, it, expect } from 'vitest'
import { violationSchema, certificationSchema } from '../drivers'

describe('violationSchema', () => {
  it('accepts valid data', () => {
    expect(() =>
      violationSchema.parse({ driverId: 1, type: 'Speeding' })
    ).not.toThrow()
  })

  it('rejects missing type', () => {
    expect(() => violationSchema.parse({ driverId: 1 })).toThrow()
  })
})

describe('certificationSchema', () => {
  it('accepts valid data', () => {
    expect(() =>
      certificationSchema.parse({ driverId: 1, type: 'DOT_MEDICAL' })
    ).not.toThrow()
  })

  it('rejects missing type', () => {
    expect(() => certificationSchema.parse({ driverId: 1 })).toThrow()
  })
})
