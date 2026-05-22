import { ChainId, JSBI, Percent, Token } from '@pancakeswap/sdk'
import { mainnetTokens, testnetTokens } from './tokens'

/** MetakeySwap DEX — synced from contracts/deployment.json */
export const FACTORY_ADDRESS = '0x190D658a7819712cEda30Bc6088BD9baCb2433A6'
export const ROUTER_ADDRESS = '0x27945c9Eac917F33477297FcBe98a8BC1eb71a9A'
export const INIT_CODE_PAIR_HASH = '0xbbd02c586e691d910de581d722990c2f50ddd8a894aaed3c49f664474e1a5253'
/** One-tx Pancake + MetakeySwap — set by contracts npm run deploy-hybrid-executor */
export const HYBRID_SWAP_EXECUTOR_ADDRESS = '0xcEE258BD756De5B309fd870d7ea821ff91655C15'
/** True after redeploying HybridSwapExecutor with swapExactTokensForTokensLocalFirst */
export const HYBRID_SWAP_SUPPORTS_LOCAL_FIRST = true

/** PancakeSwap V2 on BSC — external liquidity for hybrid routing (swap module only). */
export const PANCAKE_FACTORY_ADDRESS = '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'
export const PANCAKE_ROUTER_ADDRESS = '0x10ED43C718714eb63d5aA57B78B54704E256024E'
export const PANCAKE_INIT_CODE_PAIR_HASH =
  '0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5'

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}

export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  [ChainId.MAINNET]: [
    mainnetTokens.jnto,
    mainnetTokens.usdt,
    mainnetTokens.wbnb,
    mainnetTokens.busd,
    mainnetTokens.usdc,
  ],
  [ChainId.TESTNET]: [testnetTokens.wbnb, testnetTokens.cake, testnetTokens.busd],
}

/** Prefer routing through JNTo + stables for this DEX's pools. */
export const ADDITIONAL_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.MAINNET]: {
    [mainnetTokens.usdt.address]: [mainnetTokens.jnto, mainnetTokens.wbnb, mainnetTokens.busd],
    [mainnetTokens.wbnb.address]: [mainnetTokens.jnto, mainnetTokens.usdt],
    [mainnetTokens.jnto.address]: [
      mainnetTokens.usdt,
      mainnetTokens.wbnb,
      mainnetTokens.busd,
      mainnetTokens.tko,
    ],
    [mainnetTokens.busd.address]: [mainnetTokens.jnto, mainnetTokens.usdt],
  },
}

export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.MAINNET]: {},
}

export const SUGGESTED_BASES: ChainTokenList = {
  [ChainId.MAINNET]: [
    mainnetTokens.jnto,
    mainnetTokens.usdt,
    mainnetTokens.busd,
    mainnetTokens.usdc,
    mainnetTokens.wbnb,
  ],
  [ChainId.TESTNET]: [testnetTokens.wbnb, testnetTokens.cake, testnetTokens.busd],
}

export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  [ChainId.MAINNET]: [mainnetTokens.wbnb, mainnetTokens.usdt, mainnetTokens.jnto],
  [ChainId.TESTNET]: [testnetTokens.wbnb, testnetTokens.cake, testnetTokens.busd],
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  [ChainId.MAINNET]: [
    [mainnetTokens.jnto, mainnetTokens.usdt],
    [mainnetTokens.jnto, mainnetTokens.wbnb],
  ],
}

export const NetworkContextName = 'NETWORK'

/** Minimum BNB input for swaps — smaller amounts often fail wallet simulation. */
export const MIN_NATIVE_SWAP_BNB = '0.0001'

export const INITIAL_ALLOWED_SLIPPAGE = 50
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

export const BIG_INT_ZERO = JSBI.BigInt(0)
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE)
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE)
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE)
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE)
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE)

export const MIN_BNB: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16))
export const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(JSBI.BigInt(50), JSBI.BigInt(10000))
export const ZERO_PERCENT = new Percent('0')
export const ONE_HUNDRED_PERCENT = new Percent('1')

export const BLOCKED_ADDRESSES: string[] = []

export { default as farmsConfig } from './farms'
export { default as poolsConfig } from './pools'
export { default as ifosConfig } from './ifo'
