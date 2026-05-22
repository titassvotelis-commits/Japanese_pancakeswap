import React from 'react'
import styled from 'styled-components'
import { Price } from '@pancakeswap/sdk'
import { Text, AutoRenewIcon, IconButton } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { NAV_BREAKPOINTS } from 'components/Menu/navHeaderTheme'

interface TradePriceProps {
  price?: Price
  showInverted: boolean
  setShowInverted: (showInverted: boolean) => void
}

const PricePanel = styled.div`
  width: 100%;
  border-radius: 12px;
  padding: 10px 12px;
  background-color: ${({ theme }) => (theme.isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(25, 19, 38, 0.04)')};
  border: 1px solid ${({ theme }) => (theme.isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(25, 19, 38, 0.06)')};
`

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  min-width: 0;
`

const PriceMain = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex: 1;
  min-width: 0;
  text-align: right;
`

const RateLine = styled(Text)`
  font-size: 14px;
  font-weight: 600;
  line-height: 1.25;
  color: ${({ theme }) => theme.colors.text};
  font-variant-numeric: tabular-nums;
  word-break: break-word;

  @media screen and (max-width: ${NAV_BREAKPOINTS.headerFull}px) {
    font-size: 13px;
  }
`

const RateHint = styled(Text)`
  font-size: 11px;
  line-height: 1.2;
  color: ${({ theme }) => theme.colors.textSubtle};
  margin-top: 2px;

  @media screen and (max-width: ${NAV_BREAKPOINTS.headerFull}px) {
    display: none;
  }
`

const LabelText = styled(Text)`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSubtle};
  text-transform: uppercase;
  letter-spacing: 0.02em;
  flex-shrink: 0;
  padding-top: 2px;
`

export default function TradePrice({ price, showInverted, setShowInverted }: TradePriceProps) {
  const { t } = useTranslation()

  const show = Boolean(price?.baseCurrency && price?.quoteCurrency)

  if (!show || !price) {
    return (
      <PricePanel>
        <PriceRow>
          <LabelText>{t('Price')}</LabelText>
          <RateLine color="textDisabled">—</RateLine>
        </PriceRow>
      </PricePanel>
    )
  }

  const base = price.baseCurrency
  const quote = price.quoteCurrency
  const displayBase = showInverted ? quote : base
  const displayQuote = showInverted ? base : quote
  const rate = showInverted ? price.invert().toSignificant(6) : price.toSignificant(6)
  const rateLine = `1 ${displayBase.symbol} = ${rate} ${displayQuote.symbol}`
  const rateHint = showInverted
    ? `${price.toSignificant(6)} ${quote.symbol} / ${base.symbol}`
    : `${price.invert().toSignificant(6)} ${base.symbol} / ${quote.symbol}`

  return (
    <PricePanel>
      <PriceRow>
        <LabelText>{t('Price')}</LabelText>
        <PriceMain>
          <RateLine>{rateLine}</RateLine>
          <RateHint>{rateHint}</RateHint>
        </PriceMain>
        <IconButton
          variant="text"
          scale="sm"
          onClick={() => setShowInverted(!showInverted)}
          aria-label="Toggle price direction"
          style={{ flexShrink: 0 }}
        >
          <AutoRenewIcon width="18px" color="primary" />
        </IconButton>
      </PriceRow>
    </PricePanel>
  )
}
