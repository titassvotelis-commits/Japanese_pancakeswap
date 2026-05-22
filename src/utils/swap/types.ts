import { Currency, CurrencyAmount, Pair, Trade, TradeType } from '@pancakeswap/sdk'
import { LiquiditySource } from './constants'

export interface SourcedPair {
  pair: Pair
  source: LiquiditySource
  pairAddress: string
}

export interface SwapStep {
  trade: Trade
  source: LiquiditySource
  routerAddress: string
}

export interface SwapExecutionPlan {
  kind: 'single' | 'hybrid'
  /** Full route for quotes / UI (unchanged Trade type). */
  displayTrade: Trade
  steps: SwapStep[]
}

export interface HybridTradeResult {
  trade: Trade | null
  plan: SwapExecutionPlan | null
}

export type PairCombination = [Currency | undefined, Currency | undefined]
