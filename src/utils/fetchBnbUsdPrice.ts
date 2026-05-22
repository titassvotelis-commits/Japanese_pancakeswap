import { INFO_CLIENT } from 'config/constants/endpoints'

type BnbUsdListener = (price: number) => void

let cachedBnbUsd = 0
let inflight: Promise<number> | null = null
const listeners = new Set<BnbUsdListener>()

function notifyListeners() {
  listeners.forEach((listener) => listener(cachedBnbUsd))
}

/** PancakeSwap subgraph — optional; hosted subgraphs are often down outside pancakeswap.finance. */
async function fetchFromPancakeSubgraph(): Promise<number> {
  const res = await fetch(INFO_CLIENT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: '{ bundle(id: "1") { bnbPrice } }',
    }),
  })
  if (!res.ok) {
    throw new Error(`Subgraph HTTP ${res.status}`)
  }
  const data = (await res.json()) as { data?: { bundle?: { bnbPrice?: string } }; errors?: unknown[] }
  if (data?.errors?.length) {
    throw new Error('Subgraph query error')
  }
  const n = parseFloat(data?.data?.bundle?.bnbPrice ?? '0')
  return Number.isFinite(n) && n > 0 ? n : 0
}

async function fetchFromCryptocompare(): Promise<number> {
  const res = await fetch('https://min-api.cryptocompare.com/data/price?fsym=BNB&tsyms=USD')
  if (!res.ok) {
    throw new Error(`CryptoCompare HTTP ${res.status}`)
  }
  const data = (await res.json()) as { USD?: number }
  const n = data?.USD ?? 0
  return Number.isFinite(n) && n > 0 ? n : 0
}

async function fetchFromCoingecko(): Promise<number> {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd',
  )
  if (!res.ok) {
    throw new Error(`Coingecko HTTP ${res.status}`)
  }
  const data = (await res.json()) as { binancecoin?: { usd?: number } }
  const n = data?.binancecoin?.usd ?? 0
  return Number.isFinite(n) && n > 0 ? n : 0
}

/** Binance blocks browser CORS — only used outside the browser (e.g. farm price scripts). */
async function fetchFromBinance(): Promise<number> {
  const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT')
  if (!res.ok) {
    throw new Error(`Binance HTTP ${res.status}`)
  }
  const data = (await res.json()) as { price?: string }
  const n = parseFloat(data?.price ?? '0')
  return Number.isFinite(n) && n > 0 ? n : 0
}

function getPriceSources(): Array<() => Promise<number>> {
  const inBrowser = typeof window !== 'undefined'
  if (inBrowser) {
    // Public price APIs first — avoids 404/403 from deprecated or origin-locked subgraphs.
    return [fetchFromCoingecko, fetchFromCryptocompare, fetchFromPancakeSubgraph]
  }
  return [fetchFromBinance, fetchFromCoingecko, fetchFromCryptocompare, fetchFromPancakeSubgraph]
}

/** Fetches BNB/USD from public APIs; result is cached for the session. */
export async function fetchBnbUsdPrice(): Promise<number> {
  if (cachedBnbUsd > 0) {
    return cachedBnbUsd
  }
  if (inflight) {
    return inflight
  }

  inflight = (async () => {
    for (const source of getPriceSources()) {
      try {
        const price = await source()
        if (price > 0) {
          cachedBnbUsd = price
          notifyListeners()
          return price
        }
      } catch {
        // try next source
      }
    }
    return 0
  })()

  try {
    return await inflight
  } finally {
    inflight = null
  }
}

export function getCachedBnbUsdPrice(): number {
  return cachedBnbUsd
}

/** Subscribe to BNB/USD updates; triggers a fetch if not cached yet. */
export function subscribeBnbUsdPrice(listener: BnbUsdListener): () => void {
  listeners.add(listener)
  listener(cachedBnbUsd)
  void fetchBnbUsdPrice()
  return () => listeners.delete(listener)
}

// Warm cache as soon as the bundle loads
void fetchBnbUsdPrice()
