import React from 'react'
import styled, { keyframes } from 'styled-components'
import { NAV_BREAKPOINTS } from 'components/Menu/navHeaderTheme'

const pulse = keyframes`
  0%, 100% { opacity: 0.45; }
  50% { opacity: 0.85; }
`

const Shell = styled.div`
  width: 100%;
  height: 100%;
  min-height: clamp(240px, 36vh, 400px);
  border-radius: 24px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => (theme.isDark ? '#131118' : '#f8fafc')};
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media screen and (max-width: ${NAV_BREAKPOINTS.lg}px) {
    border-radius: 16px;
    min-height: 240px;
  }
`

const Bar = styled.div`
  height: 12px;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.input};
  animation: ${pulse} 1.2s ease-in-out infinite;
`

const Header = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Body = styled.div`
  flex: 1;
  margin: 16px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.input};
  animation: ${pulse} 1.2s ease-in-out infinite;
`

const SwapChartSkeleton: React.FC = () => (
  <Shell>
    <Header>
      <Bar style={{ width: '42%' }} />
      <Bar style={{ width: '28%' }} />
    </Header>
    <Body />
  </Shell>
)

export default SwapChartSkeleton
