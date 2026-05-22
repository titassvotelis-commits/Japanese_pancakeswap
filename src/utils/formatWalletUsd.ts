/** Shown when MetaMask-style pricing is unavailable (e.g. JNTo with no market price). */
export const WALLET_NO_USD_PRICE = '-'

/** MetaMask-style USD label for a single wallet asset. */
export function formatWalletAssetUsd(usd: number): string {
  if (!Number.isFinite(usd) || usd <= 0) {
    return '$0'
  }
  if (usd < 0.01) {
    return '<$0.01'
  }
  if (usd >= 1000) {
    return `$${usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `$${usd.toFixed(2)}`
}

/** Total portfolio USD in the nav pill (e.g. $5.51). */
export function formatWalletTotalUsd(usd: number): string {
  if (!Number.isFinite(usd) || usd <= 0) {
    return '$0'
  }
  if (usd >= 1000) {
    return `$${usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `$${usd.toFixed(2)}`
}
