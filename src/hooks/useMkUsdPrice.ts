import { useMemo } from 'react'
import tokens from 'config/constants/tokens'
import { PairState, usePairs } from 'hooks/usePairs'
import { useCakeBusdPrice } from 'hooks/useBUSDPrice'
import { useFarmFromPid, usePriceCakeBusd } from 'state/farms/hooks'

function priceToNumber(price: { toSignificant: (digits: number) => string } | undefined): number {
  if (!price) {
    return 0
  }
  const n = parseFloat(price.toSignificant(12))
  return Number.isFinite(n) && n > 0 ? n : 0
}

/** Min USDT in JNTo–USDT pool to treat JNTo as priced (matches “no price” when pool is empty). */
const MIN_QUOTE_LIQUIDITY_USD = 10

/**
 * JNTo USD price only when an on-chain market exists (pair / BUSD route).
 * Farm reserve ratios alone do not count — aligns with MetaMask showing “-”.
 */
export function useMkUsdPriceKnown(): { price: number; known: boolean } {
  const mkPair = useCakeBusdPrice()
  const [[jntoUsdtState, jntoUsdtPair]] = usePairs([[tokens.jnto, tokens.usdt]])

  return useMemo(() => {
    const fromPair = priceToNumber(mkPair)
    if (fromPair > 0) {
      return { price: fromPair, known: true }
    }
    if (jntoUsdtState === PairState.EXISTS && jntoUsdtPair) {
      const quoteReserve = parseFloat(jntoUsdtPair.reserveOf(tokens.usdt).toSignificant(12))
      if (Number.isFinite(quoteReserve) && quoteReserve >= MIN_QUOTE_LIQUIDITY_USD) {
        const inUsdt = parseFloat(jntoUsdtPair.priceOf(tokens.jnto).toSignificant(12))
        if (Number.isFinite(inUsdt) && inUsdt > 0) {
          return { price: inUsdt, known: true }
        }
      }
    }
    return { price: 0, known: false }
  }, [mkPair, jntoUsdtState, jntoUsdtPair])
}

/** JNTo/MK token USD price (includes farm fallbacks — use useMkUsdPriceKnown for wallet totals). */
export function useMkUsdPrice(): number {
  const mkPair = useCakeBusdPrice()
  const mkFarmBusd = usePriceCakeBusd()
  const jntoFarm = useFarmFromPid(0)
  const [[jntoUsdtState, jntoUsdtPair]] = usePairs([[tokens.jnto, tokens.usdt]])

  return useMemo(() => {
    const fromPair = priceToNumber(mkPair)
    if (fromPair > 0) {
      return fromPair
    }
    if (jntoUsdtState === PairState.EXISTS && jntoUsdtPair) {
      const inUsdt = parseFloat(jntoUsdtPair.priceOf(tokens.jnto).toSignificant(12))
      if (Number.isFinite(inUsdt) && inUsdt > 0) {
        return inUsdt
      }
    }
    const fromFarmBusd = mkFarmBusd.toNumber()
    if (Number.isFinite(fromFarmBusd) && fromFarmBusd > 0) {
      return fromFarmBusd
    }
    const vsQuote = jntoFarm?.tokenPriceVsQuote?.toNumber?.() ?? parseFloat(String(jntoFarm?.tokenPriceVsQuote ?? 0))
    if (Number.isFinite(vsQuote) && vsQuote > 0) {
      return vsQuote
    }
    return 0
  }, [mkPair, jntoUsdtState, jntoUsdtPair, mkFarmBusd, jntoFarm?.tokenPriceVsQuote])
}
