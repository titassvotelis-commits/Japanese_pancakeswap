import BigNumber from 'bignumber.js'
import { convertSharesToCake } from 'views/Pools/helpers'
import { multicallv2 } from 'utils/multicall'
import cakeVaultAbi from 'config/abi/cakeVault.json'
import { getCakeVaultAddress, isConfiguredContractAddress } from 'utils/addressHelpers'
import { BIG_ZERO } from 'utils/bigNumber'

const emptyVaultPublic = {
  totalShares: null,
  pricePerFullShare: null,
  totalCakeInVault: null,
  estimatedCakeBountyReward: null,
  totalPendingCakeHarvest: null,
}

const emptyVaultFees = {
  performanceFee: null,
  callFee: null,
  withdrawalFee: null,
  withdrawalFeePeriod: null,
}

export const fetchPublicVaultData = async () => {
  if (!isConfiguredContractAddress(getCakeVaultAddress())) {
    return emptyVaultPublic
  }
  try {
    const calls = [
      'getPricePerFullShare',
      'totalShares',
      'calculateHarvestCakeRewards',
      'calculateTotalPendingCakeRewards',
    ].map((method) => ({
      address: getCakeVaultAddress(),
      name: method,
    }))

    const [[sharePrice], [shares], [estimatedCakeBountyReward], [totalPendingCakeHarvest]] = await multicallv2(
      cakeVaultAbi,
      calls,
    )

    const totalSharesAsBigNumber = shares ? new BigNumber(shares.toString()) : BIG_ZERO
    const sharePriceAsBigNumber = sharePrice ? new BigNumber(sharePrice.toString()) : BIG_ZERO
    const totalCakeInVaultEstimate = convertSharesToCake(totalSharesAsBigNumber, sharePriceAsBigNumber)
    return {
      totalShares: totalSharesAsBigNumber.toJSON(),
      pricePerFullShare: sharePriceAsBigNumber.toJSON(),
      totalCakeInVault: totalCakeInVaultEstimate.cakeAsBigNumber.toJSON(),
      estimatedCakeBountyReward: new BigNumber(estimatedCakeBountyReward.toString()).toJSON(),
      totalPendingCakeHarvest: new BigNumber(totalPendingCakeHarvest.toString()).toJSON(),
    }
  } catch (error) {
    return emptyVaultPublic
  }
}

export const fetchVaultFees = async () => {
  if (!isConfiguredContractAddress(getCakeVaultAddress())) {
    return emptyVaultFees
  }
  try {
    const calls = ['performanceFee', 'callFee', 'withdrawFee', 'withdrawFeePeriod'].map((method) => ({
      address: getCakeVaultAddress(),
      name: method,
    }))

    const [[performanceFee], [callFee], [withdrawalFee], [withdrawalFeePeriod]] = await multicallv2(cakeVaultAbi, calls)

    return {
      performanceFee: performanceFee.toNumber(),
      callFee: callFee.toNumber(),
      withdrawalFee: withdrawalFee.toNumber(),
      withdrawalFeePeriod: withdrawalFeePeriod.toNumber(),
    }
  } catch (error) {
    return emptyVaultFees
  }
}

export default fetchPublicVaultData
