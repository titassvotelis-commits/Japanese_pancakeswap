import React, { useState } from 'react'
import {
  ButtonMenu,
  ButtonMenuItem,
  CloseIcon,
  Heading,
  IconButton,
  InjectedModalProps,
  ModalTitle,
} from '@pancakeswap/uikit'
import { AppModalBody, AppModalContainer, AppModalHeader } from 'components/Modal/AppModalStyles'
import { parseUnits } from 'ethers/lib/utils'
import useTheme from 'hooks/useTheme'
import { useTranslation } from 'contexts/Localization'
import styled from 'styled-components'
import { FetchStatus, useGetBnbBalance } from 'hooks/useTokenBalance'
import WalletInfo from './WalletInfo'
import WalletTransactions from './WalletTransactions'

export enum WalletView {
  WALLET_INFO,
  TRANSACTIONS,
}

interface WalletModalProps extends InjectedModalProps {
  initialView?: WalletView
}

export const LOW_BNB_BALANCE = parseUnits('2', 'gwei')

const Tabs = styled.div`
  width: 100%;
  flex-shrink: 0;
  box-sizing: border-box;
  background-color: ${({ theme }) => theme.colors.dropdown};
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  padding: 16px 24px;
`

const WalletModal: React.FC<WalletModalProps> = ({ initialView = WalletView.WALLET_INFO, onDismiss }) => {
  const [view, setView] = useState(initialView)
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { balance, fetchStatus } = useGetBnbBalance()
  const hasLowBnbBalance = fetchStatus === FetchStatus.SUCCESS && balance.lte(LOW_BNB_BALANCE)

  const handleClick = (newIndex: number) => {
    setView(newIndex)
  }

  return (
    <AppModalContainer minWidth="320px">
      <AppModalHeader background={theme.colors.gradients.bubblegum}>
        <ModalTitle>
          <Heading>{t('Your Wallet')}</Heading>
        </ModalTitle>
        <IconButton variant="text" onClick={onDismiss}>
          <CloseIcon width="24px" color="text" />
        </IconButton>
      </AppModalHeader>
      <Tabs>
        <ButtonMenu scale="sm" variant="subtle" onItemClick={handleClick} activeIndex={view} fullWidth>
          <ButtonMenuItem>{t('Wallet')}</ButtonMenuItem>
          <ButtonMenuItem>{t('Transactions')}</ButtonMenuItem>
        </ButtonMenu>
      </Tabs>
      <AppModalBody>
        {view === WalletView.WALLET_INFO && <WalletInfo hasLowBnbBalance={hasLowBnbBalance} onDismiss={onDismiss} />}
        {view === WalletView.TRANSACTIONS && <WalletTransactions />}
      </AppModalBody>
    </AppModalContainer>
  )
}

export default WalletModal
