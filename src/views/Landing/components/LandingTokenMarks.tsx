import React from 'react'
import styled from 'styled-components'
import { Currency, ETHER } from '@pancakeswap/sdk'
import { BinanceIcon } from '@pancakeswap/uikit'
import tokens from 'config/constants/tokens'
import { CurrencyLogo } from 'components/Logo'
import { NAV_BREAKPOINTS } from 'components/Menu/navHeaderTheme'

const MARK_TOKENS = [
  { currency: tokens.jnto as Currency, label: 'JNTo', featured: true },
  { currency: ETHER, label: 'BNB', isNative: true },
  { currency: tokens.usdt as Currency, label: 'USDT' },
  { currency: tokens.busd as Currency, label: 'BUSD' },
  { currency: tokens.usdc as Currency, label: 'USDC' },
  { currency: tokens.wbnb as Currency, label: 'WBNB' },
]

const MarksRoot = styled.div`
  width: 100%;
  max-width: 100%;
  min-width: 0;

  @media screen and (max-width: ${NAV_BREAKPOINTS.lg}px) {
    align-self: stretch;
  }
`

const ScrollWrap = styled.div`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin-top: 32px;
  position: relative;

  @media screen and (max-width: ${NAV_BREAKPOINTS.lg}px) {
    margin-top: 18px;
    width: 100%;
    max-width: 100%;
    margin-left: 0;
    margin-right: 0;
    padding: 0;

    &::before,
    &::after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 8px;
      width: 28px;
      z-index: 2;
      pointer-events: none;
    }

    &::before {
      left: 0;
      background: ${({ theme }) =>
        theme.isDark
          ? 'linear-gradient(90deg, #1a1528 0%, transparent 100%)'
          : 'linear-gradient(90deg, #f8f6ff 0%, transparent 100%)'};
    }

    &::after {
      right: 0;
      background: ${({ theme }) =>
        theme.isDark
          ? 'linear-gradient(270deg, #1a1528 0%, transparent 100%)'
          : 'linear-gradient(270deg, #f8f6ff 0%, transparent 100%)'};
    }
  }
`

const RowOuter = styled.div`
  width: 100%;
  max-width: 100%;
  min-width: 0;

  @media screen and (max-width: ${NAV_BREAKPOINTS.lg}px) {
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x proximity;
    scrollbar-width: none;
    padding-bottom: 4px;
    overscroll-behavior-x: contain;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: flex-start;
  gap: 16px;

  @media screen and (max-width: ${NAV_BREAKPOINTS.lg}px) {
    flex-wrap: nowrap;
    justify-content: flex-start;
    gap: 14px;
    width: max-content;
    padding: 0 8px 2px;
  }
`

const Mark = styled.div<{ $featured?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  min-width: ${({ $featured }) => ($featured ? '72px' : '60px')};
  scroll-snap-align: center;

  @media screen and (max-width: ${NAV_BREAKPOINTS.lg}px) {
    min-width: ${({ $featured }) => ($featured ? '58px' : '50px')};
    gap: 6px;
  }
`

const MarkRing = styled.div<{ $featured?: boolean }>`
  width: ${({ $featured }) => ($featured ? '64px' : '52px')};
  height: ${({ $featured }) => ($featured ? '64px' : '52px')};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => (theme.isDark ? 'rgba(255, 255, 255, 0.08)' : '#fff')};
  border: 2px solid
    ${({ theme, $featured }) =>
      $featured
        ? theme.isDark
          ? 'rgba(255, 229, 102, 0.55)'
          : 'rgba(212, 146, 10, 0.45)'
        : theme.isDark
          ? 'rgba(255, 255, 255, 0.12)'
          : 'rgba(0, 0, 0, 0.08)'};
  box-shadow: ${({ theme }) =>
    theme.isDark ? '0 4px 14px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(99, 102, 241, 0.12)'};

  @media screen and (max-width: ${NAV_BREAKPOINTS.lg}px) {
    width: ${({ $featured }) => ($featured ? '54px' : '46px')};
    height: ${({ $featured }) => ($featured ? '54px' : '46px')};
  }
`

const IconWrap = styled.div<{ $featured?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 0;

  & img,
  & svg {
    width: ${({ $featured }) => ($featured ? '36px' : '30px')};
    height: ${({ $featured }) => ($featured ? '36px' : '30px')};
  }

  @media screen and (max-width: ${NAV_BREAKPOINTS.lg}px) {
    & img,
    & svg {
      width: ${({ $featured }) => ($featured ? '32px' : '28px')};
      height: ${({ $featured }) => ($featured ? '32px' : '28px')};
    }
  }
`

const MarkLabel = styled.span<{ $featured?: boolean }>`
  font-size: ${({ $featured }) => ($featured ? '13px' : '12px')};
  font-weight: ${({ $featured }) => ($featured ? 700 : 600)};
  color: ${({ theme }) => theme.colors.textSubtle};
  letter-spacing: 0.02em;

  @media screen and (max-width: ${NAV_BREAKPOINTS.lg}px) {
    font-size: ${({ $featured }) => ($featured ? '12px' : '11px')};
  }
`

const Caption = styled.p`
  margin: 20px 0 0;
  font-size: clamp(0.9rem, 2vw, 1.05rem);
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSubtle};
  letter-spacing: 0.02em;
  line-height: 1.45;
  text-align: left;
  max-width: 520px;

  @media screen and (max-width: ${NAV_BREAKPOINTS.lg}px) {
    text-align: center;
    max-width: 100%;
    margin-top: 16px;
    padding: 0 4px;
    font-size: 0.875rem;
    line-height: 1.5;
    word-wrap: break-word;
    overflow-wrap: anywhere;
  }
`

const LandingTokenMarks: React.FC = () => (
  <MarksRoot>
    <ScrollWrap>
      <RowOuter>
        <Row>
          {MARK_TOKENS.map(({ currency, label, featured, isNative }) => (
            <Mark key={label} $featured={featured} title={label}>
              <MarkRing $featured={featured}>
                <IconWrap $featured={featured}>
                  {isNative ? (
                    <BinanceIcon width={featured ? '36px' : '30px'} />
                  ) : (
                    <CurrencyLogo currency={currency} size={featured ? '36px' : '30px'} />
                  )}
                </IconWrap>
              </MarkRing>
              <MarkLabel $featured={featured}>{label}</MarkLabel>
            </Mark>
          ))}
        </Row>
      </RowOuter>
    </ScrollWrap>
    <Caption>Trade JNTo with BNB, stablecoins, and more on BNB Chain</Caption>
  </MarksRoot>
)

export default LandingTokenMarks
