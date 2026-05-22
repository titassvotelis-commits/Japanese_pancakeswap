import React from 'react'
import styled from 'styled-components'
import { parseUnits } from 'ethers/lib/utils'
import { BaseMenu, Box, Button, ChevronDownIcon, Flex, Text, useModal } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { FetchStatus, useGetBnbBalance } from 'hooks/useTokenBalance'
import truncateHash from 'utils/truncateHash'
import WalletModal, { WalletView } from './UserMenu/WalletModal'

const LOW_BNB_BALANCE = parseUnits('2', 'gwei')

const Trigger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  max-width: 140px;
  padding: 0 10px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.text};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  line-height: 1;
  flex-shrink: 0;
  white-space: nowrap;
  transition: border-color 0.2s, background-color 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.dropdown};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`

const MenuPanel = styled(Box)`
  min-width: 200px;
  padding: 8px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.default};
  box-shadow: ${({ theme }) => theme.shadows.tooltip};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
`

interface WalletNavMenuProps {
  account: string
}

const WalletNavMenu: React.FC<WalletNavMenuProps> = ({ account }) => {
  const { t } = useTranslation()
  const { balance, fetchStatus } = useGetBnbBalance()
  const hasLowBnbBalance = fetchStatus === FetchStatus.SUCCESS && balance.lte(LOW_BNB_BALANCE)
  const [onPresentWalletModal] = useModal(<WalletModal />)
  const [onPresentTransactions] = useModal(<WalletModal initialView={WalletView.TRANSACTIONS} />)

  const openWallet = (close?: () => void) => {
    close?.()
    onPresentWalletModal()
  }

  return (
    <Flex alignItems="center" height="100%" flexShrink={0}>
      <BaseMenu
        component={
          <Trigger type="button" aria-label={t('Wallet menu')}>
            <Text bold fontSize="13px" color="text">
              {truncateHash(account, 2, 4)}
            </Text>
            <ChevronDownIcon width="16px" color="text" />
          </Trigger>
        }
        options={{ placement: 'bottom-end', offset: [0, 8] }}
      >
        {({ close }) => (
          <MenuPanel>
            <Button variant="text" width="100%" onClick={() => openWallet(close)}>
              {t('Wallet')}
              {hasLowBnbBalance ? ' ⚠' : ''}
            </Button>
            <Button
              variant="text"
              width="100%"
              onClick={() => {
                close()
                onPresentTransactions()
              }}
            >
              {t('Transactions')}
            </Button>
          </MenuPanel>
        )}
      </BaseMenu>
    </Flex>
  )
}

export default WalletNavMenu
