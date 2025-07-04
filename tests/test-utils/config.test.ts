import { describe, it, expect } from 'vitest'
import { loadEnv } from '../../src/lib/config'

const baseEnv: Omit<NodeJS.ProcessEnv, 'NODE_ENV'> & { NODE_ENV: 'test' } = {
  DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
  CLERK_SECRET_KEY: 'sk_test',
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test',
  CLERK_WEBHOOK_SECRET: 'whsec_test',
  ENCRYPTION_KEY: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  SMTP_HOST: 'smtp.example.com',
  SMTP_PORT: '587',
  SMTP_USER: 'user',
  SMTP_PASS: 'pass',
  EMAIL_FROM: 'noreply@test.com',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NODE_ENV: 'test', // Now correctly typed
}

describe('loadEnv', () => {
  it('parses provided environment variables', () => {
    const cfg = loadEnv(baseEnv)
    expect(cfg.DATABASE_URL).toBe(baseEnv.DATABASE_URL)
    expect(cfg.SMTP_HOST).toBe('smtp.example.com')
  })

  it('throws when a variable is missing', () => {
    const env: { [k: string]: string | undefined } = { ...baseEnv }
    delete env.DATABASE_URL
    expect(() => loadEnv(env as NodeJS.ProcessEnv)).toThrow()
  })
})
