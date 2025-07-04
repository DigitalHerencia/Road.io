import crypto from 'crypto'

const algorithm = 'aes-256-gcm'
const ivLength = 16

function getKey(key?: string) {
  const secret = key ?? process.env.ENCRYPTION_KEY
  if (!secret) throw new Error('ENCRYPTION_KEY not set')
  return Buffer.from(secret, 'hex')
}

export function encryptString(value: string, key?: string): string {
  const secret = getKey(key)
  const iv = crypto.randomBytes(ivLength)
  const cipher = crypto.createCipheriv(algorithm, secret, iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `enc:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decryptString(payload: string, key?: string): string {
  if (!payload.startsWith('enc:')) return payload
  const secret = getKey(key)
  const segments = payload.split(':')
  if (segments.length !== 4) {
    throw new Error('Malformed payload: incorrect number of segments')
  }
  const [, ivHex, tagHex, dataHex] = segments
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const decipher = crypto.createDecipheriv(algorithm, secret, iv)
  decipher.setAuthTag(tag)
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()])
  return decrypted.toString('utf8')
}
