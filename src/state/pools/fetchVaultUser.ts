import BigNumber from 'bignumber.js'
import { getCakeVaultContract } from 'utils/contractHelpers'

const emptyVaultUser = {
  isLoading: true,
  userShares: null,
  lastDepositedTime: null,
  lastUserActionTime: null,
  cakeAtLastUserAction: null,
}

const fetchVaultUser = async (account: string) => {
  const cakeVaultContract = getCakeVaultContract()
  if (!cakeVaultContract) {
    return emptyVaultUser
  }
  try {
    const userContractResponse = await cakeVaultContract.userInfo(account)
    return {
      isLoading: false,
      userShares: new BigNumber(userContractResponse.shares.toString()).toJSON(),
      lastDepositedTime: userContractResponse.lastDepositedTime.toString(),
      lastUserActionTime: userContractResponse.lastUserActionTime.toString(),
      cakeAtLastUserAction: new BigNumber(userContractResponse.cakeAtLastUserAction.toString()).toJSON(),
    }
  } catch (error) {
    return emptyVaultUser
  }
}

export default fetchVaultUser
