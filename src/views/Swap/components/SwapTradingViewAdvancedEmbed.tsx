import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'

const EmbedHost = styled.div`
  width: 100%;
  height: 100%;
  min-height: 360px;

  .tradingview-widget-container,
  .tradingview-widget-container__widget {
    width: 100%;
    height: 100%;
    min-height: 360px;
  }
`

type SwapTradingViewAdvancedEmbedProps = {
  symbol: string
  theme: 'dark' | 'light'
  locale: string
  interval?: string
  remountKey: string
}

/** Official TradingView Advanced Chart embed (full toolbar + Pancake-style TV UI). */
const SwapTradingViewAdvancedEmbed: React.FC<SwapTradingViewAdvancedEmbedProps> = ({
  symbol,
  theme,
  locale,
  interval = '15',
  remountKey,
}) => {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host || !symbol) {
      return undefined
    }

    host.innerHTML = ''

    const container = document.createElement('div')
    container.className = 'tradingview-widget-container'
    container.style.height = '100%'
    container.style.width = '100%'

    const widget = document.createElement('div')
    widget.className = 'tradingview-widget-container__widget'
    widget.style.height = '100%'
    widget.style.width = '100%'

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval,
      timezone: 'Etc/UTC',
      theme,
      style: '1',
      locale,
      enable_publishing: false,
      allow_symbol_change: false,
      hide_top_toolbar: false,
      hide_legend: false,
      hide_side_toolbar: false,
      save_image: false,
      calendar: false,
      support_host: 'https://www.tradingview.com',
    })

    container.appendChild(widget)
    container.appendChild(script)
    host.appendChild(container)

    return () => {
      host.innerHTML = ''
    }
  }, [symbol, theme, locale, interval, remountKey])

  return <EmbedHost ref={hostRef} />
}

export default SwapTradingViewAdvancedEmbed
