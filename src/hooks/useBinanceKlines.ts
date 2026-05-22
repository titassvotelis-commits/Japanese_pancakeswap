import { useEffect, useState } from 'react'

export type BinanceCandle = {
  time: number
  open: number
  high: number
  low: number
  close: number
}

/** Invert OHLC so chart shows quote/base (e.g. USDT per BNB from BNBUSDT klines). */
export function invertBinanceCandles(candles: BinanceCandle[]): BinanceCandle[] {
  return candles.map((c) => ({
    time: c.time,
    open: 1 / c.open,
    high: 1 / c.low,
    low: 1 / c.high,
    close: 1 / c.close,
  }))
}

async function fetchBinanceKlines(symbol: string, interval: string, limit: number): Promise<BinanceCandle[]> {
  const params = new URLSearchParams({ symbol, interval, limit: String(limit) })
  const res = await fetch(`https://api.binance.com/api/v3/klines?${params.toString()}`)
  if (!res.ok) {
    throw new Error(`Binance klines ${res.status}`)
  }
  const raw: (string | number)[][] = await res.json()
  return raw.map((k) => ({
    time: Math.floor(Number(k[0]) / 1000),
    open: parseFloat(String(k[1])),
    high: parseFloat(String(k[2])),
    low: parseFloat(String(k[3])),
    close: parseFloat(String(k[4])),
  }))
}

export function useBinanceKlines(
  binancePair: string | undefined,
  interval = '15m',
  limit = 300,
  invert = false,
): { candles: BinanceCandle[]; loading: boolean; error: boolean } {
  const [candles, setCandles] = useState<BinanceCandle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!binancePair) {
      setCandles([])
      setLoading(false)
      setError(false)
      return undefined
    }

    let cancelled = false

    const load = async (showLoading: boolean) => {
      if (showLoading) {
        setLoading(true)
      }
      setError(false)
      try {
        const data = await fetchBinanceKlines(binancePair, interval, limit)
        if (!cancelled) {
          setCandles(invert ? invertBinanceCandles(data) : data)
        }
      } catch {
        if (!cancelled) {
          setCandles([])
          setError(true)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    setCandles([])
    load(true)
    const timer = window.setInterval(() => load(false), 60_000)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [binancePair, interval, limit, invert])

  return { candles, loading, error }
}
