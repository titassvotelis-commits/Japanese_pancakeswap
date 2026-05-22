import { ChainId, JSBI, Pair, Token, TokenAmount } from '@pancakeswap/sdk'

const ZERO = JSBI.BigInt(0)

/** LP token for MetakeySwap — pair contract address, not Pancake SDK CREATE2. */
export function getLocalLpToken(chainId: ChainId, pairAddress: string): Token {
  return new Token(chainId, pairAddress, 18, 'MK-LP', 'MetakeySwap LP')
}

/**
 * Same math as Pair.getLiquidityMinted but uses the on-chain pair address for the LP token.
 * SDK Pair.liquidityToken is derived from Pancake factory/init code and does not match local pools.
 */
export function computeLiquidityMinted(
  totalSupply: TokenAmount,
  lpToken: Token,
  pair: Pair,
  tokenAmountA: TokenAmount,
  tokenAmountB: TokenAmount,
): TokenAmount | undefined {
  const tokenAmounts = tokenAmountA.token.sortsBefore(tokenAmountB.token)
    ? [tokenAmountA, tokenAmountB]
    : [tokenAmountB, tokenAmountA]

  if (!tokenAmounts[0].token.equals(pair.token0) || !tokenAmounts[1].token.equals(pair.token1)) {
    return undefined
  }

  const amount0 = JSBI.divide(JSBI.multiply(tokenAmounts[0].raw, totalSupply.raw), pair.reserve0.raw)
  const amount1 = JSBI.divide(JSBI.multiply(tokenAmounts[1].raw, totalSupply.raw), pair.reserve1.raw)
  const liquidity = JSBI.lessThanOrEqual(amount0, amount1) ? amount0 : amount1

  if (!JSBI.greaterThan(liquidity, ZERO)) {
    return undefined
  }

  return new TokenAmount(lpToken, liquidity)
}

/** Token amounts returned when burning LP (uses on-chain pair address for supply). */
export function computeLiquidityValue(
  pair: Pair,
  token: Token,
  totalSupply: TokenAmount,
  liquidity: TokenAmount,
): TokenAmount | undefined {
  if (!pair.involvesToken(token)) {
    return undefined
  }
  if (JSBI.greaterThan(liquidity.raw, totalSupply.raw)) {
    return undefined
  }
  return new TokenAmount(
    token,
    JSBI.divide(JSBI.multiply(liquidity.raw, pair.reserveOf(token).raw), totalSupply.raw),
  )
}

/**
 * True when amounts match pool reserves (router addLiquidity semantics).
 * Reserve-quoted amounts use integer division (floor), so allow a sub-1-token0 wei gap.
 */
export function amountsMatchPoolRatio(
  pair: Pair,
  tokenAmountA: TokenAmount,
  tokenAmountB: TokenAmount,
): boolean {
  const tokenAmounts = tokenAmountA.token.sortsBefore(tokenAmountB.token)
    ? [tokenAmountA, tokenAmountB]
    : [tokenAmountB, tokenAmountA]

  if (!tokenAmounts[0].token.equals(pair.token0) || !tokenAmounts[1].token.equals(pair.token1)) {
    return false
  }

  const lhs = JSBI.multiply(tokenAmounts[0].raw, pair.reserve1.raw)
  const rhs = JSBI.multiply(tokenAmounts[1].raw, pair.reserve0.raw)

  if (JSBI.equal(lhs, rhs)) {
    return true
  }

  // amount1 derived from amount0 via floor(amount0 * r1 / r0)
  if (JSBI.greaterThan(lhs, rhs)) {
    return JSBI.lessThan(JSBI.subtract(lhs, rhs), pair.reserve0.raw)
  }

  // amount0 derived from amount1 via floor(amount1 * r0 / r1)
  if (JSBI.greaterThan(rhs, lhs)) {
    return JSBI.lessThan(JSBI.subtract(rhs, lhs), pair.reserve1.raw)
  }

  return false
}
