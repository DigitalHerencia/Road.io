const store = new Map<string, { count: number; reset: number }>()

export function checkRateLimit(key: string, limit = 20, windowMs = 60000): boolean {
  const now = Date.now()
  const entry = store.get(key)
  if (entry && entry.reset > now) {
    if (entry.count >= limit) return false
    entry.count += 1
    return true
  }
  store.set(key, { count: 1, reset: now + windowMs })
  return true
}
