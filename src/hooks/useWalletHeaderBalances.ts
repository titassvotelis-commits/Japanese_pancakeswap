import { useEffect, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { BigNumber as EthersBN } from '@ethersproject/bignumber'
import { Token, TokenAmount } from '@pancakeswap/sdk'
import { useWeb3React } from '@web3-react/core'
import tokens from 'config/constants/tokens'
import { useBnbUsdPrice } from 'hooks/useBnbUsdPrice'
import { useMkUsdPriceKnown } from 'hooks/useMkUsdPrice'
import { useGetBnbBalance, FetchStatus } from 'hooks/useTokenBalance'
import { BIG_ZERO } from 'utils/bigNumber'
import useRefresh from 'hooks/useRefresh'
import { useFarms, usePollFarmsPublicData } from 'state/farms/hooks'
import { useAllTokenBalances, useTokenBalancesWithLoadingIndicator } from 'state/wallet/hooks'
import { formatNativeBalance, getBalanceAmount, getFullDisplayBalance } from 'utils/formatBalance'
import { formatWalletAssetUsd, formatWalletTotalUsd, WALLET_NO_USD_PRICE } from 'utils/formatWalletUsd'
import { formatUnits } from 'ethers/lib/utils'

const STABLE_USD = 1

const HEADER_ERC20_TOKENS = [tokens.jnto, tokens.usdt]

export type WalletBalanceLine = {
  symbol: string
  value: string
  amount: string
  usdValue: number
  usdLabel: string
  hasBalance: boolean
  /** Included in header total only when true (MetaMask-style). */
  hasUsdPrice: boolean
}

function buildTokenUsdPriceMap(
  farmRows: { token: Token; quoteToken: Token; tokenPriceBusd?: string; quoteTokenPriceBusd?: string }[],
  bnbUsd: number,
): Record<string, number> {
  const map: Record<string, number> = {}

  const setPrice = (address: string, price: number) => {
    if (price > 0) {
      map[address.toLowerCase()] = price
    }
  }

  setPrice(tokens.busd.address, STABLE_USD)
  setPrice(tokens.usdt.address, STABLE_USD)
  setPrice(tokens.usdc.address, STABLE_USD)
  setPrice(tokens.dai.address, STABLE_USD)
  if (bnbUsd > 0) {
    setPrice(tokens.wbnb.address, bnbUsd)
    setPrice(tokens.bnb.address, bnbUsd)
  }

  farmRows.forEach((farm) => {
    const tokenPrice = parseFloat(farm.tokenPriceBusd ?? '0')
    const quotePrice = parseFloat(farm.quoteTokenPriceBusd ?? '0')
    if (tokenPrice > 0) {
      setPrice(farm.token.address, tokenPrice)
    }
    if (quotePrice > 0) {
      setPrice(farm.quoteToken.address, quotePrice)
    }
  })

  return map
}

function tokenAmountToNumber(amount: { toExact: () => string }): number {
  const human = parseFloat(amount.toExact())
  return Number.isFinite(human) ? human : 0
}

function attachUsd(
  line: Omit<WalletBalanceLine, 'usdValue' | 'usdLabel' | 'hasUsdPrice'>,
  usdValue: number,
  hasUsdPrice: boolean,
): WalletBalanceLine {
  return {
    ...line,
    hasUsdPrice,
    usdValue: hasUsdPrice ? usdValue : 0,
    usdLabel: hasUsdPrice ? formatWalletAssetUsd(usdValue) : WALLET_NO_USD_PRICE,
  }
}

function makeBnbLine(balance: EthersBN, bnbUsd: number): WalletBalanceLine {
  const value = formatNativeBalance(balance, 18, 8)
  const human = parseFloat(formatUnits(balance, 18))
  const hasUsdPrice = bnbUsd > 0
  const usdValue = hasUsdPrice && Number.isFinite(human) ? human * bnbUsd : 0
  const hasBalance = !balance.isZero()
  return attachUsd(
    {
      symbol: 'BNB',
      value,
      amount: `${value} BNB`,
      hasBalance,
    },
    usdValue,
    hasUsdPrice,
  )
}

function makeTokenLine(
  symbol: string,
  rawWei: BigNumber,
  decimals: number,
  usdPerToken: number,
  hasUsdPrice: boolean,
  displayDecimals = 3,
): WalletBalanceLine {
  const value = getFullDisplayBalance(rawWei, decimals, displayDecimals)
  const human = getBalanceAmount(rawWei, decimals).toNumber()
  const usdValue = hasUsdPrice && human > 0 && usdPerToken > 0 ? human * usdPerToken : 0
  const hasBalance = rawWei.gt(0)
  return attachUsd(
    {
      symbol,
      value,
      amount: `${value} ${symbol}`,
      hasBalance,
    },
    usdValue,
    hasUsdPrice,
  )
}

function tokenAmountToRawWei(amount: TokenAmount | undefined): BigNumber {
  return amount ? new BigNumber(amount.raw.toString()) : BIG_ZERO
}

function addToTotal(totalUsd: BigNumber, line: WalletBalanceLine): BigNumber {
  if (!line.hasBalance || !line.hasUsdPrice) {
    return totalUsd
  }
  if (line.usdValue > 0) {
    return totalUsd.plus(line.usdValue)
  }
  return totalUsd
}

/**
 * Header wallet total — MetaMask-style: only tokens with a known USD price count toward the total.
 */
export function useWalletHeaderBalances(): {
  usdLabel: string
  summaryLabel: string
  lines: WalletBalanceLine[]
  pending: boolean
} {
  const { account } = useWeb3React()
  const { fastRefresh } = useRefresh()
  const bnbUsd = useBnbUsdPrice()
  const { price: mkUsd, known: mkPriceKnown } = useMkUsdPriceKnown()
  const { balance: bnbBalance, fetchStatus: bnbStatus, refresh: refreshBnb } = useGetBnbBalance()
  const [headerTokenBalances, headerTokensLoading] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    HEADER_ERC20_TOKENS,
  )
  const farms = useFarms()
  const tokenBalances = useAllTokenBalances()

  usePollFarmsPublicData()

  useEffect(() => {
    if (account) {
      refreshBnb()
    }
  }, [account, fastRefresh, refreshBnb])

  const mkBalance = headerTokenBalances[tokens.jnto.address]
  const usdtBalance = headerTokenBalances[tokens.usdt.address]
  const mkStatus = account && !headerTokensLoading ? FetchStatus.SUCCESS : FetchStatus.NOT_FETCHED
  const usdtStatus = mkStatus

  return useMemo(() => {
    if (!account) {
      return { usdLabel: '$0', summaryLabel: '', lines: [], pending: false }
    }

    const priceMap = buildTokenUsdPriceMap(farms.data, bnbUsd)

    let totalUsd = new BigNumber(0)
    const lines: WalletBalanceLine[] = []

    if (bnbStatus === FetchStatus.SUCCESS) {
      const bnbLine = makeBnbLine(bnbBalance, bnbUsd)
      lines.push(bnbLine)
      totalUsd = addToTotal(totalUsd, bnbLine)
    }

    if (mkStatus === FetchStatus.SUCCESS) {
      const mkLine = makeTokenLine(
        tokens.jnto.symbol,
        tokenAmountToRawWei(mkBalance),
        tokens.jnto.decimals,
        mkUsd,
        mkPriceKnown,
        3,
      )
      lines.push(mkLine)
      totalUsd = addToTotal(totalUsd, mkLine)
    }

    if (usdtStatus === FetchStatus.SUCCESS) {
      const usdtLine = makeTokenLine(
        'USDT',
        tokenAmountToRawWei(usdtBalance),
        tokens.usdt.decimals,
        STABLE_USD,
        true,
        3,
      )
      lines.push(usdtLine)
      totalUsd = addToTotal(totalUsd, usdtLine)
    }

    const counted = new Set<string>([
      tokens.jnto.address.toLowerCase(),
      tokens.usdt.address.toLowerCase(),
      tokens.wbnb.address.toLowerCase(),
      tokens.bnb.address.toLowerCase(),
    ])

    Object.entries(tokenBalances).forEach(([address, amount]) => {
      const key = address.toLowerCase()
      if (counted.has(key) || !amount) {
        return
      }
      const human = tokenAmountToNumber(amount)
      if (human <= 0) {
        return
      }
      counted.add(key)
      const raw = new BigNumber(amount.raw.toString())
      const price = priceMap[key]
      const hasUsdPrice = Boolean(price && price > 0)
      const line = makeTokenLine(
        amount.token.symbol,
        raw,
        amount.token.decimals,
        hasUsdPrice ? price : 0,
        hasUsdPrice,
        3,
      )
      lines.push(line)
      totalUsd = addToTotal(totalUsd, line)
    })

    const coreReady =
      bnbStatus === FetchStatus.SUCCESS ||
      mkStatus === FetchStatus.SUCCESS ||
      usdtStatus === FetchStatus.SUCCESS
    const hasBnbBalance = bnbStatus === FetchStatus.SUCCESS && !bnbBalance.isZero()
    const awaitingBnbPrice = hasBnbBalance && bnbUsd <= 0
    const stillLoading = (!coreReady && totalUsd.isZero()) || awaitingBnbPrice

    const visibleLines = lines.filter((l) => l.hasBalance)
    const summaryLabel = visibleLines.map((l) => l.amount).join(' · ')

    return {
      usdLabel: formatWalletTotalUsd(totalUsd.toNumber()),
      summaryLabel,
      lines: visibleLines.length > 0 ? visibleLines : lines,
      pending: stillLoading,
    }
  }, [
    account,
    bnbBalance,
    bnbStatus,
    bnbUsd,
    mkBalance,
    mkStatus,
    mkUsd,
    mkPriceKnown,
    usdtBalance,
    usdtStatus,
    farms.data,
    tokenBalances,
  ])
}
