import { serializeTokens } from './tokens'
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
      56: '0x405260863F346FB42Ccc7cA4cc7e3baF8B03113d',
    },
    poolCategory: PoolCategory.CORE,
    harvest: true,
    tokenPerBlock: '0.005',
    sortOrder: 1,
    isFinished: false,
  },
]

export default pools
