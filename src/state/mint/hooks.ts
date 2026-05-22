import { ChainId, Currency, CurrencyAmount, ETHER, JSBI, Pair, Percent, Price, Token, TokenAmount } from '@pancakeswap/sdk'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { PairState } from 'hooks/usePairs'
import { useLocalPair } from 'hooks/usePairsWithSource'
import useTotalSupply from 'hooks/useTotalSupply'

import { useTranslation } from 'contexts/Localization'
import { amountsMatchPoolRatio, computeLiquidityMinted, getLocalLpToken } from 'utils/liquidityPair'
import { wrappedCurrency, wrappedCurrencyAmount } from 'utils/wrappedCurrency'
import { AppDispatch, AppState } from '../index'
import { tryParseAmount } from '../swap/hooks'
import { useCurrencyBalances } from '../wallet/hooks'
import { Field, typeInput } from './actions'

const ZERO = JSBI.BigInt(0)

/** Quote the other token amount from on-chain reserves (matches router addLiquidity math). */
function quoteDependentFromPairReserves(
  pair: Pair,
  independentAmount: CurrencyAmount,
  dependentCurrency: Currency,
  chainId: number | undefined,
): CurrencyAmount | undefined {
  const independentWrapped = wrappedCurrencyAmount(independentAmount, chainId)
  if (!independentWrapped) {
    return undefined
  }

  let dependentTokenAmount: TokenAmount | undefined
  if (independentWrapped.token.equals(pair.token0)) {
    if (JSBI.equal(pair.reserve0.raw, ZERO)) {
      return undefined
    }
    const outRaw = JSBI.divide(
      JSBI.multiply(independentWrapped.raw, pair.reserve1.raw),
      pair.reserve0.raw,
    )
    dependentTokenAmount = new TokenAmount(pair.token1, outRaw)
  } else if (independentWrapped.token.equals(pair.token1)) {
    if (JSBI.equal(pair.reserve1.raw, ZERO)) {
      return undefined
    }
    const outRaw = JSBI.divide(
      JSBI.multiply(independentWrapped.raw, pair.reserve0.raw),
      pair.reserve1.raw,
    )
    dependentTokenAmount = new TokenAmount(pair.token0, outRaw)
  }

  if (!dependentTokenAmount) {
    return undefined
  }

  return dependentCurrency === ETHER
    ? CurrencyAmount.ether(dependentTokenAmount.raw)
    : dependentTokenAmount
}

export function useMintState(): AppState['mint'] {
  return useSelector<AppState, AppState['mint']>((state) => state.mint)
}

export function useMintActionHandlers(noLiquidity: boolean | undefined): {
  onFieldAInput: (typedValue: string) => void
  onFieldBInput: (typedValue: string) => void
} {
  const dispatch = useDispatch<AppDispatch>()

  const onFieldAInput = useCallback(
    (typedValue: string) => {
      dispatch(typeInput({ field: Field.CURRENCY_A, typedValue, noLiquidity: noLiquidity === true }))
    },
    [dispatch, noLiquidity],
  )
  const onFieldBInput = useCallback(
    (typedValue: string) => {
      dispatch(typeInput({ field: Field.CURRENCY_B, typedValue, noLiquidity: noLiquidity === true }))
    },
    [dispatch, noLiquidity],
  )

  return {
    onFieldAInput,
    onFieldBInput,
  }
}

export function useDerivedMintInfo(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
): {
  dependentField: Field
  currencies: { [field in Field]?: Currency }
  pair?: Pair | null
  lpToken?: Token
  pairState: PairState
  currencyBalances: { [field in Field]?: CurrencyAmount }
  parsedAmounts: { [field in Field]?: CurrencyAmount }
  price?: Price
  noLiquidity?: boolean
  liquidityMinted?: TokenAmount
  poolTokenPercentage?: Percent
  error?: string
} {
  const { account, chainId } = useActiveWeb3React()

  const { t } = useTranslation()

  const { independentField, typedValue, otherTypedValue } = useMintState()

  const dependentField = independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A

  // tokens
  const currencies: { [field in Field]?: Currency } = useMemo(
    () => ({
      [Field.CURRENCY_A]: currencyA ?? undefined,
      [Field.CURRENCY_B]: currencyB ?? undefined,
    }),
    [currencyA, currencyB],
  )

  // MetakeySwap router — reserves must come from the local factory pair, not Pancake SDK address.
  const [pairState, localPair] = useLocalPair(currencies[Field.CURRENCY_A], currencies[Field.CURRENCY_B])
  const pair = localPair?.pair ?? null
  const pairAddress = localPair?.pairAddress

  const lpToken = useMemo((): Token | undefined => {
    if (!chainId || !pairAddress) {
      return undefined
    }
    return getLocalLpToken(chainId as ChainId, pairAddress)
  }, [chainId, pairAddress])

  const totalSupply = useTotalSupply(lpToken)

  const noLiquidity: boolean = useMemo(() => {
    if (pairState === PairState.NOT_EXISTS) {
      return true
    }
    if (!pair) {
      return true
    }
    // Pair contract exists but pool has no reserves yet (e.g. freshly created LP)
    if (JSBI.equal(pair.reserve0.raw, ZERO) || JSBI.equal(pair.reserve1.raw, ZERO)) {
      return true
    }
    if (totalSupply && JSBI.equal(totalSupply.raw, ZERO)) {
      return true
    }
    return false
  }, [pairState, pair, totalSupply])

  // balances
  const balances = useCurrencyBalances(account ?? undefined, [
    currencies[Field.CURRENCY_A],
    currencies[Field.CURRENCY_B],
  ])
  const currencyBalances: { [field in Field]?: CurrencyAmount } = {
    [Field.CURRENCY_A]: balances[0],
    [Field.CURRENCY_B]: balances[1],
  }

  // amounts
  const independentAmount: CurrencyAmount | undefined = tryParseAmount(typedValue, currencies[independentField])
  const dependentAmount: CurrencyAmount | undefined = useMemo(() => {
    if (noLiquidity) {
      if (otherTypedValue && currencies[dependentField]) {
        return tryParseAmount(otherTypedValue, currencies[dependentField])
      }
      return undefined
    }
    if (independentAmount && pair) {
      const dependentCurrency = dependentField === Field.CURRENCY_B ? currencyB : currencyA
      if (dependentCurrency) {
        return quoteDependentFromPairReserves(pair, independentAmount, dependentCurrency, chainId)
      }
    }
    return undefined
  }, [noLiquidity, otherTypedValue, currencies, dependentField, independentAmount, currencyA, currencyB, chainId, pair])

  const parsedAmounts: { [field in Field]: CurrencyAmount | undefined } = useMemo(
    () => ({
      [Field.CURRENCY_A]: independentField === Field.CURRENCY_A ? independentAmount : dependentAmount,
      [Field.CURRENCY_B]: independentField === Field.CURRENCY_A ? dependentAmount : independentAmount,
    }),
    [dependentAmount, independentAmount, independentField],
  )

  const price = useMemo(() => {
    if (noLiquidity) {
      const { [Field.CURRENCY_A]: currencyAAmount, [Field.CURRENCY_B]: currencyBAmount } = parsedAmounts
      if (
        currencyAAmount &&
        currencyBAmount &&
        !JSBI.equal(currencyAAmount.raw, ZERO) &&
        !JSBI.equal(currencyBAmount.raw, ZERO)
      ) {
        try {
          return new Price(
            currencyAAmount.currency,
            currencyBAmount.currency,
            currencyAAmount.raw,
            currencyBAmount.raw,
          )
        } catch {
          return undefined
        }
      }
      return undefined
    }
    const wrappedCurrencyA = wrappedCurrency(currencyA, chainId)
    if (!pair || !wrappedCurrencyA || noLiquidity) {
      return undefined
    }
    try {
      const pairPrice = pair.priceOf(wrappedCurrencyA)
      return JSBI.equal(pairPrice.denominator, ZERO) ? undefined : pairPrice
    } catch {
      return undefined
    }
  }, [chainId, currencyA, noLiquidity, pair, parsedAmounts])

  // liquidity minted
  const liquidityMinted = useMemo(() => {
    const { [Field.CURRENCY_A]: currencyAAmount, [Field.CURRENCY_B]: currencyBAmount } = parsedAmounts
    const [tokenAmountA, tokenAmountB] = [
      wrappedCurrencyAmount(currencyAAmount, chainId),
      wrappedCurrencyAmount(currencyBAmount, chainId),
    ]
    if (
      pair &&
      lpToken &&
      totalSupply &&
      !JSBI.equal(totalSupply.raw, ZERO) &&
      tokenAmountA &&
      tokenAmountB &&
      !JSBI.equal(tokenAmountA.raw, ZERO) &&
      !JSBI.equal(tokenAmountB.raw, ZERO)
    ) {
      return computeLiquidityMinted(totalSupply, lpToken, pair, tokenAmountA, tokenAmountB)
    }
    return undefined
  }, [parsedAmounts, chainId, pair, lpToken, totalSupply])

  const poolTokenPercentage = useMemo(() => {
    if (liquidityMinted && totalSupply) {
      return new Percent(liquidityMinted.raw, totalSupply.add(liquidityMinted).raw)
    }
    return undefined
  }, [liquidityMinted, totalSupply])

  let error: string | undefined
  if (!account) {
    error = t('Connect Wallet')
  }

  if (pairState === PairState.INVALID) {
    error = error ?? t('Invalid pair')
  }

  if (pairState === PairState.LOADING) {
    error = error ?? t('Loading pool data')
  } else if (!parsedAmounts[Field.CURRENCY_A] || !parsedAmounts[Field.CURRENCY_B]) {
    error = error ?? t('Enter an amount')
  }

  const { [Field.CURRENCY_A]: currencyAAmount, [Field.CURRENCY_B]: currencyBAmount } = parsedAmounts

  if (currencyAAmount && currencyBalances?.[Field.CURRENCY_A]?.lessThan(currencyAAmount)) {
    error = t('Insufficient %symbol% balance', { symbol: currencies[Field.CURRENCY_A]?.symbol })
  }

  if (currencyBAmount && currencyBalances?.[Field.CURRENCY_B]?.lessThan(currencyBAmount)) {
    error = t('Insufficient %symbol% balance', { symbol: currencies[Field.CURRENCY_B]?.symbol })
  }

  const tokenAmountA = wrappedCurrencyAmount(currencyAAmount, chainId)
  const tokenAmountB = wrappedCurrencyAmount(currencyBAmount, chainId)
  const proportional =
    pair && tokenAmountA && tokenAmountB
      ? amountsMatchPoolRatio(pair, tokenAmountA, tokenAmountB)
      : false

  if (!error && !noLiquidity && pairState === PairState.EXISTS && proportional && !totalSupply) {
    error = t('Loading pool data')
  }

  if (
    !error &&
    !noLiquidity &&
    pairState === PairState.EXISTS &&
    pair &&
    tokenAmountA &&
    tokenAmountB &&
    !JSBI.equal(tokenAmountA.raw, ZERO) &&
    !JSBI.equal(tokenAmountB.raw, ZERO) &&
    !liquidityMinted &&
    !proportional
  ) {
    error = t(
      'Amounts do not match the pool ratio. Clear both fields, enter only one token amount, and wait for the other to auto-fill.',
    )
  }

  if (
    !error &&
    !noLiquidity &&
    pairState === PairState.EXISTS &&
    proportional &&
    totalSupply &&
    !liquidityMinted
  ) {
    error = t('Amount too small to add liquidity')
  }

  return {
    dependentField,
    currencies,
    pair,
    lpToken,
    pairState,
    currencyBalances,
    parsedAmounts,
    price,
    noLiquidity,
    liquidityMinted,
    poolTokenPercentage,
    error,
  }
}
