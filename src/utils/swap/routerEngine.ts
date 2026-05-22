import { Currency, CurrencyAmount, Trade } from '@pancakeswap/sdk'
import { isTradeBetter } from 'utils/trades'
import { BETTER_TRADE_LESS_HOPS_THRESHOLD } from 'config/constants'
import { MAX_ROUTE_HOPS } from './constants'
import { buildExecutionPlan } from './routeComposer'
import { HybridTradeResult } from './types'

/**
 * Pick the best V2 trade across a merged pair graph and build an execution plan.
 */
export function findBestTradeExactIn(
  pairs: import('@pancakeswap/sdk').Pair[],
  currencyAmountIn: CurrencyAmount,
  currencyOut: Currency,
  singleHopOnly: boolean,
): HybridTradeResult {
  if (pairs.length === 0) {
    return { trade: null, plan: null }
  }

  if (singleHopOnly) {
    const trade =
      Trade.bestTradeExactIn(pairs, currencyAmountIn, currencyOut, { maxHops: 1, maxNumResults: 1 })[0] ?? null
    return { trade, plan: trade ? buildExecutionPlan(trade) : null }
  }

  let bestTrade: Trade | null = null
  for (let hops = 1; hops <= MAX_ROUTE_HOPS; hops++) {
    const current =
      Trade.bestTradeExactIn(pairs, currencyAmountIn, currencyOut, { maxHops: hops, maxNumResults: 1 })[0] ?? null
    if (isTradeBetter(bestTrade, current, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
      bestTrade = current
    }
  }

  return { trade: bestTrade, plan: bestTrade ? buildExecutionPlan(bestTrade) : null }
}

export function findBestTradeExactOut(
  pairs: import('@pancakeswap/sdk').Pair[],
  currencyIn: Currency,
  currencyAmountOut: CurrencyAmount,
  singleHopOnly: boolean,
): HybridTradeResult {
  if (pairs.length === 0) {
    return { trade: null, plan: null }
  }

  if (singleHopOnly) {
    const trade =
      Trade.bestTradeExactOut(pairs, currencyIn, currencyAmountOut, { maxHops: 1, maxNumResults: 1 })[0] ?? null
    return { trade, plan: trade ? buildExecutionPlan(trade) : null }
  }

  let bestTrade: Trade | null = null
  for (let hops = 1; hops <= MAX_ROUTE_HOPS; hops++) {
    const current =
      Trade.bestTradeExactOut(pairs, currencyIn, currencyAmountOut, { maxHops: hops, maxNumResults: 1 })[0] ?? null
    if (isTradeBetter(bestTrade, current, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
      bestTrade = current
    }
  }

  return { trade: bestTrade, plan: bestTrade ? buildExecutionPlan(bestTrade) : null }
}
