/* eslint-disable no-param-reassign */
import { Currency, CurrencyAmount, Pair, Token, Trade } from '@pancakeswap/sdk'
import flatMap from 'lodash/flatMap'
import { useMemo } from 'react'
import useActiveWeb3React from 'hooks/useActiveWeb3React'

import { useUserSingleHopOnly } from 'state/user/hooks'
import { BASES_TO_CHECK_TRADES_AGAINST, CUSTOM_BASES, ADDITIONAL_BASES } from '../config/constants'
import { wrappedCurrency } from '../utils/wrappedCurrency'
import { selectBestTradeExactIn, selectBestTradeExactOut } from '../utils/swap/tradeSelection'
import { useMergedPairsFromFactories, usePancakeOnlyPairsFromFactories } from './usePairsWithSource'

import { useUnsupportedTokens } from './Tokens'

function useAllPairCombinations(currencyA?: Currency, currencyB?: Currency): [Token, Token][] {
  const { chainId } = useActiveWeb3React()

  const [tokenA, tokenB] = chainId
    ? [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)]
    : [undefined, undefined]

  const bases: Token[] = useMemo(() => {
    if (!chainId) return []

    const common = BASES_TO_CHECK_TRADES_AGAINST[chainId] ?? []
    const additionalA = tokenA ? ADDITIONAL_BASES[chainId]?.[tokenA.address] ?? [] : []
    const additionalB = tokenB ? ADDITIONAL_BASES[chainId]?.[tokenB.address] ?? [] : []

    return [...common, ...additionalA, ...additionalB]
  }, [chainId, tokenA, tokenB])

  const basePairs: [Token, Token][] = useMemo(
    () => flatMap(bases, (base): [Token, Token][] => bases.map((otherBase) => [base, otherBase])),
    [bases],
  )

  return useMemo(
    () =>
      tokenA && tokenB
        ? [
            [tokenA, tokenB],
            ...bases.map((base): [Token, Token] => [tokenA, base]),
            ...bases.map((base): [Token, Token] => [tokenB, base]),
            ...basePairs,
          ]
            .filter((tokens): tokens is [Token, Token] => Boolean(tokens[0] && tokens[1]))
            .filter(([t0, t1]) => t0.address !== t1.address)
            .filter(([tokenA_, tokenB_]) => {
              if (!chainId) return true
              const customBases = CUSTOM_BASES[chainId]

              const customBasesA: Token[] | undefined = customBases?.[tokenA_.address]
              const customBasesB: Token[] | undefined = customBases?.[tokenB_.address]

              if (!customBasesA && !customBasesB) return true

              if (customBasesA && !customBasesA.find((base) => tokenB_.equals(base))) return false
              if (customBasesB && !customBasesB.find((base) => tokenA_.equals(base))) return false

              return true
            })
        : [],
    [tokenA, tokenB, bases, basePairs, chainId],
  )
}

function useSwapPairSets(currencyA?: Currency, currencyB?: Currency): { mergedPairs: Pair[]; pancakeOnlyPairs: Pair[] } {
  const pairCombinations = useAllPairCombinations(currencyA, currencyB)
  const mergedPairsList = useMergedPairsFromFactories(pairCombinations)
  const pancakeOnlyPairs = usePancakeOnlyPairsFromFactories(pairCombinations)

  const mergedPairs = useMemo(
    () =>
      Object.values(
        mergedPairsList.reduce<{ [pairAddress: string]: Pair }>((memo, curr) => {
          memo[curr.liquidityToken.address] = memo[curr.liquidityToken.address] ?? curr
          return memo
        }, {}),
      ),
    [mergedPairsList],
  )

  return { mergedPairs, pancakeOnlyPairs }
}

/**
 * Returns the best trade for the exact amount of tokens in to the given token out
 */
export function useTradeExactIn(currencyAmountIn?: CurrencyAmount, currencyOut?: Currency): Trade | null {
  const { mergedPairs: allowedPairs, pancakeOnlyPairs } = useSwapPairSets(
    currencyAmountIn?.currency,
    currencyOut,
  )

  const [singleHopOnly] = useUserSingleHopOnly()

  return useMemo(() => {
    if (currencyAmountIn && currencyOut && allowedPairs.length > 0) {
      return selectBestTradeExactIn(allowedPairs, pancakeOnlyPairs, currencyAmountIn, currencyOut, singleHopOnly)
    }

    return null
  }, [allowedPairs, pancakeOnlyPairs, currencyAmountIn, currencyOut, singleHopOnly])
}

/**
 * Returns the best trade for the token in to the exact amount of token out
 */
export function useTradeExactOut(currencyIn?: Currency, currencyAmountOut?: CurrencyAmount): Trade | null {
  const { mergedPairs: allowedPairs, pancakeOnlyPairs } = useSwapPairSets(currencyIn, currencyAmountOut?.currency)

  const [singleHopOnly] = useUserSingleHopOnly()

  return useMemo(() => {
    if (currencyIn && currencyAmountOut && allowedPairs.length > 0) {
      return selectBestTradeExactOut(allowedPairs, pancakeOnlyPairs, currencyIn, currencyAmountOut, singleHopOnly)
    }
    return null
  }, [currencyIn, currencyAmountOut, allowedPairs, pancakeOnlyPairs, singleHopOnly])
}

export function useIsTransactionUnsupported(currencyIn?: Currency, currencyOut?: Currency): boolean {
  const unsupportedTokens: { [address: string]: Token } = useUnsupportedTokens()
  const { chainId } = useActiveWeb3React()

  const tokenIn = wrappedCurrency(currencyIn, chainId)
  const tokenOut = wrappedCurrency(currencyOut, chainId)

  // if unsupported list loaded & either token on list, mark as unsupported
  if (unsupportedTokens) {
    if (tokenIn && Object.keys(unsupportedTokens).includes(tokenIn.address)) {
      return true
    }
    if (tokenOut && Object.keys(unsupportedTokens).includes(tokenOut.address)) {
      return true
    }
  }

  return false
}
