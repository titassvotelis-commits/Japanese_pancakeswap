import React from 'react'
import styled from 'styled-components'
import { ArrowDownIcon, ArrowUpDownIcon } from '@pancakeswap/uikit'

const Button = styled.button`
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  flex-shrink: 0;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 12px;
  background: ${({ theme }) =>
    theme.isDark ? 'rgba(28, 26, 38, 0.98)' : theme.colors.backgroundAlt};
  cursor: pointer;
  font-family: inherit;
  box-shadow: ${({ theme }) =>
    theme.isDark ? '0 2px 8px rgba(0, 0, 0, 0.35)' : '0 2px 8px rgba(0, 0, 0, 0.06)'};
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;

  .swap-dir-icon-default,
  .swap-dir-icon-hover {
    position: absolute;
    inset: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.12s ease, transform 0.12s ease;
  }

  .swap-dir-icon-hover {
    opacity: 0;
    pointer-events: none;
    transform: scale(0.9);
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => (theme.isDark ? 'rgba(40, 38, 52, 1)' : theme.colors.backgroundAlt2)};
    box-shadow: ${({ theme }) =>
      theme.isDark ? '0 4px 14px rgba(0, 0, 0, 0.45)' : '0 4px 14px rgba(99, 102, 241, 0.12)'};

    .swap-dir-icon-default {
      opacity: 0;
      transform: scale(0.85);
    }

    .swap-dir-icon-hover {
      opacity: 1;
      transform: scale(1);
    }
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  &:active {
    transform: scale(0.96);
  }

  /* Touch devices: show swap (up/down) icon — hover is unavailable */
  @media (hover: none) {
    .swap-dir-icon-default {
      opacity: 0;
      transform: scale(0.85);
    }

    .swap-dir-icon-hover {
      opacity: 1;
      transform: scale(1);
    }
  }
`

type SwapTokenDirectionButtonProps = {
  onClick: () => void
  'aria-label': string
  /** Icon color when both currencies are selected; falls back to textSubtle */
  active?: boolean
  iconSize?: string
}

const SwapTokenDirectionButton: React.FC<SwapTokenDirectionButtonProps> = ({
  onClick,
  'aria-label': ariaLabel,
  active = true,
  iconSize = '20px',
}) => {
  const iconColor = active ? 'primary' : 'textSubtle'

  return (
    <Button type="button" onClick={onClick} aria-label={ariaLabel}>
      <span className="swap-dir-icon-default" aria-hidden>
        <ArrowDownIcon width={iconSize} color={iconColor} />
      </span>
      <span className="swap-dir-icon-hover" aria-hidden>
        <ArrowUpDownIcon width={iconSize} color={iconColor} />
      </span>
    </Button>
  )
}

export default SwapTokenDirectionButton
