export const COINGECKO_CHART_PREFIX = 'COINGECKO:'

type ChartCandle = {
  time: number
  open: number
  high: number
  low: number
  close: number
}

type ChartTicker = {
  lastPrice: number
  priceChangePercent: number
  highPrice: number
  lowPrice: number
}

export type CoingeckoChartLegs = {
  coinId: string
  vsCurrency: string
}

export function makeCoingeckoChartPair(coinId: string, vsCurrency: string): string {
  return `${COINGECKO_CHART_PREFIX}${coinId}/${vsCurrency}`
}

export function parseCoingeckoChartPair(binancePair: string): CoingeckoChartLegs | null {
  if (!binancePair.startsWith(COINGECKO_CHART_PREFIX)) {
    return null
  }
  const [coinId, vsCurrency] = binancePair.slice(COINGECKO_CHART_PREFIX.length).split('/')
  if (!coinId || !vsCurrency) {
    return null
  }
  return { coinId, vsCurrency }
}

function intervalToDays(interval: string): number {
  switch (interval) {
    case '1m':
    case '5m':
    case '15m':
      return 1
    case '1h':
      return 7
    case '4h':
      return 30
    case '1d':
      return 90
    default:
      return 7
  }
}

function intervalToSeconds(interval: string): number {
  switch (interval) {
    case '1m':
      return 60
    case '5m':
      return 300
    case '15m':
      return 900
    case '1h':
      return 3600
    case '4h':
      return 14400
    case '1d':
      return 86400
    default:
      return 900
  }
}

function aggregatePricesToCandles(prices: [number, number][], intervalSec: number): ChartCandle[] {
  const buckets = new Map<number, number[]>()

  prices.forEach(([ms, price]) => {
    if (!Number.isFinite(price) || price <= 0) {
      return
    }
    const bucket = Math.floor(ms / 1000 / intervalSec) * intervalSec
    const list = buckets.get(bucket) ?? []
    list.push(price)
    buckets.set(bucket, list)
  })

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a - b)
    .map(([time, values]) => ({
      time,
      open: values[0],
      high: Math.max(...values),
      low: Math.min(...values),
      close: values[values.length - 1],
    }))
}

async function fetchCoingeckoPrices(
  coinId: string,
  vsCurrency: string,
  days: number,
): Promise<[number, number][]> {
  const params = new URLSearchParams({
    vs_currency: vsCurrency,
    days: String(days),
  })
  const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?${params.toString()}`)
  if (!res.ok) {
    throw new Error(`CoinGecko market_chart ${res.status}`)
  }
  const data = await res.json()
  return Array.isArray(data.prices) ? data.prices : []
}

export async function fetchCoingeckoCandles(
  coinId: string,
  vsCurrency: string,
  interval: string,
): Promise<ChartCandle[]> {
  const days = intervalToDays(interval)
  const prices = await fetchCoingeckoPrices(coinId, vsCurrency, days)
  return aggregatePricesToCandles(prices, intervalToSeconds(interval))
}

export async function fetchCoingecko24hTicker(coinId: string, vsCurrency: string): Promise<ChartTicker | null> {
  const params = new URLSearchParams({
    localization: 'false',
    tickers: 'false',
    market_data: 'true',
    community_data: 'false',
    developer_data: 'false',
  })
  const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}?${params.toString()}`)
  if (!res.ok) {
    return null
  }
  const data = await res.json()
  const md = data?.market_data
  const lastPrice = md?.current_price?.[vsCurrency]
  const highPrice = md?.high_24h?.[vsCurrency]
  const lowPrice = md?.low_24h?.[vsCurrency]
  const priceChangePercent =
    md?.price_change_percentage_24h_in_currency?.[vsCurrency] ?? md?.price_change_percentage_24h

  if (!Number.isFinite(lastPrice) || lastPrice <= 0) {
    return null
  }

  return {
    lastPrice,
    highPrice: Number.isFinite(highPrice) ? highPrice : lastPrice,
    lowPrice: Number.isFinite(lowPrice) ? lowPrice : lastPrice,
    priceChangePercent: Number.isFinite(priceChangePercent) ? priceChangePercent : 0,
  }
}
