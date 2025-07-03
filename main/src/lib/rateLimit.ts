const store = new Map<string, { count: number; reset: number }>()

// Periodic cleanup to remove expired entries
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.reset <= now) {
      store.delete(key);
    }
  }
}, 60000); // Run cleanup every 60 seconds
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
