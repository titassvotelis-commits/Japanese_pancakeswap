import { Trade } from '@pancakeswap/sdk'
import { useMemo } from 'react'
import { buildExecutionPlan } from '../utils/swap/routeComposer'
import { SwapExecutionPlan } from '../utils/swap/types'

export function useSwapExecutionPlan(trade: Trade | undefined): SwapExecutionPlan | null {
  return useMemo(() => {
    if (!trade) return null
    return buildExecutionPlan(trade)
  }, [trade])
}
