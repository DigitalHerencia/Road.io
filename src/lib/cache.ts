import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    unknown: any;
}, unknown>({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes
});

export function getCache<T>(key: string): T | undefined {
  return cache.get(key) as T | undefined;
}

export function setCache<T>(key: string, value: T) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cache.set(key, value as any);
}

export function invalidateCache(key: string) {
  cache.delete(key);
}

export function clearCache() {
  cache.clear();
}
