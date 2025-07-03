import { describe, it, expect } from 'vitest'
import { encryptString, decryptString } from '@/lib/encryption'

const key = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'

describe('encryption', () => {
  it('encrypts and decrypts properly', () => {
    const encrypted = encryptString('secret', key)
    const decrypted = decryptString(encrypted, key)
    expect(decrypted).toBe('secret')
  })
})
