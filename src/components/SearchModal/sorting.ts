import { Token, TokenAmount } from '@pancakeswap/sdk'
import { useMemo } from 'react'
import { getCoreTokenPriority } from '../../config/constants/swapTokens'
import { useAllTokenBalances } from '../../state/wallet/hooks'

// compare two token amounts with highest one coming first
function balanceComparator(balanceA?: TokenAmount, balanceB?: TokenAmount) {
  if (balanceA && balanceB) {
    return balanceA.greaterThan(balanceB) ? -1 : balanceA.equalTo(balanceB) ? 0 : 1
  }
  if (balanceA && balanceA.greaterThan('0')) {
    return -1
  }
  if (balanceB && balanceB.greaterThan('0')) {
    return 1
  }
  return 0
}

function getTokenComparator(balances: {
  [tokenAddress: string]: TokenAmount | undefined
}): (tokenA: Token, tokenB: Token) => number {
  return function sortTokens(tokenA: Token, tokenB: Token): number {
    // -1 = a is first
    // 1 = b is first

    // sort by balances
    const balanceA = balances[tokenA.address]
    const balanceB = balances[tokenB.address]

    const balanceComp = balanceComparator(balanceA, balanceB)
    if (balanceComp !== 0) return balanceComp

    const priorityA = getCoreTokenPriority(tokenA.address)
    const priorityB = getCoreTokenPriority(tokenB.address)
    if (priorityA !== priorityB) return priorityA < priorityB ? -1 : 1

    if (tokenA.symbol && tokenB.symbol) {
      // sort by symbol
      return tokenA.symbol.toLowerCase() < tokenB.symbol.toLowerCase() ? -1 : 1
    }
    return tokenA.symbol ? -1 : tokenB.symbol ? -1 : 0
  }
}

function useBalanceSortKey(balances: { [tokenAddress: string]: TokenAmount | undefined } | undefined): string {
  return useMemo(
    () =>
      Object.entries(balances ?? {})
        .map(([address, amount]) => (amount ? `${address}:${amount.raw.toString()}` : `${address}:0`))
        .sort()
        .join('|'),
    [balances],
  )
}

function useTokenComparator(inverted: boolean): (tokenA: Token, tokenB: Token) => number {
  const balances = useAllTokenBalances()
  const balanceSortKey = useBalanceSortKey(balances)
  const comparator = useMemo(() => getTokenComparator(balances ?? {}), [balanceSortKey, balances])
  return useMemo(() => {
    if (inverted) {
      return (tokenA: Token, tokenB: Token) => comparator(tokenA, tokenB) * -1
    }
    return comparator
  }, [inverted, comparator])
}

export default useTokenComparator
