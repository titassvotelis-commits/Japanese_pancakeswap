import React from 'react'
import styled from 'styled-components'
import {
  NAV_BODY_OFFSET,
  NAV_BOTTOM_BAR_HEIGHT,
  NAV_BREAKPOINTS,
} from 'components/Menu/navHeaderTheme'
import { TRADE_PAGE_BG } from 'theme/colors'

const Shell = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 16px 12px;
  min-height: calc(100vh - ${NAV_BODY_OFFSET}px);
  min-height: calc(100dvh - ${NAV_BODY_OFFSET}px);
  background: ${({ theme }) => (theme.isDark ? TRADE_PAGE_BG.dark : TRADE_PAGE_BG.light)};
  background-attachment: scroll;
  overflow-x: hidden;
  overflow-y: visible;

  @media screen and (max-width: ${NAV_BREAKPOINTS.headerFull}px) {
    justify-content: flex-start;
    overflow-x: hidden;
    min-height: auto;
    padding: 12px 12px;
    padding-bottom: calc(${NAV_BOTTOM_BAR_HEIGHT}px + 16px + env(safe-area-inset-bottom, 0px));
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    padding: 20px 16px;
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    padding: 24px 20px;
  }

  ${({ theme }) => theme.mediaQueries.xl} {
    padding: 32px 24px;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255, 255, 255, 0.04) 0%, transparent 65%);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 48px;
    background: ${({ theme }) =>
      theme.isDark
        ? 'linear-gradient(to bottom, transparent, rgba(8, 6, 11, 0.12))'
        : 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.08))'};
    pointer-events: none;
  }
`

const TRADE_CARD_MAX_WIDTH = 436
/** Swap page with chart — wider shell so the graph can expand */
const SWAP_WITH_CHART_MAX_WIDTH = 1560

const Inner = styled.div<{ $wide?: boolean }>`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: ${({ $wide }) =>
    $wide
      ? `min(${SWAP_WITH_CHART_MAX_WIDTH}px, 100%)`
      : `min(${TRADE_CARD_MAX_WIDTH}px, 100%)`};
  display: flex;
  flex-direction: column;
  align-items: stretch;
`

const TradePageShell: React.FC<{ children: React.ReactNode; wide?: boolean }> = ({ children, wide }) => {
  return (
    <Shell>
      <Inner $wide={wide}>{children}</Inner>
    </Shell>
  )
}

export default TradePageShell
