import { useWalletHeaderBalances } from 'hooks/useWalletHeaderBalances'

/** @deprecated Prefer useWalletHeaderBalances for lines + USD total */
export function useWalletTotalUsd(): { usdLabel: string; pending: boolean } {
  const { usdLabel, pending } = useWalletHeaderBalances()
  return { usdLabel, pending }
}
