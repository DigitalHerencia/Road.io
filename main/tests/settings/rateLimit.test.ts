import { describe, it, expect } from 'vitest'
import { checkRateLimit } from '@/lib/rateLimit'

describe('checkRateLimit', () => {
  it('limits based on threshold', () => {
    const key = 'test'
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(key, 5, 1000)).toBe(true)
    }
    expect(checkRateLimit(key, 5, 1000)).toBe(false)
  })
})
