import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { useWeb3React } from '@web3-react/core'
import tokens from 'config/constants/tokens'
import { usePriceCakeBusd } from 'state/farms/hooks'
import useTokenBalance, { FetchStatus } from './useTokenBalance'
import { useCakeBusdPrice } from './useBUSDPrice'

/** String after `$` for JNTo wallet value in USD ( `"0"` when disconnected ). */
export function formatMkWalletUsd(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '0'
  const a = Math.abs(n)
  if (a >= 1000) return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (a >= 1) return n.toFixed(2)
  if (a >= 0.01) return n.toFixed(4)
  if (a >= 0.0001) return n.toFixed(6)
  return n.toFixed(8)
}

/** JNTo token price string (full decimals, trailing zeros trimmed). */
export function formatMkTokenPrice(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '0'
  const a = Math.abs(n)
  if (a >= 1000) return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (a >= 1) return n.toFixed(2)
  if (a >= 0.01) return n.toFixed(4)
  if (a >= 0.0001) return n.toFixed(6)
  return n.toFixed(12).replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.$/, '')
}

/**
 * USD value of JNTo in the connected wallet.
 * `part` is the amount string without `$` (use `"0"` when no wallet).
 * `pending` when wallet is connected but balance or price is not ready yet.
 */
export function useMkWalletUsdDisplay(): { part: string; pending: boolean } {
  const { account } = useWeb3React()
  const { balance, fetchStatus } = useTokenBalance(tokens.jnto.address)
  const price = useCakeBusdPrice()

  return useMemo(() => {
    if (!account) {
      return { part: '0', pending: false }
    }
    if (!price) {
      return { part: '0', pending: true }
    }
    if (fetchStatus === FetchStatus.FAILED) {
      return { part: '0', pending: false }
    }
    if (fetchStatus !== FetchStatus.SUCCESS) {
      return { part: '0', pending: true }
    }
    const human = new BigNumber(balance.toString()).dividedBy(new BigNumber(10).pow(tokens.jnto.decimals))
    const p = parseFloat(price.toFixed(18))
    if (!Number.isFinite(p) || p <= 0) {
      return { part: '0', pending: false }
    }
    const usd = human.multipliedBy(p).toNumber()
    return { part: formatMkWalletUsd(usd), pending: false }
  }, [account, balance, fetchStatus, price])
}

/**
 * JNTo token price in USD (per 1 MK), for footer / nav price display.
 * `part` is the amount string without `$`.
 */
export function useMkTokenPriceDisplay(): { part: string; pending: boolean } {
  const pairPrice = useCakeBusdPrice()
  const farmPriceBusd = usePriceCakeBusd()

  return useMemo(() => {
    if (pairPrice) {
      const p = parseFloat(pairPrice.toSignificant(12))
      if (Number.isFinite(p) && p > 0) {
        return { part: formatMkTokenPrice(p), pending: false }
      }
    }

    const farm = farmPriceBusd?.toNumber?.() ?? parseFloat(String(farmPriceBusd ?? 0))
    if (Number.isFinite(farm) && farm > 0) {
      return { part: formatMkTokenPrice(farm), pending: false }
    }

    return { part: '0', pending: !pairPrice && (!farmPriceBusd || farmPriceBusd.isZero()) }
  }, [pairPrice, farmPriceBusd])
}
