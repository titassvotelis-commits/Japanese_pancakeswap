import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import tokens from 'config/constants/tokens'
import { getBep20Contract, getCakeContract } from 'utils/contractHelpers'
import { BIG_ZERO } from 'utils/bigNumber'
import { simpleRpcProvider } from 'utils/providers'
import useRefresh from './useRefresh'
import useLastUpdated from './useLastUpdated'

type UseTokenBalanceState = {
  balance: BigNumber
  fetchStatus: FetchStatus
}

export enum FetchStatus {
  NOT_FETCHED = 'not-fetched',
  SUCCESS = 'success',
  FAILED = 'failed',
}

const useTokenBalance = (tokenAddress: string) => {
  const [balanceState, setBalanceState] = useState<UseTokenBalanceState>({
    balance: BIG_ZERO,
    fetchStatus: FetchStatus.NOT_FETCHED,
  })
  const { account } = useActiveWeb3React()
  const { fastRefresh } = useRefresh()

  useEffect(() => {
    if (!account) {
      setBalanceState({ balance: BIG_ZERO, fetchStatus: FetchStatus.NOT_FETCHED })
      return
    }

    const fetchBalance = async () => {
      try {
        const contract = getBep20Contract(tokenAddress)
        const res = await contract.balanceOf(account)
        setBalanceState({ balance: new BigNumber(res.toString()), fetchStatus: FetchStatus.SUCCESS })
      } catch (e) {
        console.error(e)
        setBalanceState({ balance: BIG_ZERO, fetchStatus: FetchStatus.FAILED })
      }
    }

    fetchBalance()
  }, [account, tokenAddress, fastRefresh])

  return balanceState
}

export const useTotalSupply = () => {
  const { slowRefresh } = useRefresh()
  const [totalSupply, setTotalSupply] = useState<BigNumber>()

  useEffect(() => {
    async function fetchTotalSupply() {
      const cakeContract = getCakeContract()
      const supply = await cakeContract.totalSupply()
      setTotalSupply(new BigNumber(supply.toString()))
    }

    fetchTotalSupply()
  }, [slowRefresh])

  return totalSupply
}

export const useBurnedBalance = (tokenAddress: string) => {
  const [balance, setBalance] = useState(BIG_ZERO)
  const { slowRefresh } = useRefresh()

  useEffect(() => {
    const fetchBalance = async () => {
      const contract = getBep20Contract(tokenAddress)
      const res = await contract.balanceOf('0x000000000000000000000000000000000000dEaD')
      setBalance(new BigNumber(res.toString()))
    }

    fetchBalance()
  }, [tokenAddress, slowRefresh])

  return balance
}

export const useGetBnbBalance = () => {
  const [fetchStatus, setFetchStatus] = useState(FetchStatus.NOT_FETCHED)
  const [balance, setBalance] = useState(ethers.BigNumber.from(0))
  const { account, library } = useActiveWeb3React()
  const { lastUpdated, setLastUpdated } = useLastUpdated()
  const { fastRefresh } = useRefresh()

  useEffect(() => {
    if (!account) {
      setBalance(ethers.BigNumber.from(0))
      setFetchStatus(FetchStatus.NOT_FETCHED)
      return
    }

    const fetchBalance = async () => {
      try {
        const provider = library || simpleRpcProvider
        const walletBalance = await provider.getBalance(account)
        setBalance(walletBalance)
        setFetchStatus(FetchStatus.SUCCESS)
      } catch {
        setBalance(ethers.BigNumber.from(0))
        setFetchStatus(FetchStatus.FAILED)
      }
    }

    fetchBalance()
  }, [account, library, lastUpdated, fastRefresh])

  return { balance, fetchStatus, refresh: setLastUpdated }
}

export const useGetCakeBalance = () => {
  const { balance, fetchStatus } = useTokenBalance(tokens.jnto.address)

  // TODO: Remove ethers conversion once useTokenBalance is converted to ethers.BigNumber
  return { balance: ethers.BigNumber.from(balance.toString()), fetchStatus }
}

export default useTokenBalance
