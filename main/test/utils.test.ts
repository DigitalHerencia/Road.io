import { describe, it, expect } from 'vitest'
import { generateSecureToken } from '../src/lib/utils'

describe('generateSecureToken', () => {
  it('generates tokens of expected length', () => {
    const token = generateSecureToken(16)
    expect(token).toHaveLength(32)
  })
})
