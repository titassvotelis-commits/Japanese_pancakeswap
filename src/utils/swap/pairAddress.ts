import { getCreate2Address } from '@ethersproject/address'
import { keccak256, pack } from '@ethersproject/solidity'
import { Token } from '@pancakeswap/sdk'
import { FactoryConfig } from './constants'

export function computePairAddressFromConfig(tokenA: Token, tokenB: Token, config: FactoryConfig): string {
  const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
  return getCreate2Address(
    config.factory,
    keccak256(['bytes'], [pack(['address', 'address'], [token0.address, token1.address])]),
    config.initCodeHash,
  )
}
