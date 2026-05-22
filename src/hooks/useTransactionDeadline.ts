import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { DEFAULT_DEADLINE_FROM_NOW } from '../config/constants'
import { AppState } from '../state'
import useCurrentBlockTimestamp from './useCurrentBlockTimestamp'

// combines the block timestamp with the user setting to give the deadline that should be used for any submitted transaction
export default function useTransactionDeadline(): BigNumber | undefined {
  const ttl = useSelector<AppState, number>((state) => state.user.userDeadline)
  const blockTimestamp = useCurrentBlockTimestamp()
  return useMemo(() => {
    const ttlSeconds = typeof ttl === 'number' ? ttl : DEFAULT_DEADLINE_FROM_NOW
    if (blockTimestamp) {
      return blockTimestamp.add(ttlSeconds)
    }
    // Multicall block timestamp can be unavailable on first load — still allow swaps
    return BigNumber.from(Math.floor(Date.now() / 1000) + ttlSeconds)
  }, [blockTimestamp, ttl])
}
