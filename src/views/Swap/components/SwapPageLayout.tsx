import React from 'react'
import styled from 'styled-components'
import { NAV_BREAKPOINTS } from 'components/Menu/navHeaderTheme'

const SWAP_LAYOUT_MAX_WIDTH = 1560
const SWAP_FORM_WIDTH = 436

export const SwapGrid = styled.div<{ $showChart: boolean; $sideBySide: boolean }>`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: min(${SWAP_LAYOUT_MAX_WIDTH}px, 100%);
  gap: 16px;
  align-items: start;

  ${({ $showChart, $sideBySide }) =>
    $showChart && $sideBySide
      ? `
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(min(300px, 100%), ${SWAP_FORM_WIDTH}px);
    gap: 20px;
  `
      : $showChart
        ? `
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  `
        : `
    display: flex;
    flex-direction: column;
    align-items: center;
  `}

  @media screen and (min-width: ${NAV_BREAKPOINTS.swapSideBySide}px) {
    ${({ $showChart, $sideBySide }) =>
      $showChart &&
      $sideBySide &&
      `
      grid-template-columns: minmax(0, 1.35fr) minmax(320px, ${SWAP_FORM_WIDTH}px);
      gap: 24px;
    `}
  }

  @media screen and (max-width: ${NAV_BREAKPOINTS.lg}px) {
    max-width: 100%;
    gap: 12px;
  }

  @media screen and (max-width: ${NAV_BREAKPOINTS.sm}px) {
    gap: 10px;
  }
`

export const SwapChartColumn = styled.div`
  width: 100%;
  min-width: 0;
  min-height: clamp(280px, 42vh, 400px);
  height: clamp(320px, calc(100vh - 220px), 720px);
  max-height: min(720px, calc(100dvh - 180px));
  order: -1;

  @media screen and (min-width: ${NAV_BREAKPOINTS.lg}px) {
    order: 0;
    min-height: 400px;
    height: clamp(420px, calc(100vh - 160px), 720px);
  }

  @media screen and (max-width: ${NAV_BREAKPOINTS.md}px) {
    min-height: clamp(260px, 38vh, 360px);
    height: clamp(280px, 40vh, 400px);
    max-height: 400px;
  }

  @media screen and (max-width: ${NAV_BREAKPOINTS.sm}px) {
    min-height: 240px;
    height: clamp(240px, 36vh, 320px);
    max-height: 320px;
  }
`

export const SwapFormColumn = styled.div`
  width: 100%;
  min-width: 0;
  max-width: ${SWAP_FORM_WIDTH}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  @media screen and (max-width: ${NAV_BREAKPOINTS.lg}px) {
    max-width: 100%;
    align-items: stretch;
  }
`

type SwapPageLayoutProps = {
  showChart: boolean
  sideBySide: boolean
  chart: React.ReactNode
  children: React.ReactNode
}

const SwapPageLayout: React.FC<SwapPageLayoutProps> = ({ showChart, sideBySide, chart, children }) => {
  return (
    <SwapGrid $showChart={showChart} $sideBySide={sideBySide}>
      {showChart && <SwapChartColumn>{chart}</SwapChartColumn>}
      <SwapFormColumn>{children}</SwapFormColumn>
    </SwapGrid>
  )
}

export default SwapPageLayout
