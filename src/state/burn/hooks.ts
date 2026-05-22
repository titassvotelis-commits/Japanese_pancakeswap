import { ChainId, Currency, CurrencyAmount, JSBI, Pair, Percent, Token, TokenAmount } from '@pancakeswap/sdk'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import { useLocalPair } from 'hooks/usePairsWithSource'
import useTotalSupply from 'hooks/useTotalSupply'
import { computeLiquidityValue, getLocalLpToken } from 'utils/liquidityPair'

import { useTranslation } from 'contexts/Localization'
import { AppDispatch, AppState } from '../index'
import { tryParseAmount } from '../swap/hooks'
import { useTokenBalances } from '../wallet/hooks'
import { Field, typeInput } from './actions'

const ZERO = JSBI.BigInt(0)

export function useBurnState(): AppState['burn'] {
  return useSelector<AppState, AppState['burn']>((state) => state.burn)
}

export function useDerivedBurnInfo(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
): {
  pair?: Pair | null
  lpToken?: Token
  parsedAmounts: {
    [Field.LIQUIDITY_PERCENT]: Percent
    [Field.LIQUIDITY]?: TokenAmount
    [Field.CURRENCY_A]?: CurrencyAmount
    [Field.CURRENCY_B]?: CurrencyAmount
  }
  error?: string
} {
  const { account, chainId } = useActiveWeb3React()

  const { independentField, typedValue } = useBurnState()

  const { t } = useTranslation()

  const [, localPair] = useLocalPair(currencyA, currencyB)
  const pair = localPair?.pair ?? null
  const lpToken = useMemo((): Token | undefined => {
    if (!chainId || !localPair?.pairAddress) {
      return undefined
    }
    return getLocalLpToken(chainId as ChainId, localPair.pairAddress)
  }, [chainId, localPair?.pairAddress])

  const relevantTokenBalances = useTokenBalances(account ?? undefined, lpToken ? [lpToken] : [])
  const userLiquidity: undefined | TokenAmount = lpToken
    ? relevantTokenBalances?.[lpToken.address]
    : undefined

  const [tokenA, tokenB] = [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)]
  const tokens = {
    [Field.CURRENCY_A]: tokenA,
    [Field.CURRENCY_B]: tokenB,
    [Field.LIQUIDITY]: lpToken,
  }

  const totalSupply = useTotalSupply(lpToken)
  const liquidityValueA =
    pair &&
    totalSupply &&
    userLiquidity &&
    tokenA &&
    JSBI.greaterThanOrEqual(totalSupply.raw, userLiquidity.raw)
      ? computeLiquidityValue(pair, tokenA, totalSupply, userLiquidity)
      : undefined
  const liquidityValueB =
    pair &&
    totalSupply &&
    userLiquidity &&
    tokenB &&
    JSBI.greaterThanOrEqual(totalSupply.raw, userLiquidity.raw)
      ? computeLiquidityValue(pair, tokenB, totalSupply, userLiquidity)
      : undefined
  const liquidityValues: { [Field.CURRENCY_A]?: TokenAmount; [Field.CURRENCY_B]?: TokenAmount } = {
    [Field.CURRENCY_A]: liquidityValueA,
    [Field.CURRENCY_B]: liquidityValueB,
  }

  let percentToRemove: Percent = new Percent('0', '100')
  // user specified a %
  if (independentField === Field.LIQUIDITY_PERCENT) {
    percentToRemove = new Percent(typedValue, '100')
  }
  // user specified a specific amount of liquidity tokens
  else if (independentField === Field.LIQUIDITY) {
    if (lpToken) {
      const independentAmount = tryParseAmount(typedValue, lpToken)
      if (independentAmount && userLiquidity && !independentAmount.greaterThan(userLiquidity)) {
        percentToRemove = new Percent(independentAmount.raw, userLiquidity.raw)
      }
    }
  }
  // user specified a specific amount of token a or b
  else if (tokens[independentField]) {
    const independentAmount = tryParseAmount(typedValue, tokens[independentField])
    const liquidityValue = liquidityValues[independentField]
    if (independentAmount && liquidityValue && !independentAmount.greaterThan(liquidityValue)) {
      percentToRemove = new Percent(independentAmount.raw, liquidityValue.raw)
    }
  }

  const parsedAmounts: {
    [Field.LIQUIDITY_PERCENT]: Percent
    [Field.LIQUIDITY]?: TokenAmount
    [Field.CURRENCY_A]?: TokenAmount
    [Field.CURRENCY_B]?: TokenAmount
  } = {
    [Field.LIQUIDITY_PERCENT]: percentToRemove,
    [Field.LIQUIDITY]:
      userLiquidity && percentToRemove && percentToRemove.greaterThan('0')
        ? new TokenAmount(userLiquidity.token, percentToRemove.multiply(userLiquidity.raw).quotient)
        : undefined,
    [Field.CURRENCY_A]:
      tokenA && percentToRemove && percentToRemove.greaterThan('0') && liquidityValueA
        ? new TokenAmount(tokenA, percentToRemove.multiply(liquidityValueA.raw).quotient)
        : undefined,
    [Field.CURRENCY_B]:
      tokenB && percentToRemove && percentToRemove.greaterThan('0') && liquidityValueB
        ? new TokenAmount(tokenB, percentToRemove.multiply(liquidityValueB.raw).quotient)
        : undefined,
  }

  let error: string | undefined
  if (!account) {
    error = t('Connect Wallet')
  }

  if (!userLiquidity || JSBI.equal(userLiquidity.raw, ZERO)) {
    error = error ?? t('No LP tokens found in your wallet for this pool')
  } else if (!totalSupply) {
    error = error ?? t('Loading pool data')
  } else if (!parsedAmounts[Field.LIQUIDITY] || !parsedAmounts[Field.CURRENCY_A] || !parsedAmounts[Field.CURRENCY_B]) {
    error = error ?? t('Enter an amount')
  }

  return { pair, lpToken, parsedAmounts, error }
}

export function useBurnActionHandlers(): {
  onUserInput: (field: Field, typedValue: string) => void
} {
  const dispatch = useDispatch<AppDispatch>()

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch],
  )

  return {
    onUserInput,
  }
}
