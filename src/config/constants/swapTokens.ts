import { mainnetTokens, testnetTokens } from './tokens'

/** Lower value = appears earlier in token search (after balance sort). */
const CORE_TOKEN_PRIORITIES: Record<string, number> = {
  [mainnetTokens.jnto.address.toLowerCase()]: 0,
  [mainnetTokens.usdt.address.toLowerCase()]: 1,
  [mainnetTokens.busd.address.toLowerCase()]: 2,
  [mainnetTokens.usdc.address.toLowerCase()]: 3,
  [mainnetTokens.wbnb.address.toLowerCase()]: 4,
  [mainnetTokens.bnb.address.toLowerCase()]: 4,
  [mainnetTokens.opt.address.toLowerCase()]: 5,
  [testnetTokens.wbnb.address.toLowerCase()]: 0,
  [testnetTokens.cake.address.toLowerCase()]: 1,
  [testnetTokens.busd.address.toLowerCase()]: 2,
}

const DEFAULT_PRIORITY = 999

export function getCoreTokenPriority(tokenAddress: string): number {
  return CORE_TOKEN_PRIORITIES[tokenAddress.toLowerCase()] ?? DEFAULT_PRIORITY
}
