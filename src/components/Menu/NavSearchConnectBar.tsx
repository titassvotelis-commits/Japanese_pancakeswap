import React from 'react'
import styled from 'styled-components'
import { useTranslation } from 'contexts/Localization'
import useConnectWalletModal from 'hooks/useConnectWalletModal'
import NavTokenSearch from './NavTokenSearch'
import { closeNavLogoMkDropdown } from './closeNavLogoMkDropdown'
import { NAV_HEADER } from './navHeaderTheme'

const Bar = styled.div`
  display: inline-flex;
  align-items: center;
  height: ${NAV_HEADER.pillHeight}px;
  max-width: 340px;
  min-width: 260px;
  padding: 0 6px 0 4px;
  border-radius: ${NAV_HEADER.pillRadius}px;
  border: 1px solid
    ${({ theme }) => (theme.isDark ? NAV_HEADER.borderDark : theme.colors.cardBorder)};
  background: ${({ theme }) => (theme.isDark ? NAV_HEADER.searchBgDark : NAV_HEADER.searchBgLight)};
  box-shadow: ${({ theme }) =>
    theme.isDark ? 'inset 0 1px 0 rgba(255, 255, 255, 0.04)' : 'none'};
  flex-shrink: 1;
  min-width: 0;
  overflow: hidden;
`

const Divider = styled.span`
  width: 1px;
  height: 22px;
  margin: 0 4px;
  background: ${({ theme }) => theme.colors.cardBorder};
  flex-shrink: 0;
`

const ConnectButton = styled.button`
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  padding: 0 12px;
  height: 100%;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`

const NavSearchConnectBar: React.FC = () => {
  const { t } = useTranslation()
  const { openConnectWalletModal } = useConnectWalletModal()

  return (
    <Bar>
      <NavTokenSearch embedded mode="full" />
      <Divider />
      <ConnectButton
        type="button"
        onClick={() => {
          closeNavLogoMkDropdown()
          openConnectWalletModal()
        }}
      >
        {t('Connect Wallet')}
      </ConnectButton>
    </Bar>
  )
}

export default NavSearchConnectBar
