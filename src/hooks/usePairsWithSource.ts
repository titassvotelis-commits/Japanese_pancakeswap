import { TokenAmount, Pair, Currency, Token } from '@pancakeswap/sdk'
import { useMemo } from 'react'
import { abi as IUniswapV2PairABI } from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import { Interface } from '@ethersproject/abi'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useMultipleContractSingleData } from '../state/multicall/hooks'
import { wrappedCurrency } from '../utils/wrappedCurrency'
import { PairState } from './usePairs'
import {
  FactoryConfig,
  KNOWN_LOCAL_PAIR_ADDRESSES,
  LiquiditySource,
  LOCAL_FACTORY,
  PANCAKE_FACTORY,
} from '../utils/swap/constants'
import { computePairAddressFromConfig } from '../utils/swap/pairAddress'
import { registerPairSource, registerPairSourceForTokens } from '../utils/swap/pairRegistry'
import { getCachedReserves, setCachedReserves } from '../utils/swap/reserveCache'
import { SourcedPair } from '../utils/swap/types'

const PAIR_INTERFACE = new Interface(IUniswapV2PairABI)

function resolvePairSource(
  pairAddress: string,
  config: FactoryConfig,
  chainId: number | undefined,
  tokenA: Token,
  tokenB: Token,
): void {
  const knownLocal = chainId ? KNOWN_LOCAL_PAIR_ADDRESSES[chainId] : undefined
  const source: LiquiditySource =
    knownLocal?.includes(pairAddress.toLowerCase()) ? 'local' : config.source

  registerPairSource(pairAddress, source)
  registerPairSourceForTokens(tokenA, tokenB, source)
}

export function usePairsWithSource(
  currencies: [Currency | undefined, Currency | undefined][],
  factoryConfig: FactoryConfig,
): [PairState, SourcedPair | null][] {
  const { chainId } = useActiveWeb3React()

  const tokens = useMemo(
    () =>
      currencies.map(([currencyA, currencyB]) => [
        wrappedCurrency(currencyA, chainId),
        wrappedCurrency(currencyB, chainId),
      ]),
    [chainId, currencies],
  )

  const pairAddresses = useMemo(
    () =>
      tokens.map(([tokenA, tokenB]) => {
        if (!tokenA || !tokenB || tokenA.equals(tokenB)) return undefined
        return computePairAddressFromConfig(tokenA, tokenB, factoryConfig)
      }),
    [tokens, factoryConfig],
  )

  const results = useMultipleContractSingleData(pairAddresses, PAIR_INTERFACE, 'getReserves')

  return useMemo(() => {
    return results.map((result, i) => {
      const { result: reserves, loading } = result
      const tokenA = tokens[i][0]
      const tokenB = tokens[i][1]
      const pairAddress = pairAddresses[i]

      if (loading) return [PairState.LOADING, null]
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null]
      if (!pairAddress || !reserves) return [PairState.NOT_EXISTS, null]

      const cached = getCachedReserves(pairAddress)
      const reserve0 = cached ? cached[0] : reserves.reserve0.toString()
      const reserve1 = cached ? cached[1] : reserves.reserve1.toString()
      if (!cached) {
        setCachedReserves(pairAddress, reserve0, reserve1)
      }

      const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
      const pair = new Pair(
        new TokenAmount(token0, reserve0),
        new TokenAmount(token1, reserve1),
      )

      resolvePairSource(pairAddress, factoryConfig, chainId, tokenA, tokenB)
      return [
        PairState.EXISTS,
        {
          pair,
          source: factoryConfig.source,
          pairAddress,
        },
      ]
    })
  }, [results, tokens, pairAddresses, factoryConfig, chainId])
}

/** Merge local + Pancake pairs; prefer local reserves when both exist for same token pair. */
export function mergeSourcedPairs(
  localResults: [PairState, SourcedPair | null][],
  pancakeResults: [PairState, SourcedPair | null][],
): Pair[] {
  const byTokenPair = new Map<string, Pair>()

  const key = (a: Token, b: Token) => {
    const [t0, t1] = a.sortsBefore(b) ? [a, b] : [b, a]
    return `${t0.address}-${t1.address}`
  }

  pancakeResults.forEach(([, sourced]) => {
    if (!sourced) return
    const t0 = sourced.pair.token0
    const t1 = sourced.pair.token1
    byTokenPair.set(key(t0, t1), sourced.pair)
  })

  localResults.forEach(([, sourced]) => {
    if (!sourced) return
    const t0 = sourced.pair.token0
    const t1 = sourced.pair.token1
    byTokenPair.set(key(t0, t1), sourced.pair)
  })

  return Array.from(byTokenPair.values())
}

export function useMergedPairsFromFactories(
  currencies: [Currency | undefined, Currency | undefined][],
): Pair[] {
  const local = usePairsWithSource(currencies, LOCAL_FACTORY)
  const pancake = usePairsWithSource(currencies, PANCAKE_FACTORY)
  return useMemo(() => mergeSourcedPairs(local, pancake), [local, pancake])
}

export interface LocalPairInfo {
  pair: Pair
  pairAddress: string
}

/** MetakeySwap factory pair — use for add/remove liquidity on the local router. */
export function useLocalPair(tokenA?: Currency, tokenB?: Currency): [PairState, LocalPairInfo | null] {
  const [[pairState, sourced]] = usePairsWithSource([[tokenA, tokenB]], LOCAL_FACTORY)
  if (!sourced) {
    return [pairState, null]
  }
  return [pairState, { pair: sourced.pair, pairAddress: sourced.pairAddress }]
}

/** Pancake V2 pairs only — used when local-first hybrid cannot run as a single transaction. */
export function usePancakeOnlyPairsFromFactories(
  currencies: [Currency | undefined, Currency | undefined][],
): Pair[] {
  const pancake = usePairsWithSource(currencies, PANCAKE_FACTORY)
  return useMemo(
    () =>
      pancake
        .map(([, sourced]) => sourced?.pair)
        .filter((pair): pair is Pair => Boolean(pair)),
    [pancake],
  )
}
