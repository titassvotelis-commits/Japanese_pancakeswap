import React from 'react'
import styled from 'styled-components'
import { Card } from '@pancakeswap/uikit'
import {
  NAV_BODY_OFFSET,
  NAV_BOTTOM_BAR_HEIGHT,
  NAV_BREAKPOINTS,
} from 'components/Menu/navHeaderTheme'

const TRADE_CARD_MAX_WIDTH = 436

export const BodyWrapper = styled(Card)<{ $trade?: boolean }>`
  border-radius: 24px;
  max-width: ${TRADE_CARD_MAX_WIDTH}px;
  width: 100%;
  z-index: 1;
  overflow: hidden;

  ${({ $trade, theme }) =>
    $trade &&
    `
    width: 100%;
    max-width: min(${TRADE_CARD_MAX_WIDTH}px, calc(100vw - 32px));
    max-height: calc(100vh - ${NAV_BODY_OFFSET}px - 48px);
    max-height: calc(100dvh - ${NAV_BODY_OFFSET}px - 48px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid ${theme.isDark ? 'rgba(92, 177, 221, 0.2)' : 'rgba(92, 177, 221, 0.25)'};
    box-shadow: ${
      theme.isDark
        ? '0 8px 32px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(92, 177, 221, 0.08)'
        : '0 8px 40px rgba(92, 177, 221, 0.18), 0 2px 8px rgba(25, 19, 38, 0.06)'
    };

    @media screen and (max-width: ${NAV_BREAKPOINTS.headerFull}px) {
      max-height: none;
      overflow: visible;
    }

    & > div:first-child {
      padding: 16px 20px;
      flex-shrink: 0;
    }

    & > div:last-child {
      flex: 1;
      min-height: 0;
      width: 100%;
      overflow-x: hidden;
      overflow-y: auto;
    }

    @media screen and (max-width: ${NAV_BREAKPOINTS.headerFull}px) {
      & > div:last-child {
        flex: none;
        min-height: auto;
        overflow: visible;
      }
    }
  `}
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({
  children,
  trade,
}: {
  children: React.ReactNode
  trade?: boolean
}) {
  return <BodyWrapper $trade={trade}>{children}</BodyWrapper>
}
