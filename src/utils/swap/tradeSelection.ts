import { Currency, CurrencyAmount, ETHER, Trade } from '@pancakeswap/sdk'
import { isTradeBetter } from 'utils/trades'
import { BETTER_TRADE_LESS_HOPS_THRESHOLD } from 'config/constants'
import { buildExecutionPlan } from './routeComposer'
import { canExecuteHybridSingleTx } from './hybridSwap'

const MAX_HOPS = 3

/** One MetaMask confirmation — single router call or hybrid executor (not sequential hybrid). */
export function isOneStepWalletTrade(trade: Trade | null): boolean {
  if (!trade) {
    return false
  }
  const plan = buildExecutionPlan(trade)
  if (plan.kind === 'single') {
    return true
  }
  return canExecuteHybridSingleTx(plan)
}

function findBestExactIn(
  pairs: import('@pancakeswap/sdk').Pair[],
  currencyAmountIn: CurrencyAmount,
  currencyOut: Currency,
  singleHopOnly: boolean,
): Trade | null {
  if (pairs.length === 0) {
    return null
  }

  if (singleHopOnly) {
    return Trade.bestTradeExactIn(pairs, currencyAmountIn, currencyOut, { maxHops: 1, maxNumResults: 1 })[0] ?? null
  }

  let bestTrade: Trade | null = null
  for (let hops = 1; hops <= MAX_HOPS; hops += 1) {
    const current =
      Trade.bestTradeExactIn(pairs, currencyAmountIn, currencyOut, { maxHops: hops, maxNumResults: 1 })[0] ?? null
    if (isTradeBetter(bestTrade, current, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
      bestTrade = current
    }
  }
  return bestTrade
}

function findBestExactOut(
  pairs: import('@pancakeswap/sdk').Pair[],
  currencyIn: Currency,
  currencyAmountOut: CurrencyAmount,
  singleHopOnly: boolean,
): Trade | null {
  if (pairs.length === 0) {
    return null
  }

  if (singleHopOnly) {
    return Trade.bestTradeExactOut(pairs, currencyIn, currencyAmountOut, { maxHops: 1, maxNumResults: 1 })[0] ?? null
  }

  let bestTrade: Trade | null = null
  for (let hops = 1; hops <= MAX_HOPS; hops += 1) {
    const current =
      Trade.bestTradeExactOut(pairs, currencyIn, currencyAmountOut, { maxHops: hops, maxNumResults: 1 })[0] ?? null
    if (isTradeBetter(bestTrade, current, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
      bestTrade = current
    }
  }
  return bestTrade
}

/**
 * BNB swaps through BNB > USDT > JNTo (2-step hybrid) often fail MetaMask simulation.
 * Prefer a direct single-hop pool (e.g. BNB > JNTo on MetakeySwap) when it exists.
 */
function preferDirectNativeRoute(
  mergedPairs: import('@pancakeswap/sdk').Pair[],
  currencyAmountIn: CurrencyAmount,
  currencyOut: Currency,
): Trade | null {
  if (currencyAmountIn.currency !== ETHER) {
    return null
  }
  const direct = findBestExactIn(mergedPairs, currencyAmountIn, currencyOut, true)
  return direct && isOneStepWalletTrade(direct) ? direct : null
}

function preferDirectNativeRouteExactOut(
  mergedPairs: import('@pancakeswap/sdk').Pair[],
  currencyIn: Currency,
  currencyAmountOut: CurrencyAmount,
): Trade | null {
  if (currencyIn !== ETHER) {
    return null
  }
  const direct = findBestExactOut(mergedPairs, currencyIn, currencyAmountOut, true)
  return direct && isOneStepWalletTrade(direct) ? direct : null
}

/**
 * Prefer a route that can settle in one wallet confirmation (single router or hybrid executor).
 * Falls back to Pancake-only liquidity when a local-first hybrid would otherwise require two separate txs.
 */
export function selectBestTradeExactIn(
  mergedPairs: import('@pancakeswap/sdk').Pair[],
  pancakeOnlyPairs: import('@pancakeswap/sdk').Pair[],
  currencyAmountIn: CurrencyAmount,
  currencyOut: Currency,
  singleHopOnly: boolean,
): Trade | null {
  const directNative = preferDirectNativeRoute(mergedPairs, currencyAmountIn, currencyOut)
  if (directNative) {
    return directNative
  }

  const mergedTrade = findBestExactIn(mergedPairs, currencyAmountIn, currencyOut, singleHopOnly)
  const pancakeTrade = findBestExactIn(pancakeOnlyPairs, currencyAmountIn, currencyOut, singleHopOnly)

  if (!mergedTrade) {
    return pancakeTrade
  }
  if (!pancakeTrade) {
    return mergedTrade
  }

  const mergedPlan = buildExecutionPlan(mergedTrade)
  if (canExecuteHybridSingleTx(mergedPlan)) {
    return mergedTrade
  }

  if (mergedPlan.kind === 'hybrid' && mergedPlan.steps.length > 1) {
    const pancakePlan = buildExecutionPlan(pancakeTrade)
    if (pancakePlan.kind === 'single' || canExecuteHybridSingleTx(pancakePlan)) {
      return isTradeBetter(mergedTrade, pancakeTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD) ? pancakeTrade : mergedTrade
    }
    return pancakeTrade
  }

  return isTradeBetter(mergedTrade, pancakeTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD) ? mergedTrade : pancakeTrade
}

export function selectBestTradeExactOut(
  mergedPairs: import('@pancakeswap/sdk').Pair[],
  pancakeOnlyPairs: import('@pancakeswap/sdk').Pair[],
  currencyIn: Currency,
  currencyAmountOut: CurrencyAmount,
  singleHopOnly: boolean,
): Trade | null {
  const directNative = preferDirectNativeRouteExactOut(mergedPairs, currencyIn, currencyAmountOut)
  if (directNative) {
    return directNative
  }

  const mergedTrade = findBestExactOut(mergedPairs, currencyIn, currencyAmountOut, singleHopOnly)
  const pancakeTrade = findBestExactOut(pancakeOnlyPairs, currencyIn, currencyAmountOut, singleHopOnly)

  if (!mergedTrade) {
    return pancakeTrade
  }
  if (!pancakeTrade) {
    return mergedTrade
  }

  const mergedPlan = buildExecutionPlan(mergedTrade)
  if (canExecuteHybridSingleTx(mergedPlan)) {
    return mergedTrade
  }

  if (mergedPlan.kind === 'hybrid' && mergedPlan.steps.length > 1) {
    const pancakePlan = buildExecutionPlan(pancakeTrade)
    if (pancakePlan.kind === 'single' || canExecuteHybridSingleTx(pancakePlan)) {
      return isTradeBetter(mergedTrade, pancakeTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD) ? pancakeTrade : mergedTrade
    }
    return pancakeTrade
  }

  return isTradeBetter(mergedTrade, pancakeTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD) ? mergedTrade : pancakeTrade
}
