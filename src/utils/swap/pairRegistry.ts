import { ChainId, Pair, Token } from '@pancakeswap/sdk'
import { mainnetTokens } from 'config/constants/tokens'
import { KNOWN_LOCAL_PAIR_ADDRESSES, LiquiditySource, LOCAL_FACTORY } from './constants'
import { computePairAddressFromConfig } from './pairAddress'

/** Maps on-chain pair address → liquidity source (populated during reserve fetch). */
const pairSourceByAddress = new Map<string, LiquiditySource>()

/** Maps sorted token pair → source (used by SDK Trade, which keys pairs by Pancake init code). */
const pairSourceByTokenPair = new Map<string, LiquiditySource>()

function tokenPairKey(tokenA: Token, tokenB: Token): string {
  const [t0, t1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
  return `${t0.address.toLowerCase()}-${t1.address.toLowerCase()}`
}

export function registerPairSource(pairAddress: string, source: LiquiditySource): void {
  pairSourceByAddress.set(pairAddress.toLowerCase(), source)
}

export function registerPairSourceForTokens(tokenA: Token, tokenB: Token, source: LiquiditySource): void {
  pairSourceByTokenPair.set(tokenPairKey(tokenA, tokenB), source)
  registerPairSource(Pair.getAddress(tokenA, tokenB), source)
}

function isKnownLocalTokenPair(pair: Pair): boolean {
  const localAddress = computePairAddressFromConfig(pair.token0, pair.token1, LOCAL_FACTORY).toLowerCase()
  const known = KNOWN_LOCAL_PAIR_ADDRESSES[pair.chainId as ChainId] ?? []
  return known.includes(localAddress)
}

export function getPairSource(pair: Pair): LiquiditySource {
  const byTokens = pairSourceByTokenPair.get(tokenPairKey(pair.token0, pair.token1))
  if (byTokens) {
    return byTokens
  }

  const bySdkLiquidityToken = pairSourceByAddress.get(pair.liquidityToken.address.toLowerCase())
  if (bySdkLiquidityToken) {
    return bySdkLiquidityToken
  }

  const localAddress = computePairAddressFromConfig(pair.token0, pair.token1, LOCAL_FACTORY).toLowerCase()
  const byLocalContract = pairSourceByAddress.get(localAddress)
  if (byLocalContract) {
    return byLocalContract
  }

  if (isKnownLocalTokenPair(pair)) {
    return 'local'
  }

  return 'pancake'
}

export function getPairSourceByAddress(pairAddress: string): LiquiditySource | undefined {
  return pairSourceByAddress.get(pairAddress.toLowerCase())
}

export function clearPairRegistry(): void {
  pairSourceByAddress.clear()
  pairSourceByTokenPair.clear()
}

/** Pre-register MetakeySwap pools so routing works before multicall reserve fetch. */
function bootstrapKnownLocalPairs(): void {
  const chainId = ChainId.MAINNET
  KNOWN_LOCAL_PAIR_ADDRESSES[chainId]?.forEach((addr) => {
    registerPairSource(addr, 'local')
  })
  registerPairSourceForTokens(mainnetTokens.jnto, mainnetTokens.usdt, 'local')
  registerPairSourceForTokens(mainnetTokens.jnto, mainnetTokens.wbnb, 'local')
}

bootstrapKnownLocalPairs()
