import LRU from 'lru-cache';

const cache = new LRU<string, unknown>({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes
});

export function getCache<T>(key: string): T | undefined {
  return cache.get(key) as T | undefined;
}

export function setCache<T>(key: string, value: T) {
  cache.set(key, value);
}

export function invalidateCache(key: string) {
  cache.delete(key);
}

export function clearCache() {
  cache.clear();
}
