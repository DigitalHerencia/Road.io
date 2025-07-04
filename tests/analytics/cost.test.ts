import { describe, it, expect } from 'vitest'
import { calcTotalCostOfOwnership } from '../../src/lib/fetchers/analytics'

describe('calcTotalCostOfOwnership', () => {
  it('adds costs correctly', () => {
    expect(calcTotalCostOfOwnership(1000, 500)).toBe(1500)
  })
})
