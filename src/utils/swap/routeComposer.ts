import { ChainId, Currency, CurrencyAmount, ETHER, Pair, Route, Token, TokenAmount, Trade, TradeType } from '@pancakeswap/sdk'
import { HYBRID_SWAP_EXECUTOR_ADDRESS } from 'config/constants'
import { TRUSTED_ROUTERS } from './constants'
import { getPairSource } from './pairRegistry'
import { SwapExecutionPlan, SwapStep } from './types'

/** Reconstruct SDK Token instances (avoids duplicate-module instanceof failures). */
function ensureTradeCurrency(currency: Currency, chainId: ChainId): Currency {
  if (currency === ETHER) {
    return ETHER
  }
  const token = currency as Token
  if (!token?.address) {
    throw new Error('Invalid currency in trade route')
  }
  return new Token(chainId, token.address, token.decimals, token.symbol ?? 'TOKEN', token.name ?? 'Token')
}

function getTradeChainId(trade: Trade): ChainId {
  return trade.route.chainId
}

/** Rebuild pair reserves with canonical SDK Token instances (avoids bestTradeExactIn failures). */
function rebuildPair(pair: Pair, chainId: ChainId): Pair {
  return new Pair(
    new TokenAmount(ensureTradeCurrency(pair.token0, chainId) as Token, pair.reserve0.raw.toString()),
    new TokenAmount(ensureTradeCurrency(pair.token1, chainId) as Token, pair.reserve1.raw.toString()),
  )
}

function normalizeTokenAmount(amount: CurrencyAmount, chainId: ChainId): TokenAmount {
  const currency = ensureTradeCurrency(amount.currency, chainId)
  if (currency === ETHER || !(amount instanceof TokenAmount)) {
    throw new Error('Hybrid segment routing requires ERC20 amounts')
  }
  return new TokenAmount(currency as Token, amount.raw.toString())
}

function walkPairsOutput(pairs: Pair[], amountIn: TokenAmount): TokenAmount {
  return pairs.reduce((amount, pair) => pair.getOutputAmount(amount)[0], amountIn)
}

function walkPairsInput(pairs: Pair[], amountOut: TokenAmount): TokenAmount {
  return pairs.reduceRight((amount, pair) => pair.getInputAmount(amount)[0], amountOut)
}

function segmentInputCurrency(fullTrade: Trade, path: Currency[], pairStart: number, chainId: ChainId): Currency {
  if (pairStart === 0 && fullTrade.inputAmount.currency === ETHER) {
    return ETHER
  }
  return ensureTradeCurrency(path[0], chainId)
}

function buildSegmentTradeExactIn(fullTrade: Trade, pairStart: number, pairEnd: number): Trade {
  const chainId = getTradeChainId(fullTrade)
  const path = fullTrade.route.path.slice(pairStart, pairEnd + 1)
  const pairs = fullTrade.route.pairs.slice(pairStart, pairEnd).map((pair) => rebuildPair(pair, chainId))
  const inputCurrency = segmentInputCurrency(fullTrade, path, pairStart, chainId)
  const outputCurrency = ensureTradeCurrency(path[path.length - 1], chainId)

  const baseInput = fullTrade.inputAmount.currency === ETHER
    ? fullTrade.inputAmount
    : normalizeTokenAmount(fullTrade.inputAmount, chainId)
  const inputAmount =
    pairStart === 0
      ? baseInput
      : walkPairsOutput(
          fullTrade.route.pairs.slice(0, pairStart).map((pair) => rebuildPair(pair, chainId)),
          baseInput as TokenAmount,
        )

  const route = new Route(pairs, inputCurrency, outputCurrency)
  return Trade.exactIn(route, inputAmount)
}

function buildSegmentTradeExactOut(fullTrade: Trade, pairStart: number, pairEnd: number): Trade {
  const chainId = getTradeChainId(fullTrade)
  const path = fullTrade.route.path.slice(pairStart, pairEnd + 1)
  const pairs = fullTrade.route.pairs.slice(pairStart, pairEnd).map((pair) => rebuildPair(pair, chainId))
  const inputCurrency = segmentInputCurrency(fullTrade, path, pairStart, chainId)
  const outputCurrency = ensureTradeCurrency(path[path.length - 1], chainId)

  const baseOutput = normalizeTokenAmount(fullTrade.outputAmount, chainId)
  const outputAmount =
    pairEnd >= fullTrade.route.pairs.length
      ? baseOutput
      : walkPairsInput(
          fullTrade.route.pairs.slice(pairEnd).map((pair) => rebuildPair(pair, chainId)),
          baseOutput,
        )

  const route = new Route(pairs, inputCurrency, outputCurrency)
  return Trade.exactOut(route, outputAmount)
}

function buildSegmentTrade(fullTrade: Trade, pairStart: number, pairEnd: number): Trade {
  if (fullTrade.tradeType === TradeType.EXACT_INPUT) {
    return buildSegmentTradeExactIn(fullTrade, pairStart, pairEnd)
  }
  return buildSegmentTradeExactOut(fullTrade, pairStart, pairEnd)
}

function singleStepPlan(trade: Trade, source: keyof typeof TRUSTED_ROUTERS): SwapExecutionPlan {
  return {
    kind: 'single',
    displayTrade: trade,
    steps: [{ trade, source, routerAddress: TRUSTED_ROUTERS[source] }],
  }
}

/**
 * Split a multi-source route into sequential swaps (one trusted router per step).
 */
export function decomposeTradeToSteps(trade: Trade): SwapStep[] {
  const { pairs } = trade.route
  if (pairs.length === 0) {
    return [{ trade, source: 'pancake', routerAddress: TRUSTED_ROUTERS.pancake }]
  }

  const segments: { start: number; end: number; source: ReturnType<typeof getPairSource> }[] = []
  let segStart = 0
  let currentSource = getPairSource(pairs[0])

  for (let i = 1; i < pairs.length; i++) {
    const src = getPairSource(pairs[i])
    if (src !== currentSource) {
      segments.push({ start: segStart, end: i, source: currentSource })
      segStart = i
      currentSource = src
    }
  }
  segments.push({ start: segStart, end: pairs.length, source: currentSource })

  if (segments.length === 1) {
    return [
      {
        trade,
        source: segments[0].source,
        routerAddress: TRUSTED_ROUTERS[segments[0].source],
      },
    ]
  }

  return segments.map((seg) => ({
    trade: buildSegmentTrade(trade, seg.start, seg.end),
    source: seg.source,
    routerAddress: TRUSTED_ROUTERS[seg.source],
  }))
}

function buildFallbackSteps(trade: Trade): SwapStep[] {
  const { pairs } = trade.route
  if (pairs.length === 0) {
    return [{ trade, source: 'pancake', routerAddress: TRUSTED_ROUTERS.pancake }]
  }

  const sources = pairs.map((pair) => getPairSource(pair))
  const uniqueSources = [...new Set(sources)]

  if (uniqueSources.length === 1) {
    const source = uniqueSources[0]
    return [{ trade, source, routerAddress: TRUSTED_ROUTERS[source] }]
  }

  const boundary = sources.findIndex((source, index) => index > 0 && source !== sources[index - 1])
  if (boundary > 0) {
    try {
      return [
        {
          trade: buildSegmentTrade(trade, 0, boundary),
          source: sources[0],
          routerAddress: TRUSTED_ROUTERS[sources[0]],
        },
        {
          trade: buildSegmentTrade(trade, boundary, pairs.length),
          source: sources[boundary],
          routerAddress: TRUSTED_ROUTERS[sources[boundary]],
        },
      ]
    } catch (error) {
      console.warn('Hybrid segment split failed', error)
    }
  }

  return decomposeAtSourceBoundary(trade)
}

function decomposeAtSourceBoundary(trade: Trade): SwapStep[] {
  const { pairs } = trade.route
  const sources = pairs.map((pair) => getPairSource(pair))
  const boundary = sources.findIndex((source, index) => index > 0 && source !== sources[index - 1])

  if (boundary <= 0) {
    const source = sources[0] ?? 'pancake'
    return [{ trade, source, routerAddress: TRUSTED_ROUTERS[source] }]
  }

  return [
    {
      trade: buildSegmentTrade(trade, 0, boundary),
      source: sources[0],
      routerAddress: TRUSTED_ROUTERS[sources[0]],
    },
    {
      trade: buildSegmentTrade(trade, boundary, pairs.length),
      source: sources[boundary],
      routerAddress: TRUSTED_ROUTERS[sources[boundary]],
    },
  ]
}

export function buildExecutionPlan(trade: Trade): SwapExecutionPlan {
  const { pairs } = trade.route

  if (pairs.length === 0) {
    return singleStepPlan(trade, 'pancake')
  }

  try {
    const steps = decomposeTradeToSteps(trade)
    return {
      kind: steps.length > 1 ? 'hybrid' : 'single',
      displayTrade: trade,
      steps,
    }
  } catch (error) {
    console.warn('decomposeTradeToSteps failed', error)
  }

  try {
    const steps = buildFallbackSteps(trade)
    return {
      kind: steps.length > 1 ? 'hybrid' : 'single',
      displayTrade: trade,
      steps,
    }
  } catch (error) {
    console.warn('buildFallbackSteps failed', error)
  }

  try {
    const steps = decomposeAtSourceBoundary(trade)
    return {
      kind: steps.length > 1 ? 'hybrid' : 'single',
      displayTrade: trade,
      steps,
    }
  } catch (error) {
    console.warn('decomposeAtSourceBoundary failed', error)
  }

  const sources = pairs.map((pair) => getPairSource(pair))
  const uniqueSources = [...new Set(sources)]
  const source: keyof typeof TRUSTED_ROUTERS = uniqueSources[0] ?? 'local'
  return singleStepPlan(trade, source)
}

export function getPrimaryRouterAddress(plan: SwapExecutionPlan): string {
  return plan.steps[0]?.routerAddress ?? TRUSTED_ROUTERS.local
}

/** Spender for ERC20 approve — hybrid uses the executor contract when deployed. */
export function getApprovalRouterAddress(plan: SwapExecutionPlan): string {
  if (
    plan.kind === 'hybrid' &&
    plan.steps.length > 1 &&
    HYBRID_SWAP_EXECUTOR_ADDRESS &&
    HYBRID_SWAP_EXECUTOR_ADDRESS.length > 2
  ) {
    return HYBRID_SWAP_EXECUTOR_ADDRESS
  }
  return getPrimaryRouterAddress(plan)
}
