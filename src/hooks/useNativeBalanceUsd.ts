import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { useWeb3React } from '@web3-react/core'
import { formatEther } from 'ethers/lib/utils'
import tokens from 'config/constants/tokens'
import useBUSDPrice from 'hooks/useBUSDPrice'
import { useGetBnbBalance, FetchStatus } from 'hooks/useTokenBalance'
import { formatMkWalletUsd } from 'hooks/useMkWalletUsd'

/** Native BNB balance in USD for the nav wallet pill. */
export function useNativeBalanceUsd(): { usdLabel: string; pending: boolean } {
  const { account } = useWeb3React()
  const { balance, fetchStatus } = useGetBnbBalance()
  const bnbPrice = useBUSDPrice(tokens.wbnb)

  return useMemo(() => {
    if (!account) {
      return { usdLabel: '$0', pending: false }
    }
    if (fetchStatus !== FetchStatus.SUCCESS || !bnbPrice) {
      return { usdLabel: '$0', pending: true }
    }
    const bnbHuman = parseFloat(formatEther(balance))
    const price = parseFloat(bnbPrice.toSignificant(12))
    if (!Number.isFinite(bnbHuman) || !Number.isFinite(price) || price <= 0) {
      return { usdLabel: '$0', pending: false }
    }
    return { usdLabel: `$${formatMkWalletUsd(bnbHuman * price)}`, pending: false }
  }, [account, balance, fetchStatus, bnbPrice])
}
