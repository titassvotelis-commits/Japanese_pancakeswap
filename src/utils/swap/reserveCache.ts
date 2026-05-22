import { RESERVE_CACHE_TTL_MS } from './constants'

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

const reserveCache = new Map<string, CacheEntry<[string, string]>>()

export function getCachedReserves(pairAddress: string): [string, string] | undefined {
  const entry = reserveCache.get(pairAddress.toLowerCase())
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    reserveCache.delete(pairAddress.toLowerCase())
    return undefined
  }
  return entry.value
}

export function setCachedReserves(pairAddress: string, reserve0: string, reserve1: string): void {
  reserveCache.set(pairAddress.toLowerCase(), {
    value: [reserve0, reserve1],
    expiresAt: Date.now() + RESERVE_CACHE_TTL_MS,
  })
}
