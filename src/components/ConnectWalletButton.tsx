import React from 'react'
import styled from 'styled-components'
import { Button } from '@pancakeswap/uikit'
import useConnectWalletModal from 'hooks/useConnectWalletModal'
import { useTranslation } from 'contexts/Localization'

const StyledConnectButton = styled(Button)`
  height: 40px;
  padding: 0 20px;
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.01em;
  box-shadow: 0 4px 14px rgba(255, 178, 55, 0.35);
`

const ConnectWalletButton = (props) => {
  const { t } = useTranslation()
  const { openConnectWalletModal } = useConnectWalletModal()

  return (
    <StyledConnectButton onClick={openConnectWalletModal} {...props}>
      {t('Connect Wallet')}
    </StyledConnectButton>
  )
}

export default ConnectWalletButton
