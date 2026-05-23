import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { Currency } from '@pancakeswap/sdk'
import { Box, Text } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { useCurrency } from 'hooks/Tokens'
import { useBinance24hTicker } from 'hooks/useBinance24hTicker'
import { NAV_BREAKPOINTS } from 'components/Menu/navHeaderTheme'
import { getChartPairLabelFromIds } from 'utils/chartPairLabel'
import { getChartPairLabel, resolveBinanceMarket, usesProxyChartSymbol } from 'utils/tradingViewSymbol'
import { useBinanceKlines } from 'hooks/useBinanceKlines'
import SwapChart24hStats from './SwapChart24hStats'
import SwapChartPairHeader from './SwapChartPairHeader'
import SwapChartMobileHeader from './SwapChartMobileHeader'
import type { ChartInterval } from './SwapBinanceCandleChart'

const SwapBinanceCandleChart = lazy(() => import('./SwapBinanceCandleChart'))
const SwapTradingViewAdvancedEmbed = lazy(() => import('./SwapTradingViewAdvancedEmbed'))

const ChartChunkFallback = styled.div`
  flex: 1;
  min-height: 200px;
  background: ${({ theme }) => (theme.isDark ? '#131722' : '#f0f3fa')};
  animation: swap-chart-pulse 1.2s ease-in-out infinite;

  @keyframes swap-chart-pulse {
    0%,
    100% {
      opacity: 0.5;
    }
    50% {
      opacity: 0.9;
    }
  }
`

const ChartShell = styled(Box)<{ $variant: 'inline' | 'sheet' }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  isolation: isolate;

  ${({ $variant, theme }) =>
    $variant === 'sheet'
      ? `
    border: none;
    border-radius: 0;
    background: #1a1b1f;
    box-shadow: none;
  `
      : `
    border-radius: 24px;
    border: 1px solid ${theme.isDark ? 'rgba(92, 177, 221, 0.2)' : 'rgba(92, 177, 221, 0.25)'};
    background: ${theme.isDark ? '#131118' : '#ffffff'};
    box-shadow: ${
      theme.isDark
        ? '0 8px 32px rgba(0, 0, 0, 0.45)'
        : '0 8px 40px rgba(92, 177, 221, 0.12)'
    };

    @media screen and (max-width: ${NAV_BREAKPOINTS.lg}px) {
      border-radius: 20px;
    }

    @media screen and (max-width: ${NAV_BREAKPOINTS.sm}px) {
      border-radius: 16px;
    }
  `}
`

const ChartHeader = styled.div`
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  gap: 8px;
  background: ${({ theme }) => (theme.isDark ? '#131118' : '#ffffff')};

  @media screen and (max-width: ${NAV_BREAKPOINTS.md}px) {
    padding: 12px 14px;
    gap: 6px;
  }
`

const ChartHeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
  flex-wrap: wrap;

  @media screen and (max-width: ${NAV_BREAKPOINTS.md}px) {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
`

const ChartBody = styled.div`
  flex: 1;
  min-height: 0;
  position: relative;
  z-index: 1;
  overflow: hidden;
`

const ChartPlaceholder = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  min-height: 200px;
`

type SwapTradingViewChartProps = {
  inputCurrency?: Currency
  outputCurrency?: Currency
  inputCurrencyId: string
  outputCurrencyId: string
  chartInverted: boolean
  onChartPairFlip: () => void
  chainId?: number
  variant?: 'inline' | 'sheet'
  /** When false, skips Binance API / heavy chart mounts until visible. */
  active?: boolean
}

const SwapTradingViewChart: React.FC<SwapTradingViewChartProps> = ({
  inputCurrency,
  outputCurrency,
  inputCurrencyId,
  outputCurrencyId,
  chartInverted,
  onChartPairFlip,
  chainId,
  variant = 'inline',
  active = true,
}) => {
  const { t, currentLanguage } = useTranslation()
  const theme = useTheme()
  const isDark = theme.isDark
  const isSheet = variant === 'sheet'

  const resolvedInput = useCurrency(inputCurrencyId) ?? inputCurrency
  const resolvedOutput = useCurrency(outputCurrencyId) ?? outputCurrency

  const hasPair = Boolean(
    inputCurrencyId && outputCurrencyId && inputCurrencyId.toLowerCase() !== outputCurrencyId.toLowerCase(),
  )

  const baseCurrencyId = chartInverted ? outputCurrencyId : inputCurrencyId
  const quoteCurrencyId = chartInverted ? inputCurrencyId : outputCurrencyId
  const baseCurrency = chartInverted ? resolvedOutput ?? undefined : resolvedInput ?? undefined
  const quoteCurrency = chartInverted ? resolvedInput ?? undefined : resolvedOutput ?? undefined

  const pairLabel = useMemo(() => {
    const fromIds = getChartPairLabelFromIds(baseCurrencyId, quoteCurrencyId)
    if (fromIds) {
      return fromIds
    }
    return getChartPairLabel(baseCurrency, quoteCurrency, chainId)
  }, [baseCurrencyId, quoteCurrencyId, baseCurrency, quoteCurrency, chainId])

  const market = useMemo(
    () =>
      hasPair && baseCurrency && quoteCurrency
        ? resolveBinanceMarket(baseCurrency, quoteCurrency, chainId)
        : null,
    [hasPair, baseCurrency, quoteCurrency, chainId],
  )

  const binancePair = market?.binancePair ?? ''
  const invertPrices = Boolean(market?.isInvertedMarket)
  const embedSymbol = market?.tradingViewSymbol ?? 'BINANCE:BNBUSDT'
  const isProxy = usesProxyChartSymbol(baseCurrency, quoteCurrency, chainId)
  const useUnifiedChart = Boolean(binancePair)
  const showNoData = isProxy

  const { ticker, loading: tickerLoading } = useBinance24hTicker(baseCurrency, quoteCurrency, chainId, active)

  const [chartInterval, setChartInterval] = useState<ChartInterval>('15m')

  useEffect(() => {
    setChartInterval('15m')
  }, [inputCurrencyId, outputCurrencyId])

  const chartRenderKey = `${binancePair}-${invertPrices}-${isDark}-${isSheet}`

  const { candles, loading: candlesLoading } = useBinanceKlines(
    useUnifiedChart && !showNoData ? binancePair : undefined,
    chartInterval,
    300,
    invertPrices,
    active,
  )

  const handleFlipClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onChartPairFlip()
    },
    [onChartPairFlip],
  )

  if (!hasPair) {
    return (
      <ChartShell $variant={variant}>
        <ChartPlaceholder>
          <Text color="textSubtle">{t('Select tokens to view the chart')}</Text>
        </ChartPlaceholder>
      </ChartShell>
    )
  }

  const chartBody = (
    <Suspense fallback={<ChartChunkFallback />}>
      {useUnifiedChart ? (
        <SwapBinanceCandleChart
          candles={candles}
          loading={candlesLoading}
          isDark={isDark}
          interval={chartInterval}
          onIntervalChange={setChartInterval}
          chartKey={chartRenderKey}
          layout={isSheet ? 'mobile' : 'desktop'}
          pairLabel={pairLabel}
          showNoData={showNoData}
        />
      ) : (
        <SwapTradingViewAdvancedEmbed
          symbol={embedSymbol}
          theme={isDark ? 'dark' : 'light'}
          locale={currentLanguage.code}
          interval="15"
          remountKey={`${embedSymbol}-${chartInverted}-${isDark}-${isSheet}`}
        />
      )}
    </Suspense>
  )

  return (
    <ChartShell $variant={variant}>
      {isSheet ? (
        <SwapChartMobileHeader
          pairLabel={pairLabel}
          baseCurrency={baseCurrency}
          quoteCurrency={quoteCurrency}
          inverted={chartInverted}
          onFlip={handleFlipClick}
          disabled={!hasPair}
          ticker={ticker}
          tickerLoading={tickerLoading}
        />
      ) : (
        <ChartHeader>
          <ChartHeaderRow>
            <SwapChartPairHeader
              pairLabel={pairLabel}
              baseCurrency={baseCurrency}
              quoteCurrency={quoteCurrency}
              inverted={chartInverted}
              onFlip={handleFlipClick}
              disabled={!hasPair}
            />
            {baseCurrency && quoteCurrency && (
              <SwapChart24hStats baseCurrency={baseCurrency} quoteCurrency={quoteCurrency} chainId={chainId} />
            )}
          </ChartHeaderRow>
          {isProxy && pairLabel && (
            <Text fontSize="12px" color="textSubtle">
              {t('Reference chart for %pair% (TradingView)', { pair: pairLabel })}
            </Text>
          )}
        </ChartHeader>
      )}
      <ChartBody>{chartBody}</ChartBody>
    </ChartShell>
  )
}

export default SwapTradingViewChart
