import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { BinanceIcon, ChevronDownIcon, Text } from '@pancakeswap/uikit'
import SwapTokenDirectionButton from 'components/SwapTokenDirectionButton'
import { Currency, ETHER } from '@pancakeswap/sdk'
import tokens from 'config/constants/tokens'
import { CurrencyLogo } from 'components/Logo'
import { useTradeExactIn } from 'hooks/Trades'
import { useBnbUsdPrice } from 'hooks/useBnbUsdPrice'
import { useMkUsdPriceKnown } from 'hooks/useMkUsdPrice'
import history from 'routerHistory'
import store from 'state'
import { tryParseAmount } from 'state/swap/hooks'
import { Field, replaceSwapState } from 'state/swap/actions'
import { useTranslation } from 'contexts/Localization'
import { isAddress } from 'utils'

const jntoAddress = isAddress(tokens.jnto.address) || tokens.jnto.address
const jntoToken = tokens.jnto

function buildSwapPath(inputCurrencyId: string, outputCurrencyId: string, typedValue: string): string {
  const params = new URLSearchParams()
  params.set('inputCurrency', inputCurrencyId)
  params.set('outputCurrency', outputCurrencyId)
  if (typedValue && parseFloat(typedValue) > 0) {
    params.set('exactAmount', typedValue)
    params.set('exactField', 'input')
  }
  return `/swap?${params.toString()}`
}

function formatUsd(value: number | null): string {
  if (value === null || !Number.isFinite(value) || value <= 0) {
    return '~$0.00'
  }
  if (value >= 1_000_000) {
    return `~$${(value / 1_000_000).toFixed(2)}M`
  }
  if (value >= 1000) {
    return `~$${(value / 1000).toFixed(2)}K`
  }
  return `~$${value.toFixed(2)}`
}

function formatOutputAmount(significant: string): string {
  const n = parseFloat(significant)
  if (!Number.isFinite(n)) {
    return significant
  }
  if (n >= 1000) {
    return n.toLocaleString(undefined, { maximumFractionDigits: 4 })
  }
  if (n < 0.0001 && n > 0) {
    return n.toPrecision(4)
  }
  return significant
}

const Card = styled.div`
  width: 100%;
  max-width: 420px;
  min-width: 0;
  box-sizing: border-box;
  padding: 20px;
  border-radius: 24px;
  background: ${({ theme }) =>
    theme.isDark ? 'rgba(36, 34, 48, 0.92)' : theme.colors.backgroundAlt};
  border: 1px solid
    ${({ theme }) => (theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.colors.cardBorder)};
  box-shadow: ${({ theme }) =>
    theme.isDark ? '0 24px 64px rgba(0, 0, 0, 0.45)' : '0 16px 48px rgba(99, 102, 241, 0.12)'};

  @media screen and (max-width: 968px) {
    max-width: 100%;
    padding: 18px 16px 20px;
    border-radius: 20px;
    box-shadow: ${({ theme }) =>
      theme.isDark
        ? '0 16px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.06)'
        : '0 12px 32px rgba(99, 102, 241, 0.14)'};
  }
`

const SectionLabel = styled.span`
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSubtle};
`

const TokenRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
  width: 100%;

  @media screen and (max-width: 968px) {
    gap: 8px;
  }
`

const TokenSelectBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1 1 auto;
  padding: 4px 8px 4px 4px;
  margin: 0;

  @media screen and (max-width: 968px) {
    padding: 4px 6px 4px 4px;
    gap: 6px;
  }
  border: none;
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) => (theme.isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)')};
  }
`

const TokenMeta = styled.div`
  min-width: 0;
`

const TokenName = styled.span`
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`

const ChainName = styled.span`
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSubtle};
`

const AmountCol = styled.div`
  text-align: right;
  flex: 0 1 42%;
  min-width: 0;
  max-width: 50%;
`

const AmountInput = styled.input`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 22px;

  @media screen and (max-width: 968px) {
    font-size: 18px;
  }
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.2;
  text-align: right;
  font-family: inherit;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSubtle};
    opacity: 0.6;
  }

  &:focus {
    outline: none;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`

const UsdHint = styled.span`
  display: block;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSubtle};
  margin-top: 2px;
`

const DividerRow = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 14px 0;
  height: 1px;
  background: ${({ theme }) => theme.colors.cardBorder};
`

const Amount = styled.span`
  display: block;
  font-size: 22px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media screen and (max-width: 968px) {
    font-size: 18px;
  }
`

const GetStartedBtn = styled.button`
  width: 100%;
  margin-top: 16px;
  padding: 14px 20px;
  min-height: 48px;
  border: none;
  border-radius: 16px;

  @media screen and (max-width: 968px) {
    min-height: 52px;
    font-size: 17px;
  }
  background: linear-gradient(180deg, #00e6b8 0%, #00c9a0 100%);
  color: #0a1210;
  font-size: 16px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: filter 0.15s ease, transform 0.15s ease;
  box-shadow: 0 8px 24px rgba(0, 212, 170, 0.35);

  &:hover {
    filter: brightness(1.06);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`

const LandingSwapCard: React.FC = () => {
  const { t } = useTranslation()
  const [reversed, setReversed] = useState(false)
  const [typedValue, setTypedValue] = useState('')

  const bnbUsd = useBnbUsdPrice()
  const { price: mkUsd, known: mkPriceKnown } = useMkUsdPriceKnown()

  const inputCurrency = reversed ? jntoToken : ETHER
  const outputCurrency = reversed ? ETHER : jntoToken
  const inputCurrencyId = reversed ? jntoAddress : 'BNB'
  const outputCurrencyId = reversed ? 'BNB' : jntoAddress

  const parsedAmount = useMemo(
    () => tryParseAmount(typedValue, inputCurrency),
    [typedValue, inputCurrency],
  )

  const trade = useTradeExactIn(parsedAmount, outputCurrency)

  const inputUsd = useMemo(() => {
    const n = parseFloat(typedValue)
    if (!Number.isFinite(n) || n <= 0) {
      return null
    }
    if (reversed) {
      return mkPriceKnown ? n * mkUsd : null
    }
    return bnbUsd > 0 ? n * bnbUsd : null
  }, [typedValue, reversed, bnbUsd, mkUsd, mkPriceKnown])

  const outputDisplay = useMemo(() => {
    if (!typedValue || parseFloat(typedValue) <= 0) {
      return '0.00'
    }
    if (trade) {
      return formatOutputAmount(trade.outputAmount.toSignificant(6))
    }
    if (inputUsd !== null) {
      if (reversed && bnbUsd > 0) {
        return formatOutputAmount((inputUsd / bnbUsd).toFixed(6))
      }
      if (!reversed && mkPriceKnown && mkUsd > 0) {
        return formatOutputAmount((inputUsd / mkUsd).toFixed(6))
      }
    }
    return '—'
  }, [typedValue, trade, inputUsd, reversed, bnbUsd, mkUsd, mkPriceKnown])

  const outputUsd = useMemo(() => {
    if (!typedValue || parseFloat(typedValue) <= 0) {
      return null
    }
    if (trade) {
      const out = parseFloat(trade.outputAmount.toSignificant(12))
      if (!Number.isFinite(out) || out <= 0) {
        return inputUsd
      }
      if (reversed) {
        return bnbUsd > 0 ? out * bnbUsd : inputUsd
      }
      return mkPriceKnown ? out * mkUsd : inputUsd
    }
    return inputUsd
  }, [typedValue, trade, inputUsd, reversed, bnbUsd, mkUsd, mkPriceKnown])

  const goSwap = useCallback(() => {
    const value = typedValue.trim()
    store.dispatch(
      replaceSwapState({
        field: Field.INPUT,
        typedValue: value,
        inputCurrencyId,
        outputCurrencyId,
        recipient: null,
      }),
    )
    history.push(buildSwapPath(inputCurrencyId, outputCurrencyId, value))
  }, [typedValue, inputCurrencyId, outputCurrencyId])

  const fromToken = reversed ? (
    <>
      <CurrencyLogo currency={jntoToken as Currency} size="32px" />
      <TokenMeta>
        <TokenName>JNTo</TokenName>
        <ChainName>{t('BNB Chain')}</ChainName>
      </TokenMeta>
    </>
  ) : (
    <>
      <BinanceIcon width="32px" />
      <TokenMeta>
        <TokenName>BNB</TokenName>
        <ChainName>{t('BNB Chain')}</ChainName>
      </TokenMeta>
    </>
  )

  const toToken = reversed ? (
    <>
      <BinanceIcon width="32px" />
      <TokenMeta>
        <TokenName>BNB</TokenName>
        <ChainName>{t('BNB Chain')}</ChainName>
      </TokenMeta>
    </>
  ) : (
    <>
      <CurrencyLogo currency={jntoToken as Currency} size="32px" />
      <TokenMeta>
        <TokenName>JNTo</TokenName>
        <ChainName>{t('BNB Chain')}</ChainName>
      </TokenMeta>
    </>
  )

  return (
    <Card>
      <div>
        <SectionLabel>{t('From')}</SectionLabel>
        <TokenRow>
          <TokenSelectBtn type="button" onClick={goSwap} aria-label={t('Select from token on swap page')}>
            {fromToken}
            <ChevronDownIcon color="textSubtle" width="16px" />
          </TokenSelectBtn>
          <AmountCol>
            <AmountInput
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={typedValue}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.]/g, '')
                const parts = v.split('.')
                const sanitized = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : v
                setTypedValue(sanitized)
              }}
              aria-label={t('Amount to swap')}
            />
            <UsdHint>{formatUsd(inputUsd)}</UsdHint>
          </AmountCol>
        </TokenRow>
      </div>

      <DividerRow>
        <SwapTokenDirectionButton
          onClick={() => setReversed((v) => !v)}
          aria-label={t('Switch from and to tokens')}
        />
      </DividerRow>

      <div>
        <SectionLabel>{t('To')}</SectionLabel>
        <TokenRow>
          <TokenSelectBtn type="button" onClick={goSwap} aria-label={t('Select to token on swap page')}>
            {toToken}
            <ChevronDownIcon color="textSubtle" width="16px" />
          </TokenSelectBtn>
          <AmountCol>
            <Amount>{outputDisplay}</Amount>
            <UsdHint>{formatUsd(outputUsd)}</UsdHint>
          </AmountCol>
        </TokenRow>
      </div>

      <GetStartedBtn type="button" onClick={goSwap}>
        {t('Get Started')}
      </GetStartedBtn>
      <Text fontSize="11px" color="textSubtle" textAlign="center" mt="10px">
        {trade || (inputUsd !== null && outputDisplay !== '—')
          ? t('Estimated from live pool prices · final amount on swap page')
          : t('Connect your wallet on the swap page to trade')}
      </Text>
    </Card>
  )
}

export default LandingSwapCard
