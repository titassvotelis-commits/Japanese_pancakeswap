export const BINANCE_RATIO_PREFIX = 'RATIO:'

type RatioCandle = {
  time: number
  open: number
  high: number
  low: number
  close: number
}

type RatioTicker = {
  lastPrice: number
  priceChangePercent: number
  highPrice: number
  lowPrice: number
}

export type BinanceRatioLegs = {
  numerator: string
  denominator: string
}

export function makeRatioBinancePair(numerator: string, denominator: string): string {
  return `${BINANCE_RATIO_PREFIX}${numerator}/${denominator}`
}

export function parseRatioBinancePair(binancePair: string): BinanceRatioLegs | null {
  if (!binancePair.startsWith(BINANCE_RATIO_PREFIX)) {
    return null
  }
  const [numerator, denominator] = binancePair.slice(BINANCE_RATIO_PREFIX.length).split('/')
  if (!numerator || !denominator) {
    return null
  }
  return { numerator, denominator }
}

function safeDiv(a: number, b: number): number {
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) {
    return 0
  }
  return a / b
}

export function mergeRatioCandles(numerator: RatioCandle[], denominator: RatioCandle[]): RatioCandle[] {
  const denByTime = new Map(denominator.map((c) => [c.time, c]))
  const merged: RatioCandle[] = []

  numerator.forEach((num) => {
    const den = denByTime.get(num.time)
    if (!den) {
      return
    }
    merged.push({
      time: num.time,
      open: safeDiv(num.open, den.open),
      high: safeDiv(num.high, den.low),
      low: safeDiv(num.low, den.high),
      close: safeDiv(num.close, den.close),
    })
  })

  return merged
}

export function mergeRatioTickers(numerator: RatioTicker, denominator: RatioTicker): RatioTicker {
  const lastPrice = safeDiv(numerator.lastPrice, denominator.lastPrice)

  const numOpen =
    numerator.lastPrice > 0 && Number.isFinite(numerator.priceChangePercent)
      ? numerator.lastPrice / (1 + numerator.priceChangePercent / 100)
      : 0
  const denOpen =
    denominator.lastPrice > 0 && Number.isFinite(denominator.priceChangePercent)
      ? denominator.lastPrice / (1 + denominator.priceChangePercent / 100)
      : 0
  const openPrice = safeDiv(numOpen, denOpen)

  let priceChangePercent = 0
  if (openPrice > 0 && lastPrice > 0) {
    priceChangePercent = ((lastPrice - openPrice) / openPrice) * 100
  }

  return {
    lastPrice,
    highPrice: safeDiv(numerator.highPrice, denominator.lowPrice),
    lowPrice: safeDiv(numerator.lowPrice, denominator.highPrice),
    priceChangePercent,
  }
}
