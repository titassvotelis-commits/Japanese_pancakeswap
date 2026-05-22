import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { createChart, IChartApi, UTCTimestamp } from 'lightweight-charts'
import { BunnyPlaceholderIcon, Text } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { BinanceCandle } from 'hooks/useBinanceKlines'
import { NAV_BREAKPOINTS } from 'components/Menu/navHeaderTheme'
import { formatChartPrice } from 'utils/chartFormatPrice'

export const TV_CHART_COLORS = {
  dark: {
    bg: '#131722',
    grid: '#363c4e',
    text: '#d1d4dc',
    up: '#26a69a',
    down: '#ef5350',
    toolbar: '#1e222d',
    border: '#2a2e39',
  },
  light: {
    bg: '#ffffff',
    grid: '#e0e3eb',
    text: '#131722',
    up: '#26a69a',
    down: '#ef5350',
    toolbar: '#f0f3fa',
    border: '#e0e3eb',
  },
}

const ChartFrame = styled.div<{ $isDark: boolean; $mobile?: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: ${({ $isDark, $mobile }) =>
    $mobile ? '#131722' : $isDark ? TV_CHART_COLORS.dark.bg : TV_CHART_COLORS.light.bg};
`

const TvToolbar = styled.div<{ $isDark: boolean; $mobile?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ $mobile }) => ($mobile ? '0' : '2px')};
  padding: ${({ $mobile }) => ($mobile ? '0 12px' : '4px 8px')};
  flex-shrink: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  background: ${({ $isDark, $mobile }) =>
    $mobile ? '#1a1b1f' : $isDark ? TV_CHART_COLORS.dark.toolbar : TV_CHART_COLORS.light.toolbar};
  border-bottom: 1px solid
    ${({ $isDark, $mobile }) => ($mobile ? '#2b2f36' : $isDark ? TV_CHART_COLORS.dark.border : TV_CHART_COLORS.light.border)};

  &::-webkit-scrollbar {
    display: none;
  }
`

const ToolbarDivider = styled.div`
  width: 1px;
  height: 20px;
  background: #363c4e;
  margin: 0 8px;
  flex-shrink: 0;
`

const ToolbarMuted = styled.span`
  font-size: 12px;
  color: #848e9c;
  white-space: nowrap;
  padding: 6px 4px;
  font-family: -apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif;
`

const CandleIcon = styled.span`
  display: inline-flex;
  width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  color: #848e9c;
  font-size: 14px;
`

export const CHART_INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d'] as const
export type ChartInterval = (typeof CHART_INTERVALS)[number]

const IntervalBtn = styled.button<{ $active?: boolean; $isDark: boolean; $mobile?: boolean }>`
  border: none;
  margin: 0;
  padding: ${({ $mobile }) => ($mobile ? '8px 10px' : '4px 10px')};
  flex-shrink: 0;
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif;
  cursor: pointer;
  border-radius: 4px;
  touch-action: manipulation;

  &:hover {
    opacity: 0.85;
  }
  color: ${({ $active, $isDark, $mobile }) => {
    if ($active) return '#2962ff'
    if ($mobile) return '#eaecef'
    return $isDark ? TV_CHART_COLORS.dark.text : TV_CHART_COLORS.light.text
  }};
  background: ${({ $active, $isDark, $mobile }) => {
    if (!$active) return 'transparent'
    if ($mobile) return 'transparent'
    return $isDark ? 'rgba(41, 98, 255, 0.2)' : 'rgba(41, 98, 255, 0.12)'
  }};
  font-weight: ${({ $active, $mobile }) => ($mobile && $active ? 600 : 400)};

  @media screen and (max-width: ${NAV_BREAKPOINTS.sm}px) {
    padding: 8px 8px;
    font-size: 12px;
  }
`

const ChartMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px 4px;
  flex-shrink: 0;
  font-size: 13px;
  color: #eaecef;
  font-family: -apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif;
`

const LiveDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #26a69a;
  flex-shrink: 0;
`

const ChartWrap = styled.div`
  flex: 1;
  position: relative;
  min-height: 0;
`

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  pointer-events: none;
`

const EmptyState = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 3;
  padding: 24px;
`

const EmptyIcon = styled.div`
  width: 96px;
  height: 96px;
  opacity: 0.35;
  color: #848e9c;

  svg {
    width: 100%;
    height: 100%;
  }
`

const TvFooter = styled.div<{ $isDark: boolean }>`
  flex-shrink: 0;
  padding: 2px 8px 4px;
  text-align: right;
  font-size: 11px;
  color: ${({ $isDark }) => ($isDark ? '#787b86' : '#9598a1')};
  font-family: -apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif;
`

function formatTvPrice(price: number): string {
  return formatChartPrice(price) || ''
}

type SwapBinanceCandleChartProps = {
  candles: BinanceCandle[]
  loading: boolean
  isDark: boolean
  interval: ChartInterval
  onIntervalChange: (interval: ChartInterval) => void
  chartKey: string
  layout?: 'desktop' | 'mobile'
  pairLabel?: string
  showNoData?: boolean
}

const SwapBinanceCandleChart: React.FC<SwapBinanceCandleChartProps> = ({
  candles,
  loading,
  isDark,
  interval,
  onIntervalChange,
  chartKey,
  layout = 'desktop',
  pairLabel = '',
  showNoData = false,
}) => {
  const { t } = useTranslation()
  const isMobile = layout === 'mobile'
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ReturnType<IChartApi['addCandlestickSeries']> | null>(null)
  const colors = isDark ? TV_CHART_COLORS.dark : TV_CHART_COLORS.light
  const hasChartData = !showNoData && candles.length > 0

  useEffect(() => {
    const el = containerRef.current
    if (!el || showNoData) {
      return undefined
    }

    const chart = createChart(el, {
      width: el.clientWidth,
      height: el.clientHeight || 320,
      layout: {
        backgroundColor: isMobile ? '#131722' : colors.bg,
        textColor: colors.text,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif",
        fontSize: 12,
      },
      rightPriceScale: {
        borderColor: colors.border,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: colors.border,
        timeVisible: true,
        secondsVisible: false,
      },
      grid: {
        horzLines: { color: colors.grid },
        vertLines: { color: colors.grid },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: '#758696', width: 1, style: 3, labelBackgroundColor: '#2962ff' },
        horzLine: { color: '#758696', width: 1, style: 3, labelBackgroundColor: '#2962ff' },
      },
      localization: {
        priceFormatter: formatTvPrice,
      },
    })

    const series = chart.addCandlestickSeries({
      upColor: colors.up,
      downColor: colors.down,
      borderDownColor: colors.down,
      borderUpColor: colors.up,
      wickDownColor: colors.down,
      wickUpColor: colors.up,
      priceFormat: {
        type: 'price',
        precision: 8,
        minMove: 0.00000001,
      },
    })

    chartRef.current = chart
    seriesRef.current = series

    const resize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight || 320,
        })
      }
    }

    resize()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null
    ro?.observe(el)
    window.addEventListener('resize', resize)

    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', resize)
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [chartKey, isDark, colors, isMobile, showNoData])

  useEffect(() => {
    if (seriesRef.current && hasChartData) {
      seriesRef.current.setData(
        candles.map((c) => ({
          time: c.time as UTCTimestamp,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        })),
      )
      chartRef.current?.timeScale().fitContent()
    }
  }, [candles, hasChartData])

  const intervalMeta =
    interval === '1h' ? '1H' : interval === '4h' ? '4H' : interval === '1d' ? '1D' : interval.replace('m', '')

  const toolbar = isMobile ? (
    <TvToolbar $isDark={isDark} $mobile>
      {CHART_INTERVALS.map((iv) => (
        <IntervalBtn
          key={iv}
          type="button"
          $active={iv === interval}
          $isDark={isDark}
          $mobile
          onClick={() => onIntervalChange(iv)}
        >
          {iv}
        </IntervalBtn>
      ))}
      <ToolbarDivider />
      <CandleIcon title="Candles">▮</CandleIcon>
      <ToolbarDivider />
      <ToolbarMuted>fx</ToolbarMuted>
      <ToolbarDivider />
      <ToolbarMuted>{t('Binance pricing')}</ToolbarMuted>
    </TvToolbar>
  ) : (
    <TvToolbar $isDark={isDark}>
      {CHART_INTERVALS.map((iv) => (
        <IntervalBtn
          key={iv}
          type="button"
          $active={iv === interval}
          $isDark={isDark}
          onClick={() => onIntervalChange(iv)}
        >
          {iv}
        </IntervalBtn>
      ))}
    </TvToolbar>
  )

  return (
    <ChartFrame $isDark={isDark} $mobile={isMobile}>
      {toolbar}
      {isMobile && pairLabel && (
        <ChartMeta>
          <span>
            {pairLabel} · {intervalMeta} · MetakeySwap
          </span>
          <LiveDot />
        </ChartMeta>
      )}
      <ChartWrap ref={containerRef}>
        {loading && !hasChartData && !showNoData && (
          <LoadingOverlay>
            <Text color="textSubtle">{t('Loading chart data...')}</Text>
          </LoadingOverlay>
        )}
        {(showNoData || (!loading && !hasChartData)) && (
          <EmptyState>
            <EmptyIcon>
              <BunnyPlaceholderIcon width="96px" />
            </EmptyIcon>
            <Text color="textSubtle" fontSize="14px">
              {t('No data here')}
            </Text>
          </EmptyState>
        )}
      </ChartWrap>
      {!isMobile && <TvFooter $isDark={isDark}>Charting by TradingView</TvFooter>}
    </ChartFrame>
  )
}

export default SwapBinanceCandleChart
