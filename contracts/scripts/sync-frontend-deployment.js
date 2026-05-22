/**
 * Writes deployed addresses into optimus-finance-main/src config.
 * Run from contracts/: npm run sync-frontend
 */
const fs = require('fs')
const path = require('path')

const deployment = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'deployment.json'), 'utf8'),
)

const srcRoot = path.join(__dirname, '..', '..', 'src')
const { jnto, factory, router, initCodePairHash, masterChef, sousChef, pairJNToUsdt, usdt } =
  deployment

function write(relPath, content) {
  const p = path.join(srcRoot, relPath)
  fs.writeFileSync(p, content)
  console.log('Updated', relPath)
}

write(
  'config/constants/index.ts',
  `import { ChainId, JSBI, Percent, Token } from '@pancakeswap/sdk'
import { mainnetTokens, testnetTokens } from './tokens'

/** MetakeySwap DEX — synced from contracts/deployment.json */
export const FACTORY_ADDRESS = '${factory}'
export const ROUTER_ADDRESS = '${router}'
export const INIT_CODE_PAIR_HASH = '${initCodePairHash}'

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}

export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  [ChainId.MAINNET]: [
    mainnetTokens.wbnb,
    mainnetTokens.jnto,
    mainnetTokens.usdt,
    mainnetTokens.busd,
    mainnetTokens.btcb,
    mainnetTokens.eth,
    mainnetTokens.usdc,
  ],
  [ChainId.TESTNET]: [testnetTokens.wbnb, testnetTokens.cake, testnetTokens.busd],
}

export const ADDITIONAL_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.MAINNET]: {},
}

export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.MAINNET]: {},
}

export const SUGGESTED_BASES: ChainTokenList = {
  [ChainId.MAINNET]: [mainnetTokens.usdt, mainnetTokens.jnto, mainnetTokens.wbnb],
  [ChainId.TESTNET]: [testnetTokens.wbnb, testnetTokens.cake, testnetTokens.busd],
}

export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  [ChainId.MAINNET]: [mainnetTokens.wbnb, mainnetTokens.usdt, mainnetTokens.jnto],
  [ChainId.TESTNET]: [testnetTokens.wbnb, testnetTokens.cake, testnetTokens.busd],
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  [ChainId.MAINNET]: [[mainnetTokens.jnto, mainnetTokens.usdt]],
}

export const NetworkContextName = 'NETWORK'

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
`,
)

// Patch tokens.ts — add jnto, point mk alias to same address for legacy UI strings
const tokensPath = path.join(srcRoot, 'config/constants/tokens.ts')
let tokensTs = fs.readFileSync(tokensPath, 'utf8')

const jntoBlock = `  jnto: new Token(
    MAINNET,
    '${jnto}',
    18,
    'JNTo',
    'JNToken',
    'https://optimuswap.io/',
  ),
`

if (!tokensTs.includes('jnto:')) {
  tokensTs = tokensTs.replace(
    'export const mainnetTokens = {',
    `export const mainnetTokens = {\n${jntoBlock}`,
  )
}

tokensTs = tokensTs.replace(
  /mk: new Token\(\s*MAINNET,\s*'[^']+',/,
  `mk: new Token(
    MAINNET,
    '${jnto}',`,
)
tokensTs = tokensTs.replace(/'MK',\s*\n\s*'Metakey',/, "'JNTo',\n    'JNToken',")

fs.writeFileSync(tokensPath, tokensTs)
console.log('Updated config/constants/tokens.ts')

write(
  'config/constants/contracts.ts',
  `export default {
  cake: {
    97: '',
    56: '${jnto}',
  },
  masterChef: {
    97: '',
    56: '${masterChef}',
  },
  sousChef: {
    97: '',
    56: '${sousChef}',
  },
  lotteryV2: {
    97: '',
    56: '',
  },
  multiCall: {
    56: '0xfF6FD90A470Aaa0c1B8A54681746b07AcdFedc9B',
    97: '0x8F3273Fb89B075b1645095ABaC6ed17B2d4Bc576',
  },
  pancakeProfile: {
    56: '',
    97: '',
  },
  pancakeRabbits: {
    56: '',
    97: '',
  },
  bunnyFactory: {
    56: '',
    97: '',
  },
  claimRefund: {
    56: '',
    97: '',
  },
  pointCenterIfo: {
    56: '',
    97: '',
  },
  bunnySpecial: {
    56: '',
    97: '',
  },
  tradingCompetition: {
    56: '',
    97: '',
  },
  easterNft: {
    56: '',
    97: '',
  },
  cakeVault: {
    56: '',
    97: '',
  },
  predictions: {
    56: '',
    97: '',
  },
  chainlinkOracle: {
    56: '',
    97: '',
  },
  bunnySpecialCakeVault: {
    56: '',
    97: '',
  },
  bunnySpecialPrediction: {
    56: '',
    97: '',
  },
  bunnySpecialLottery: {
    56: '',
    97: '',
  },
  farmAuction: {
    56: '',
    97: '',
  },
  AnniversaryAchievement: {
    56: '',
    97: '',
  },
  nftMarket: {
    56: '',
    97: '',
  },
}
`,
)

write(
  'config/constants/farms.ts',
  `import { serializeTokens } from './tokens'
import { SerializedFarmConfig } from './types'

const serializedTokens = serializeTokens()

/** Single farm — MasterChef pid 0 = JNTo-USDT LP */
const farms: SerializedFarmConfig[] = [
  {
    pid: 0,
    lpSymbol: 'JNTo-USDT LP',
    label: '',
    lpAddresses: {
      97: '',
      56: '${pairJNToUsdt}',
    },
    token: serializedTokens.jnto,
    quoteToken: serializedTokens.usdt,
  },
]

export default farms
`,
)

write(
  'config/constants/pools.ts',
  `import { serializeTokens } from './tokens'
import { SerializedPoolConfig, PoolCategory } from './types'

const serializedTokens = serializeTokens()

/** Single syrup pool — stake JNTo, earn JNTo */
const pools: SerializedPoolConfig[] = [
  {
    sousId: 0,
    stakingToken: serializedTokens.jnto,
    earningToken: serializedTokens.jnto,
    contractAddress: {
      97: '',
      56: '${sousChef}',
    },
    poolCategory: PoolCategory.CORE,
    harvest: true,
    tokenPerBlock: '0.005',
    sortOrder: 1,
    isFinished: false,
  },
]

export default pools
`,
)

// IFO config expects farms[0] LP (JNTo-USDT)
const ifoPath = path.join(srcRoot, 'config/constants/ifo.ts')
if (fs.existsSync(ifoPath)) {
  let ifoTs = fs.readFileSync(ifoPath, 'utf8')
  ifoTs = ifoTs.replace(
    /farms\[1\]\.lpAddresses/g,
    'farms[0].lpAddresses',
  )
  ifoTs = ifoTs.replace(/farms\[1\]\.lpSymbol/g, 'farms[0].lpSymbol')
  ifoTs = ifoTs.replace(/cakeBnbLpToken/g, 'jntoUsdtLpToken')
  fs.writeFileSync(ifoPath, ifoTs)
  console.log('Updated config/constants/ifo.ts')
}

console.log('\nNext: cd .. && node scripts/patch-pancakeswap-sdk.js && yarn start')
