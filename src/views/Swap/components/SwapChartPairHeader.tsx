import React from 'react'
import styled from 'styled-components'
import { Currency } from '@pancakeswap/sdk'
import { ArrowUpDownIcon, Text } from '@pancakeswap/uikit'
import { CurrencyLogo } from 'components/Logo'
import { useTranslation } from 'contexts/Localization'
import { NAV_BREAKPOINTS } from 'components/Menu/navHeaderTheme'

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`

const IconStack = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;

  & > *:nth-child(2) {
    margin-left: -10px;
    box-shadow: -2px 0 0 ${({ theme }) => (theme.isDark ? '#131118' : '#ffffff')};
    border-radius: 50%;
  }
`

const PairLabel = styled(Text)`
  font-weight: 600;
  font-size: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media screen and (max-width: ${NAV_BREAKPOINTS.sm}px) {
    font-size: 17px;
  }
`

const FlipButton = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 8px;
  margin: 0;
  border: none;
  background: ${({ theme, $active }) =>
    $active ? (theme.isDark ? 'rgba(31, 199, 212, 0.15)' : 'rgba(31, 199, 212, 0.12)') : 'transparent'};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};
  border-radius: 12px;
  touch-action: manipulation;

  &:hover:not(:disabled) {
    opacity: 0.9;
    background: ${({ theme }) => (theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)')};
  }

  &:active:not(:disabled) {
    transform: scale(0.96);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`

type SwapChartPairHeaderProps = {
  pairLabel: string
  baseCurrency?: Currency
  quoteCurrency?: Currency
  inverted?: boolean
  disabled?: boolean
  onFlip: (e: React.MouseEvent) => void
}

const SwapChartPairHeader: React.FC<SwapChartPairHeaderProps> = ({
  pairLabel,
  baseCurrency,
  quoteCurrency,
  inverted = false,
  disabled = false,
  onFlip,
}) => {
  const { t } = useTranslation()

  return (
    <HeaderRow>
      <IconStack>
        {baseCurrency && <CurrencyLogo currency={baseCurrency} size="32px" />}
        {quoteCurrency && <CurrencyLogo currency={quoteCurrency} size="32px" />}
      </IconStack>
      <PairLabel>{pairLabel || '—'}</PairLabel>
      <FlipButton
        type="button"
        $active={inverted}
        onClick={onFlip}
        onMouseDown={(e) => e.stopPropagation()}
        aria-label={t('Flip chart pair')}
        aria-pressed={inverted}
        disabled={disabled}
      >
        <ArrowUpDownIcon width="20px" color="primary" />
      </FlipButton>
    </HeaderRow>
  )
}

export default SwapChartPairHeader
