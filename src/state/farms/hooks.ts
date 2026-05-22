import { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from 'state'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import { BIG_ZERO } from 'utils/bigNumber'
import { getBalanceAmount } from 'utils/formatBalance'
import { farmsConfig } from 'config/constants'
import useRefresh from 'hooks/useRefresh'
import { deserializeToken } from 'state/user/hooks/helpers'
import { fetchFarmsPublicDataAsync, fetchFarmUserDataAsync, nonArchivedFarms } from '.'
import { State, SerializedFarm, DeserializedFarmUserData, DeserializedFarm, DeserializedFarmsState } from '../types'

const deserializeFarmUserData = (farm: SerializedFarm): DeserializedFarmUserData => {
  return {
    allowance: farm.userData ? new BigNumber(farm.userData.allowance) : BIG_ZERO,
    tokenBalance: farm.userData ? new BigNumber(farm.userData.tokenBalance) : BIG_ZERO,
    stakedBalance: farm.userData ? new BigNumber(farm.userData.stakedBalance) : BIG_ZERO,
    earnings: farm.userData ? new BigNumber(farm.userData.earnings) : BIG_ZERO,
    userStakedTime: farm.userData ? new BigNumber(farm.userData.userStakedTime) : BIG_ZERO,
  }
}

const deserializeFarm = (farm: SerializedFarm | undefined): DeserializedFarm | undefined => {
  if (!farm) {
    return undefined
  }
  const { lpAddresses, displayLpAddresses, lpSymbol, pid, dual, multiplier, isCommunity, quoteTokenPriceBusd, tokenPriceBusd, isTokenOnly, depositFeeBP, label, lpSupply} = farm
  return {
    lpAddresses,
    displayLpAddresses,
    lpSymbol,
    pid,
    dual,
    multiplier,
    isTokenOnly,
    isCommunity,
    quoteTokenPriceBusd,
    tokenPriceBusd,
    depositFeeBP,
    label,
    token: deserializeToken(farm.token),
    quoteToken: deserializeToken(farm.quoteToken),
    displayToken: farm.displayToken ? deserializeToken(farm.displayToken) : undefined,
    displayQuoteToken: farm.displayQuoteToken ? deserializeToken(farm.displayQuoteToken) : undefined,
    displayLpTotalInQuoteToken: farm.displayLpTotalInQuoteToken
      ? new BigNumber(farm.displayLpTotalInQuoteToken)
      : undefined,
    userData: deserializeFarmUserData(farm),
    tokenAmountTotal: farm.tokenAmountTotal ? new BigNumber(farm.tokenAmountTotal) : BIG_ZERO,
    lpTotalInQuoteToken: farm.lpTotalInQuoteToken ? new BigNumber(farm.lpTotalInQuoteToken) : BIG_ZERO,
    lpTotalSupply: farm.lpTotalSupply ? new BigNumber(farm.lpTotalSupply) : BIG_ZERO,
    lpSupply: farm.lpSupply ? new BigNumber(lpSupply) : BIG_ZERO,
    tokenPriceVsQuote: farm.tokenPriceVsQuote ? new BigNumber(farm.tokenPriceVsQuote) : BIG_ZERO,
    poolWeight: farm.poolWeight ? new BigNumber(farm.poolWeight) : BIG_ZERO,
    fixedApr: farm.fixedApr ? new BigNumber(farm.fixedApr) : BIG_ZERO,
    lockingPeriod: farm.lockingPeriod ? new BigNumber(farm.lockingPeriod) : BIG_ZERO,
    cakePerBlock: farm.cakePerBlock ? new BigNumber(farm.cakePerBlock) : BIG_ZERO,
    isWithdrawable: farm.isWithdrawable
  }
}

export const usePollFarmsPublicData = (includeArchive = false) => {
  const dispatch = useAppDispatch()
  const { slowRefresh } = useRefresh()

  useEffect(() => {
    const farmsToFetch = includeArchive ? farmsConfig : nonArchivedFarms
    const pids = farmsToFetch.map((farmToFetch) => farmToFetch.pid)

    dispatch(fetchFarmsPublicDataAsync(pids))
  }, [includeArchive, dispatch, slowRefresh])
}

export const usePollFarmsWithUserData = (includeArchive = false) => {
  const dispatch = useAppDispatch()
  const { slowRefresh } = useRefresh()
  const { account } = useWeb3React()

  useEffect(() => {
    const farmsToFetch = includeArchive ? farmsConfig : nonArchivedFarms
    const pids = farmsToFetch.map((farmToFetch) => farmToFetch.pid)

    dispatch(fetchFarmsPublicDataAsync(pids))

    if (account) {
      dispatch(fetchFarmUserDataAsync({ account, pids }))
    }
  }, [includeArchive, dispatch, slowRefresh, account])
}

export const useTotalValue = (): [BigNumber,  BigNumber]=> {
  const farms = useFarms();
  let value = new BigNumber(0);
  let earn = new BigNumber(0);
  for (let i = 0; i < farms.data.length; i++) {
    const farm = farms.data[i]
    let lpTokenPrice = BIG_ZERO
    const farmTokenPriceInUsd = new BigNumber(farm.tokenPriceBusd)
    const valueOfBaseTokenInFarm = farmTokenPriceInUsd.times(farm.tokenAmountTotal)
    const overallValueOfAllTokensInFarm = valueOfBaseTokenInFarm.times(2)
    const totalLpTokens = getBalanceAmount(farm.lpTotalSupply)
    lpTokenPrice = overallValueOfAllTokensInFarm.div(totalLpTokens)
    
    if (farm.lpTotalInQuoteToken && farm.lpTotalInQuoteToken !== BIG_ZERO) {
      let val;
      let ear = new BigNumber(0);
      if (!farm.isTokenOnly) {
        val = (new BigNumber(farm.lpTotalInQuoteToken)).times(lpTokenPrice);
      } else {
        val = (new BigNumber(farm.lpTotalInQuoteToken)).times(lpTokenPrice);
        ear = (farm.userData.earnings).times(lpTokenPrice);
      }
      value = value.plus(val);
      earn = earn.plus(ear);
    }
  }
  return [value, earn];
}


/**
 * Fetches the "core" farm data used globally
 * JNTo-USDT farm pid 0
 */
export const usePollCoreFarmData = () => {
  const dispatch = useAppDispatch()
  const { fastRefresh } = useRefresh()

  useEffect(() => {
    dispatch(fetchFarmsPublicDataAsync([0]))
  }, [dispatch, fastRefresh])
}

export const useFarms = (): DeserializedFarmsState => {
  const farms = useSelector((state: State) => state.farms) 
  const deserializedFarmsData = farms.data
    .map(deserializeFarm)
    .filter((f): f is DeserializedFarm => f !== undefined)
  const { loadArchivedFarmsData, userDataLoaded } = farms
  return {
    loadArchivedFarmsData,
    userDataLoaded,
    data: deserializedFarmsData,
  }
}

export const useFarmFromPid = (pid: number): DeserializedFarm | undefined => {
  const farm = useSelector((state: State) => state.farms.data.find((f) => f.pid === pid))
  return deserializeFarm(farm)
}

export const useFarmFromLpSymbol = (lpSymbol: string): DeserializedFarm | undefined => {
  const farm = useSelector((state: State) => state.farms.data.find((f) => f.lpSymbol === lpSymbol))
  return deserializeFarm(farm)
}

export const useFarmUser = (pid): DeserializedFarmUserData => {
  const farm = useFarmFromPid(pid)
  if (!farm) {
    return {
      allowance: BIG_ZERO,
      tokenBalance: BIG_ZERO,
      stakedBalance: BIG_ZERO,
      earnings: BIG_ZERO,
      userStakedTime: BIG_ZERO,
    }
  }
  const { allowance, tokenBalance, stakedBalance, earnings, userStakedTime } = farm.userData
  return {
    allowance,
    tokenBalance,
    stakedBalance,
    earnings,
    userStakedTime,
  }
}

// Return the base token price for a farm, from a given pid
export const useBusdPriceFromPid = (pid: number): BigNumber => {
  const farm = useFarmFromPid(pid)
  return farm && new BigNumber(farm.tokenPriceBusd)
}

export const useLpTokenPrice = (symbol: string) => {
  const farm = useFarmFromLpSymbol(symbol)
  if (!farm) {
    return BIG_ZERO
  }
  const farmTokenPriceInUsd = useBusdPriceFromPid(farm.pid)
  let lpTokenPrice = BIG_ZERO

  if (farm.lpTotalSupply.gt(0) && farm.lpTotalInQuoteToken.gt(0)) {
    // Total value of base token in LP
    const valueOfBaseTokenInFarm = farmTokenPriceInUsd.times(farm.tokenAmountTotal)
    // Double it to get overall value in LP
    const overallValueOfAllTokensInFarm = valueOfBaseTokenInFarm.times(2)
    // Divide total value of all tokens, by the number of LP tokens
    const totalLpTokens = getBalanceAmount(farm.lpTotalSupply)
    lpTokenPrice = overallValueOfAllTokensInFarm.div(totalLpTokens)
  }

  return lpTokenPrice
}

// /!\ Deprecated , use the BUSD hook in /hooks

export const usePriceCakeBusd = (): BigNumber => {
  const jntoUsdtFarm = useFarmFromPid(0)
  const cakePriceBusdAsString = jntoUsdtFarm?.tokenPriceBusd

  const cakePriceBusd = useMemo(() => {
    return new BigNumber(cakePriceBusdAsString ?? 0)
  }, [cakePriceBusdAsString])

  return cakePriceBusd
}
