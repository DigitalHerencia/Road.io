import { describe, it, expect } from 'vitest'
import { generateSecureToken, safeParseJSON } from '../../src/lib/utils'

describe('generateSecureToken', () => {
  it('generates tokens of expected length', () => {
    const token = generateSecureToken(16)
    expect(token).toHaveLength(32)
  })
})

describe('safeParseJSON', () => {
  it('returns parsed object', () => {
    const res = safeParseJSON<{ a: number }>("{\"a\":1}")
    expect(res?.a).toBe(1)
  })

  it('returns null on invalid input', () => {
    const res = safeParseJSON('{bad}')
    expect(res).toBeNull()
  })
})
