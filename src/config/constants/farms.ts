import { serializeTokens } from './tokens'
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
      56: '0xF1bF81BD05b0eAaA8a4E229D1782D4d0B7763850',
    },
    token: serializedTokens.jnto,
    quoteToken: serializedTokens.usdt,
  },
]

export default farms
