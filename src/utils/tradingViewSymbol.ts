import { ChainId, Currency, ETHER, Token } from '@pancakeswap/sdk'
import { makeRatioBinancePair, parseRatioBinancePair } from './binanceRatioPair'
import { makeCoingeckoChartPair } from './coingeckoChartPair'
import { wrappedCurrency } from './wrappedCurrency'

const STABLE_QUOTES = new Set(['USDT', 'BUSD', 'USDC', 'DAI', 'TUSD', 'USD1', 'VAI'])

/** BSC tokens without a live Binance spot pair — chart via CoinGecko vs BNB */
const COINGECKO_BNB_CHART_IDS: Record<string, string> = {
  BELT: 'belt',
  EPS: 'ellipsis',
}

/** Map UI / wrapped symbols → Binance spot asset codes */
const BINANCE_ASSET: Record<string, string> = {
  WBNB: 'BNB',
  BNB: 'BNB',
  BTCB: 'BTC',
  ETH: 'ETH',
  WETH: 'ETH',
  JNTo: 'JNTO',
  MK: 'JNTO',
}

/** Pairs that exist on Binance but are not `{base}{quote}` literal */
const BINANCE_PAIR_OVERRIDE: Record<string, string> = {
  'WBNB-USDT': 'BNBUSDT',
  'BNB-USDT': 'BNBUSDT',
  'USDT-WBNB': 'BNBUSDT',
  'USDT-BNB': 'BNBUSDT',
  'WBNB-CAKE': 'CAKEBNB',
  'BNB-CAKE': 'CAKEBNB',
  'CAKE-WBNB': 'CAKEUSDT',
  'CAKE-BNB': 'CAKEUSDT',
  'WBNB-ETH': 'ETHBNB',
  'BNB-ETH': 'ETHBNB',
  'ETH-WBNB': 'ETHUSDT',
  'ETH-BNB': 'ETHUSDT',
  'WBNB-BTCB': 'BTCBNB',
  'BNB-BTCB': 'BTCBNB',
  'BTCB-WBNB': 'BTCUSDT',
  'BTCB-BNB': 'BTCUSDT',
  'TKO-WBNB': 'TKOUSDT',
  'TKO-BNB': 'TKOUSDT',
  'WBNB-TKO': makeRatioBinancePair('BNBUSDT', 'TKOUSDT'),
  'BNB-TKO': makeRatioBinancePair('BNBUSDT', 'TKOUSDT'),
  'BNB-DEXE': 'DEXEUSDT',
  'DEXE-BNB': 'DEXEUSDT',
  'WBNB-DEXE': 'DEXEUSDT',
  'DEXE-WBNB': 'DEXEUSDT',
  'BELT-WBNB': makeCoingeckoChartPair('belt', 'bnb'),
  'BELT-BNB': makeCoingeckoChartPair('belt', 'bnb'),
  'WBNB-BELT': makeCoingeckoChartPair('belt', 'bnb'),
  'BNB-BELT': makeCoingeckoChartPair('belt', 'bnb'),
  'EPS-WBNB': makeCoingeckoChartPair('ellipsis', 'bnb'),
  'EPS-BNB': makeCoingeckoChartPair('ellipsis', 'bnb'),
  'WBNB-EPS': makeCoingeckoChartPair('ellipsis', 'bnb'),
  'BNB-EPS': makeCoingeckoChartPair('ellipsis', 'bnb'),
}

function pairKey(a: string, b: string): string {
  return `${a}-${b}`
}

export function toBinanceAsset(symbol: string | undefined): string {
  if (!symbol) return 'BNB'
  const upper = symbol.toUpperCase()
  return BINANCE_ASSET[upper] ?? upper
}

/** Label in swap UI: BNB not WBNB when native BNB selected */
export function getDisplaySymbol(currency: Currency | undefined, chainId?: number): string {
  if (!currency) return ''
  if (currency === ETHER) return 'BNB'
  if (currency instanceof Token) {
    if (chainId && wrappedCurrency(currency, chainId)?.symbol === 'WBNB' && currency.symbol === 'WBNB') {
      return 'BNB'
    }
    return currency.symbol ?? 'TOKEN'
  }
  return currency.symbol ?? 'TOKEN'
}

function wrappedTokens(
  base?: Currency,
  quote?: Currency,
  chainId: number = ChainId.MAINNET,
): { base: Token; quote: Token } | null {
  const tokenBase = wrappedCurrency(base, chainId)
  const tokenQuote = wrappedCurrency(quote, chainId)
  if (!tokenBase || !tokenQuote) {
    return null
  }
  return { base: tokenBase, quote: tokenQuote }
}

/**
 * Resolve Binance spot market for chart BASE/QUOTE.
 * Flip changes order: BNB/USDT → USDT/BNB uses inverted ticker construction when needed.
 */
export type BinanceMarketInfo = {
  tradingViewSymbol: string
  binancePair: string
  isInvertedMarket: boolean
  /** Chart uses TOKEN/USDT on Binance as a reference (pair may not have a direct spot market). */
  isReferenceUsdtPair?: boolean
}

export function resolveBinanceMarket(
  base?: Currency,
  quote?: Currency,
  chainId: number = ChainId.MAINNET,
): BinanceMarketInfo | null {
  const tokens = wrappedTokens(base, quote, chainId)
  if (!tokens) {
    return null
  }

  const symBase = toBinanceAsset(tokens.base.symbol)
  const symQuote = toBinanceAsset(tokens.quote.symbol)
  const overrideKey = pairKey(symBase, symQuote)

  if (BINANCE_PAIR_OVERRIDE[overrideKey]) {
    const binancePair = BINANCE_PAIR_OVERRIDE[overrideKey]
    const ratio = parseRatioBinancePair(binancePair)
    const coingecko = binancePair.startsWith('COINGECKO:')
    const invertedCoingeckoBnb = coingecko && symBase === 'BNB'
    return {
      tradingViewSymbol: `BINANCE:${ratio ? ratio.numerator : 'BNBUSDT'}`,
      binancePair,
      isInvertedMarket:
        invertedCoingeckoBnb || (STABLE_QUOTES.has(symBase) && !STABLE_QUOTES.has(symQuote)),
      isReferenceUsdtPair: Boolean(ratio || coingecko),
    }
  }

  const cgBase = COINGECKO_BNB_CHART_IDS[symBase]
  if (cgBase && symQuote === 'BNB') {
    return {
      tradingViewSymbol: 'BINANCE:BNBUSDT',
      binancePair: makeCoingeckoChartPair(cgBase, 'bnb'),
      isInvertedMarket: false,
      isReferenceUsdtPair: true,
    }
  }
  const cgQuote = COINGECKO_BNB_CHART_IDS[symQuote]
  if (symBase === 'BNB' && cgQuote) {
    return {
      tradingViewSymbol: 'BINANCE:BNBUSDT',
      binancePair: makeCoingeckoChartPair(cgQuote, 'bnb'),
      isInvertedMarket: true,
      isReferenceUsdtPair: true,
    }
  }

  const direct = `${symBase}${symQuote}`
  const reverse = `${symQuote}${symBase}`

  // Stable as quote: BNB/USDT, CAKE/USDT
  if (STABLE_QUOTES.has(symQuote) && !STABLE_QUOTES.has(symBase)) {
    return {
      tradingViewSymbol: `BINANCE:${direct}`,
      binancePair: direct,
      isInvertedMarket: false,
    }
  }

  // Stable as base (flipped): USDT/BNB → chart uses BNBUSDT market (inverted orientation)
  if (STABLE_QUOTES.has(symBase) && !STABLE_QUOTES.has(symQuote)) {
    return {
      tradingViewSymbol: `BINANCE:${reverse}`,
      binancePair: reverse,
      isInvertedMarket: true,
    }
  }

  // BNB as quote: TOKEN/BNB — use TOKENUSDT (TOKENBNB often missing on Binance spot)
  if (symQuote === 'BNB' && symBase !== 'BNB' && !STABLE_QUOTES.has(symBase)) {
    const usdtPair = `${symBase}USDT`
    return {
      tradingViewSymbol: `BINANCE:${usdtPair}`,
      binancePair: usdtPair,
      isInvertedMarket: false,
      isReferenceUsdtPair: true,
    }
  }

  // BNB as base: BNB/TOKEN — use TOKENUSDT (DEXEBNB etc. often missing on Binance spot)
  if (symBase === 'BNB' && symQuote !== 'BNB' && !STABLE_QUOTES.has(symQuote)) {
    const usdtPair = `${symQuote}USDT`
    return {
      tradingViewSymbol: `BINANCE:${usdtPair}`,
      binancePair: usdtPair,
      isInvertedMarket: false,
      isReferenceUsdtPair: true,
    }
  }

  // Tokens without a Binance market (e.g. JNTo) — reference BNB/stable on TradingView
  if (symBase === 'JNTO' || symQuote === 'JNTO') {
    return {
      tradingViewSymbol: 'BINANCE:BNBUSDT',
      binancePair: 'BNBUSDT',
      isInvertedMarket: STABLE_QUOTES.has(symBase),
    }
  }

  // Default: try direct pair on Binance / TradingView
  return {
    tradingViewSymbol: `BINANCE:${direct}`,
    binancePair: direct,
    isInvertedMarket: false,
  }
}

export function getTradingViewSymbolForChartPair(
  base?: Currency,
  quote?: Currency,
  chainId: number = ChainId.MAINNET,
): string {
  return resolveBinanceMarket(base, quote, chainId)?.tradingViewSymbol ?? 'BINANCE:BNBUSDT'
}

export function getChartPairLabel(
  base?: Currency,
  quote?: Currency,
  chainId: number = ChainId.MAINNET,
): string {
  const displayBase = getDisplaySymbol(base, chainId)
  const displayQuote = getDisplaySymbol(quote, chainId)
  if (!displayBase || !displayQuote) {
    return ''
  }
  return `${displayBase}/${displayQuote}`
}

export function tradingViewSymbolToBinancePair(tradingViewSymbol: string): string | null {
  if (!tradingViewSymbol.startsWith('BINANCE:')) {
    return null
  }
  return tradingViewSymbol.slice('BINANCE:'.length)
}

export function usesProxyChartSymbol(
  base?: Currency,
  quote?: Currency,
  chainId: number = ChainId.MAINNET,
): boolean {
  const tokens = wrappedTokens(base, quote, chainId)
  if (!tokens) {
    return true
  }
  const symBase = toBinanceAsset(tokens.base.symbol)
  const symQuote = toBinanceAsset(tokens.quote.symbol)
  return !BINANCE_PAIR_OVERRIDE[pairKey(symBase, symQuote)] && symBase === 'JNTO'
}

// Legacy exports
export function getTradingViewSymbol(
  input?: Currency,
  output?: Currency,
  chainId: number = ChainId.MAINNET,
): string {
  return getTradingViewSymbolForChartPair(input, output, chainId)
}

export function getSwapPairLabel(
  input?: Currency,
  output?: Currency,
  chainId: number = ChainId.MAINNET,
): string {
  return getChartPairLabel(input, output, chainId)
}
