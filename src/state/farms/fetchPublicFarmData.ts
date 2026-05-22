import BigNumber from 'bignumber.js'
import masterchefABI from 'config/abi/masterchef.json'
import erc20 from 'config/abi/erc20.json'
import { getAddress, getMasterChefAddress } from 'utils/addressHelpers'
import { BIG_TEN, BIG_ZERO } from 'utils/bigNumber'
import multicall from 'utils/multicall'
import { SerializedFarm, SerializedBigNumber } from '../types'

async function fetchLpLiquidityInQuote(
  lpAddress: string,
  token: SerializedFarm['token'],
  quoteToken: SerializedFarm['quoteToken'],
) {
  const calls = [
    { address: token.address, name: 'balanceOf', params: [lpAddress] },
    { address: quoteToken.address, name: 'balanceOf', params: [lpAddress] },
    { address: token.address, name: 'decimals' },
    { address: quoteToken.address, name: 'decimals' },
  ]
  const [tokenBalanceLP, quoteTokenBalanceLP, tokenDecimals, quoteTokenDecimals] = await multicall(erc20, calls)
  const quoteTokenAmountTotal = new BigNumber(quoteTokenBalanceLP).div(BIG_TEN.pow(quoteTokenDecimals))
  return quoteTokenAmountTotal.times(2)
}

type PublicFarmData = {
  tokenAmountTotal: SerializedBigNumber
  lpTotalInQuoteToken: SerializedBigNumber
  displayLpTotalInQuoteToken?: SerializedBigNumber
  lpTotalSupply: SerializedBigNumber
  lpSupply: SerializedBigNumber
  tokenPriceVsQuote: SerializedBigNumber
  poolWeight: SerializedBigNumber
  multiplier: string
  depositFeeBP: string
  cakePerBlock: SerializedBigNumber
  fixedApr: SerializedBigNumber
  lockingPeriod: SerializedBigNumber
  isWithdrawable: boolean
}
const fetchFarm = async (farm: SerializedFarm): Promise<PublicFarmData> => {
  const { pid, lpAddresses, token, quoteToken } = farm
  const lpAddress = getAddress(lpAddresses)
  const calls = [
    // Balance of token in the LP contract
    {
      address: token.address,
      name: 'balanceOf',
      params: [lpAddress],
    },
    // Balance of quote token on LP contract
    {
      address: quoteToken.address,
      name: 'balanceOf',
      params: [lpAddress],
    },
    // Balance of LP tokens in the master chef contract
    {
      address: farm.isTokenOnly? token.address : lpAddress,
      name: 'balanceOf',
      params: [getMasterChefAddress()],
    },
    // Total supply of LP tokens
    {
      address: lpAddress,
      name: 'totalSupply',
    },
    // Token decimals
    {
      address: token.address,
      name: 'decimals',
    },
    // Quote token decimals
    {
      address: quoteToken.address,
      name: 'decimals',
    },
  ]
  const [tokenBalanceLP, quoteTokenBalanceLP, lpTokenBalanceMC, lpTotalSupply, tokenDecimals, quoteTokenDecimals] =
  await multicall(erc20, calls)
  // Ratio in % of LP tokens that are staked in the MC, vs the total number in circulation
  const lpTokenRatio = new BigNumber(lpTokenBalanceMC).div(new BigNumber(lpTotalSupply))
  
  // Raw amount of token in the LP, including those not staked
  const tokenAmountTotal = new BigNumber(tokenBalanceLP).div(BIG_TEN.pow(tokenDecimals))
  const quoteTokenAmountTotal = new BigNumber(quoteTokenBalanceLP).div(BIG_TEN.pow(quoteTokenDecimals))
  let lpTotalInQuoteToken
  let tokenAmountMc
  let tokenPriceVsQuote
  if(farm.isTokenOnly){
    tokenAmountMc = new BigNumber(lpTokenBalanceMC).div(BIG_TEN.pow(quoteTokenDecimals));
    
    if(farm.token.symbol === 'BUSD' && farm.quoteToken.symbol === 'BUSD'){
      tokenPriceVsQuote = new BigNumber(1);
    }
    else{
      tokenPriceVsQuote = new BigNumber(quoteTokenBalanceLP).div(new BigNumber(tokenBalanceLP))
    }
    lpTotalInQuoteToken = tokenAmountMc.times(tokenPriceVsQuote)

  }
  else{
    tokenAmountMc = tokenAmountTotal.times(lpTokenRatio)
    const quoteTokenAmountMc = quoteTokenAmountTotal.times(lpTokenRatio)
    lpTotalInQuoteToken = quoteTokenAmountMc.times(new BigNumber(2))
  } 
  
  
  // Only make masterchef calls if farm has pid
  const [info, totalAllocPoint, OptPerBlock, isWithdrawable_] =
  pid || pid === 0
  ? await multicall(masterchefABI, [
    {
      address: getMasterChefAddress(),
      name: 'poolInfo',
      params: [pid],
    },
    {
      address: getMasterChefAddress(),
      name: 'totalAllocPoint',
    },
    {
      address: getMasterChefAddress(),
      name: 'OptPerBlock'
    },
    {
      address: getMasterChefAddress(),
      name: 'isWithdrawable',
      params: [pid]
    }
  ])
  : [null, null, null]
  const allocPoint = info ? new BigNumber(info.allocPoint?._hex) : BIG_ZERO
  const poolWeight = totalAllocPoint ? allocPoint.div(new BigNumber(totalAllocPoint)) : BIG_ZERO
  const cakePerBlock = OptPerBlock ? new BigNumber(OptPerBlock) : BIG_ZERO
  const depositFeeBP1 = info? new BigNumber(info.depositFeeBP) : BIG_ZERO
  const fixedApr = info ? new BigNumber(info.fixedApr?._hex) : BIG_ZERO
  const lockingPeriod = info ? new BigNumber(info.lockingPeriod?._hex) : BIG_ZERO
  const lpSupply = info ? new BigNumber(info.lpSupply?._hex) : BIG_ZERO

  let displayLpTotalInQuoteToken: BigNumber | undefined
  const displayLpAddress = farm.displayLpAddresses ? getAddress(farm.displayLpAddresses) : null
  if (displayLpAddress && displayLpAddress !== lpAddress && farm.displayToken && farm.displayQuoteToken) {
    displayLpTotalInQuoteToken = await fetchLpLiquidityInQuote(
      displayLpAddress,
      farm.displayToken,
      farm.displayQuoteToken,
    )
  }

  return {
    tokenAmountTotal: tokenAmountTotal.toJSON(),
    lpTotalSupply: new BigNumber(lpTotalSupply).toJSON(),
    lpTotalInQuoteToken: lpTotalInQuoteToken.toJSON(),
    displayLpTotalInQuoteToken: displayLpTotalInQuoteToken?.toJSON(),
    tokenPriceVsQuote: quoteTokenAmountTotal.div(tokenAmountTotal).toJSON(),
    poolWeight: poolWeight.toJSON(),
    multiplier: `${allocPoint.toString()}X`,
    depositFeeBP: `${depositFeeBP1.div(100).toString()}`,
    cakePerBlock: cakePerBlock.toJSON(),
    fixedApr: fixedApr.toJSON(),
    lockingPeriod: lockingPeriod.toJSON(),
    lpSupply: lpSupply.toJSON(),
    isWithdrawable: isWithdrawable_,
  }
}

export default fetchFarm
