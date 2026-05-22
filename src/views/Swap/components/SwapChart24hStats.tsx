import React from 'react'
import styled from 'styled-components'
import { Currency } from '@pancakeswap/sdk'
import { Text } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { useBinance24hTicker } from 'hooks/useBinance24hTicker'
import { NAV_BREAKPOINTS } from 'components/Menu/navHeaderTheme'

function formatPrice(value: number): string {
  if (!Number.isFinite(value)) {
    return '—'
  }
  if (value >= 1000) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
  }
  if (value >= 1) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 4 })
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 8 })
}

const StatsRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 20px;
  flex-shrink: 0;
  margin-left: auto;

  @media screen and (max-width: ${NAV_BREAKPOINTS.lg}px) {
    width: 100%;
    margin-left: 0;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 12px 16px;
  }

  @media screen and (max-width: ${NAV_BREAKPOINTS.sm}px) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 12px;
  }
`

const StatBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
`

const StatLabel = styled(Text)`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSubtle};
  white-space: nowrap;
`

const StatValue = styled(Text)<{ $positive?: boolean; $negative?: boolean; $large?: boolean }>`
  font-size: ${({ $large }) => ($large ? '22px' : '14px')};
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;

  @media screen and (max-width: ${NAV_BREAKPOINTS.sm}px) {
    font-size: ${({ $large }) => ($large ? '18px' : '13px')};
  }
  color: ${({ theme, $positive, $negative, $large }) => {
    if ($positive) return theme.colors.success
    if ($negative) return theme.colors.failure
    return theme.colors.text
  }};
`

type SwapChart24hStatsProps = {
  baseCurrency?: Currency
  quoteCurrency?: Currency
  chainId?: number
}

const SwapChart24hStats: React.FC<SwapChart24hStatsProps> = ({ baseCurrency, quoteCurrency, chainId }) => {
  const { t } = useTranslation()
  const { ticker, loading } = useBinance24hTicker(baseCurrency, quoteCurrency, chainId)

  if (loading && !ticker) {
    return (
      <StatsRow>
        <StatValue $large>—</StatValue>
      </StatsRow>
    )
  }

  if (!ticker) {
    return null
  }

  const changePositive = ticker.priceChangePercent > 0
  const changeNegative = ticker.priceChangePercent < 0
  const changeText = `${changePositive ? '+' : ''}${ticker.priceChangePercent.toFixed(2)}%`

  return (
    <StatsRow>
      <StatBlock>
        <StatLabel>{t('24h Change')}</StatLabel>
        <StatValue $positive={changePositive} $negative={changeNegative}>
          {changeText}
        </StatValue>
      </StatBlock>
      <StatBlock>
        <StatLabel>{t('24h High')}</StatLabel>
        <StatValue>{formatPrice(ticker.highPrice)}</StatValue>
      </StatBlock>
      <StatBlock>
        <StatLabel>{t('24h Low')}</StatLabel>
        <StatValue>{formatPrice(ticker.lowPrice)}</StatValue>
      </StatBlock>
      <StatBlock>
        <StatValue $large>{formatPrice(ticker.lastPrice)}</StatValue>
      </StatBlock>
    </StatsRow>
  )
}

export default SwapChart24hStats
