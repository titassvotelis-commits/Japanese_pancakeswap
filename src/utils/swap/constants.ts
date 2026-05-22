import { ChainId } from '@pancakeswap/sdk'
import { FACTORY_ADDRESS, INIT_CODE_PAIR_HASH, ROUTER_ADDRESS } from 'config/constants'

/** Trusted external liquidity — PancakeSwap V2 on BSC mainnet only. */
export const PANCAKE_FACTORY_ADDRESS = '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'
export const PANCAKE_ROUTER_ADDRESS = '0x10ED43C718714eb63d5aA57B78B54704E256024E'
export const PANCAKE_INIT_CODE_PAIR_HASH =
  '0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5'

export type LiquiditySource = 'local' | 'pancake'

export interface FactoryConfig {
  source: LiquiditySource
  factory: string
  initCodeHash: string
  router: string
}

export const LOCAL_FACTORY: FactoryConfig = {
  source: 'local',
  factory: FACTORY_ADDRESS,
  initCodeHash: INIT_CODE_PAIR_HASH,
  router: ROUTER_ADDRESS,
}

export const PANCAKE_FACTORY: FactoryConfig = {
  source: 'pancake',
  factory: PANCAKE_FACTORY_ADDRESS,
  initCodeHash: PANCAKE_INIT_CODE_PAIR_HASH,
  router: PANCAKE_ROUTER_ADDRESS,
}

/** Routers the swap executor may call. */
export const TRUSTED_ROUTERS: Record<LiquiditySource, string> = {
  local: ROUTER_ADDRESS,
  pancake: PANCAKE_ROUTER_ADDRESS,
}

/** Known MetakeySwap pools (from contracts/deployment.json). */
export const KNOWN_LOCAL_PAIR_ADDRESSES: Record<number, string[]> = {
  [ChainId.MAINNET]: [
    '0xF1bF81BD05b0eAaA8a4E229D1782D4d0B7763850', // JNTo-USDT
    '0x99B749fd0AFc7970Ba0F4b40Fe2d6F30F405e096', // JNTo-WBNB
  ].map((a) => a.toLowerCase()),
}

export const RESERVE_CACHE_TTL_MS = 30_000
export const MAX_ROUTE_HOPS = 3
