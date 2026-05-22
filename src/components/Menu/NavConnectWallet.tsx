import React from 'react'
import styled from 'styled-components'
import { ChevronDownIcon } from '@pancakeswap/uikit'
import MetaMaskFoxIcon from 'components/MetaMaskFoxIcon'
import { useTranslation } from 'contexts/Localization'
import useConnectWalletModal from 'hooks/useConnectWalletModal'
import { closeNavLogoMkDropdown } from './closeNavLogoMkDropdown'
import { NAV_HEADER } from './navHeaderTheme'

/** Same gold gradient CTA as footer "Buy JNTo" (SiteFooter BuyLink). */
const ConnectPill = styled.button<{ $compact?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ $compact }) => ($compact ? 6 : 6)}px;
  height: ${NAV_HEADER.pillHeight}px;
  padding: ${({ $compact }) => ($compact ? '0 10px' : '0 22px')};
  border: ${({ $compact, theme }) =>
    $compact
      ? `1px solid ${theme.isDark ? NAV_HEADER.borderDark : theme.colors.cardBorder}`
      : '0'};
  border-radius: ${NAV_HEADER.pillRadius}px;
  background: ${({ $compact, theme }) =>
    $compact
      ? theme.isDark
        ? NAV_HEADER.walletBgDark
        : NAV_HEADER.walletBgLight
      : NAV_HEADER.ctaGradient};
  color: ${({ $compact }) => ($compact ? 'inherit' : NAV_HEADER.ctaText)};
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: ${({ $compact }) => ($compact ? 'none' : NAV_HEADER.ctaShadow)};
  transition: filter 0.2s, border-color 0.2s;

  &:hover {
    filter: ${({ $compact }) => ($compact ? 'none' : 'brightness(1.05)')};
    color: ${({ $compact, theme }) => ($compact ? theme.colors.text : NAV_HEADER.ctaText)};
    border-color: ${({ $compact, theme }) =>
      $compact && theme.isDark ? 'rgba(255, 255, 255, 0.14)' : undefined};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`

interface NavConnectWalletProps {
  compact?: boolean
}

const NavConnectWallet: React.FC<NavConnectWalletProps> = ({ compact = false }) => {
  const { t } = useTranslation()
  const { openConnectWalletModal } = useConnectWalletModal()

  return (
    <ConnectPill
      type="button"
      $compact={compact}
      onClick={() => {
        closeNavLogoMkDropdown()
        openConnectWalletModal()
      }}
      aria-label={t('Connect Wallet')}
    >
      <MetaMaskFoxIcon size={compact ? 22 : 24} />
      {compact ? (
        <ChevronDownIcon width="18px" color="text" />
      ) : (
        t('Connect Wallet')
      )}
    </ConnectPill>
  )
}

export default NavConnectWallet
