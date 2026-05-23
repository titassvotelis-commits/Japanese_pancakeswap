import React from 'react'
import styled from 'styled-components'
import { Currency } from '@pancakeswap/sdk'
import { ArrowUpDownIcon, Text } from '@pancakeswap/uikit'
import { CurrencyLogo } from 'components/Logo'
import { useTranslation } from 'contexts/Localization'
import { formatChartPrice } from 'utils/chartFormatPrice'
import { Binance24hTicker } from 'hooks/useBinance24hTicker'

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 4px 16px 12px;
  flex-shrink: 0;
`

const PairRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const IconStack = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;

  & > *:nth-child(2) {
    margin-left: -10px;
    box-shadow: -2px 0 0 #1a1b1f;
    border-radius: 50%;
  }
`

const PairLabel = styled(Text)`
  font-weight: 600;
  font-size: 18px;
  color: #f0f0f5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const FlipButton = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 8px;
  margin: 0 0 0 auto;
  border: none;
  background: ${({ $active }) => ($active ? 'rgba(31, 199, 212, 0.15)' : 'transparent')};
  cursor: pointer;
  border-radius: 12px;
  touch-action: manipulation;
`

const MainPrice = styled.div`
  font-size: 36px;
  font-weight: 700;
  line-height: 1.1;
  color: #ffffff;
  letter-spacing: -0.02em;
  font-family: -apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px 12px;
`

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`

const StatLabel = styled.span`
  font-size: 12px;
  color: #848e9c;
  font-family: -apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif;
`

const StatValue = styled.span<{ $positive?: boolean; $negative?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ $positive, $negative }) => {
    if ($positive) return '#26a69a'
    if ($negative) return '#ef5350'
    return '#eaecef'
  }};
  font-family: -apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif;
`

type SwapChartMobileHeaderProps = {
  pairLabel: string
  baseCurrency?: Currency
  quoteCurrency?: Currency
  inverted?: boolean
  disabled?: boolean
  onFlip: (e: React.MouseEvent) => void
  ticker: Binance24hTicker | null
  tickerLoading: boolean
}

const SwapChartMobileHeader: React.FC<SwapChartMobileHeaderProps> = ({
  pairLabel,
  baseCurrency,
  quoteCurrency,
  inverted = false,
  disabled = false,
  onFlip,
  ticker,
  tickerLoading,
}) => {
  const { t } = useTranslation()
  const changePositive = (ticker?.priceChangePercent ?? 0) > 0
  const changeNegative = (ticker?.priceChangePercent ?? 0) < 0
  const changeText = ticker
    ? `${changePositive ? '+' : ''}${ticker.priceChangePercent.toFixed(2)}%`
    : '—'

  return (
    <Header>
      <PairRow>
        <IconStack>
          {baseCurrency && <CurrencyLogo currency={baseCurrency} size="28px" />}
          {quoteCurrency && <CurrencyLogo currency={quoteCurrency} size="28px" />}
        </IconStack>
        <PairLabel>{pairLabel || '—'}</PairLabel>
        <FlipButton
          type="button"
          $active={inverted}
          onClick={onFlip}
          onMouseDown={(e) => e.stopPropagation()}
          aria-label={t('Flip chart pair')}
          disabled={disabled}
        >
          <ArrowUpDownIcon width="20px" color="primary" />
        </FlipButton>
      </PairRow>
      <MainPrice>{tickerLoading && !ticker ? '—' : ticker ? formatChartPrice(ticker.lastPrice) : '—'}</MainPrice>
      <StatsGrid>
        <StatItem>
          <StatLabel>{t('24h Change')}</StatLabel>
          <StatValue $positive={changePositive} $negative={changeNegative}>
            {changeText}
          </StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>{t('24h High')}</StatLabel>
          <StatValue>{ticker ? formatChartPrice(ticker.highPrice) : '—'}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>{t('24h Low')}</StatLabel>
          <StatValue>{ticker ? formatChartPrice(ticker.lowPrice) : '—'}</StatValue>
        </StatItem>
      </StatsGrid>
    </Header>
  )
}

export default SwapChartMobileHeader
