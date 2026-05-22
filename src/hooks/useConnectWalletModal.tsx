import React, { useCallback } from 'react'
import { ConnectorNames, useModal } from '@pancakeswap/uikit'
import ConnectWalletModal from 'components/Wallet/ConnectWalletModal'
import useAuth from 'hooks/useAuth'
import { useTranslation } from 'contexts/Localization'
import { WalletKey } from 'utils/walletProviders'

const useConnectWalletModal = () => {
  const { login, logout } = useAuth()
  const { t } = useTranslation()

  const loginForModal = useCallback(
    (connectorId: ConnectorNames, walletKey?: WalletKey) => {
      void login(connectorId, walletKey)
    },
    [login],
  )

  const [onPresentConnectModal] = useModal(
    <ConnectWalletModal login={loginForModal} t={t} />,
    true,
    false,
    'nav-connect-modal',
  )

  const openConnectWalletModal = useCallback(() => {
    onPresentConnectModal()
  }, [onPresentConnectModal])

  return {
    openConnectWalletModal,
    onPresentConnectWalletModal: onPresentConnectModal,
    logout,
  }
}

export default useConnectWalletModal
