import { useEffect, useState } from 'react'
import tokens from 'config/constants/tokens'
import { useBNBBusdPrice } from 'hooks/useBUSDPrice'
import { PairState, usePairs } from 'hooks/usePairs'
import { getCachedBnbUsdPrice, subscribeBnbUsdPrice } from 'utils/fetchBnbUsdPrice'

function priceToNumber(price: { toSignificant: (digits: number) => string } | undefined): number {
  if (!price) {
    return 0
  }
  const n = parseFloat(price.toSignificant(12))
  return Number.isFinite(n) && n > 0 ? n : 0
}

/** BNB/USD for wallet totals — on-chain pairs, then cached public API. */
export function useBnbUsdPrice(): number {
  const bnbBusd = useBNBBusdPrice()
  const [[wbnbUsdtState, wbnbUsdtPair]] = usePairs([[tokens.wbnb, tokens.usdt]])
  const [apiPrice, setApiPrice] = useState(getCachedBnbUsdPrice)

  useEffect(() => subscribeBnbUsdPrice(setApiPrice), [])

  const fromBusd = priceToNumber(bnbBusd)
  if (fromBusd > 0) {
    return fromBusd
  }
  if (wbnbUsdtState === PairState.EXISTS && wbnbUsdtPair) {
    const inUsdt = parseFloat(wbnbUsdtPair.priceOf(tokens.wbnb).toSignificant(12))
    if (Number.isFinite(inUsdt) && inUsdt > 0) {
      return inUsdt
    }
  }
  return apiPrice
}
