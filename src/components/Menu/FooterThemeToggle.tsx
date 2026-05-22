import React from 'react'
import styled, { useTheme as useStyledTheme } from 'styled-components'
import { MoonIcon, SunIcon } from '@pancakeswap/uikit'

const Track = styled.button`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 56px;
  height: 32px;
  padding: 0 8px;
  border: 0;
  border-radius: 24px;
  cursor: pointer;
  flex-shrink: 0;
  background-color: ${({ theme }) => theme.colors.textDisabled};
  box-shadow: ${({ theme }) => theme.shadows.inset};

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`

const Handle = styled.span<{ $isDark: boolean }>`
  position: absolute;
  top: 3px;
  left: ${({ $isDark }) => ($isDark ? 'calc(100% - 30px)' : '3px')};
  z-index: 2;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: left 200ms ease-in;
  background-color: ${({ theme, $isDark }) => ($isDark ? theme.colors.invertedContrast : '#ffffff')};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  border: ${({ theme, $isDark }) => ($isDark ? `2px solid ${theme.colors.secondary}` : 'none')};
`

const IconSlot = styled.span`
  position: relative;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  pointer-events: none;
`

interface FooterThemeToggleProps {
  isDark: boolean
  onToggle: (nextIsDark: boolean) => void
}

const FooterThemeToggle: React.FC<FooterThemeToggleProps> = ({ isDark, onToggle }) => {
  const theme = useStyledTheme()
  const inactiveIconColor = theme.colors.textSubtle

  return (
    <Track
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => onToggle(!isDark)}
    >
      <IconSlot>
        <SunIcon width="16px" color={isDark ? inactiveIconColor : theme.colors.warning} />
      </IconSlot>
      <IconSlot>
        <MoonIcon width="16px" color={isDark ? theme.colors.secondary : inactiveIconColor} />
      </IconSlot>
      <Handle $isDark={isDark} aria-hidden>
        {isDark ? (
          <MoonIcon width="16px" color={theme.colors.secondary} />
        ) : (
          <SunIcon width="16px" color={theme.colors.warning} />
        )}
      </Handle>
    </Track>
  )
}

export default FooterThemeToggle
