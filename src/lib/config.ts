import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  CLERK_SECRET_KEY: z.string(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  CLERK_WEBHOOK_SECRET: z.string(),
  ENCRYPTION_KEY: z.string().regex(/^[0-9a-f]{64}$/i, "Invalid ENCRYPTION_KEY: must be a 64-character hexadecimal string"),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.preprocess(val => parseInt(val as string, 10), z.number()),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  EMAIL_FROM: z.string(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
})

export type EnvConfig = z.infer<typeof envSchema>

export function loadEnv(env: NodeJS.ProcessEnv = process.env): EnvConfig {
  return envSchema.parse(env)
}
