import { useEffect, useState } from 'react'
import { resolveBinanceMarket } from 'utils/tradingViewSymbol'
import { Currency } from '@pancakeswap/sdk'

export interface Binance24hTicker {
  lastPrice: number
  priceChangePercent: number
  highPrice: number
  lowPrice: number
}

const REFRESH_MS = 30_000

function invertTicker(ticker: Binance24hTicker): Binance24hTicker {
  const inv = (v: number) => (v > 0 ? 1 / v : 0)
  const last = inv(ticker.lastPrice)
  const high = inv(ticker.lowPrice)
  const low = inv(ticker.highPrice)
  return {
    lastPrice: last,
    highPrice: high,
    lowPrice: low,
    priceChangePercent: -ticker.priceChangePercent,
  }
}

async function fetchBinance24hTicker(binancePair: string): Promise<Binance24hTicker | null> {
  const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${encodeURIComponent(binancePair)}`)
  if (!res.ok) {
    return null
  }
  const data = await res.json()
  return {
    lastPrice: parseFloat(data.lastPrice),
    priceChangePercent: parseFloat(data.priceChangePercent),
    highPrice: parseFloat(data.highPrice),
    lowPrice: parseFloat(data.lowPrice),
  }
}

export function useBinance24hTicker(
  base?: Currency,
  quote?: Currency,
  chainId?: number,
): {
  ticker: Binance24hTicker | null
  loading: boolean
} {
  const [ticker, setTicker] = useState<Binance24hTicker | null>(null)
  const [loading, setLoading] = useState(true)

  const market = resolveBinanceMarket(base, quote, chainId)

  useEffect(() => {
    if (!market?.binancePair) {
      setTicker(null)
      setLoading(false)
      return undefined
    }

    let cancelled = false

    const load = async () => {
      setLoading(true)
      try {
        const raw = await fetchBinance24hTicker(market.binancePair)
        if (!cancelled) {
          setTicker(raw ? (market.isInvertedMarket ? invertTicker(raw) : raw) : null)
        }
      } catch {
        if (!cancelled) {
          setTicker(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()
    const interval = window.setInterval(load, REFRESH_MS)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [market?.binancePair, market?.isInvertedMarket, base, quote, chainId])

  return { ticker, loading }
}
