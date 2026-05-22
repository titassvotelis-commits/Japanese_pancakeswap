import React from 'react'
import { Button } from '@pancakeswap/uikit'
import useConnectWalletModal from 'hooks/useConnectWalletModal'
import { useTranslation } from 'contexts/Localization'

const UnlockButton = (props) => {
  const { t } = useTranslation()
  const { openConnectWalletModal } = useConnectWalletModal()

  return (
    <Button onClick={openConnectWalletModal} {...props}>
      {t('Unlock Wallet')}
    </Button>
  )
}

export default UnlockButton
