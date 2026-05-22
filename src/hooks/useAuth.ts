import { useCallback } from 'react'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { NoBscProviderError } from '@binance-chain/bsc-connector'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector'
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from '@web3-react/walletconnect-connector'
import { ConnectorNames, connectorLocalStorageKey } from '@pancakeswap/uikit'
import { connectorsByName } from 'utils/web3React'
import { isWalletConnectConfigured, WalletConnectV2Connector } from 'utils/WalletConnectV2Connector'
import { requestAccountPicker } from 'utils/metamaskAccount'
import { setupNetwork } from 'utils/wallet'
import { openMobileWalletApp } from 'utils/mobileWallet'
import {
  getActiveWalletProvider,
  isBinanceChainInstalled,
  isWalletInstalled,
  setStoredWalletKey,
  shouldUseMobileWalletDeepLink,
  WalletKey,
} from 'utils/walletProviders'
import useToast from 'hooks/useToast'
import { profileClear } from 'state/profile'
import { useAppDispatch } from 'state'
import { useTranslation } from 'contexts/Localization'
import { clearAllTransactions } from 'state/transactions/actions'

function isWalletConnectConnector(connector: unknown): connector is WalletConnectV2Connector {
  return connector instanceof WalletConnectV2Connector
}

function isUserRejectedRequest(error: unknown): boolean {
  if (
    error instanceof UserRejectedRequestErrorInjected ||
    error instanceof UserRejectedRequestErrorWalletConnect
  ) {
    return true
  }
  const err = error as { name?: string; code?: number }
  return err?.code === 4001 || err?.name === 'UserRejectedRequestError'
}

const WALLET_INSTALL_HINTS: Record<WalletKey, string> = {
  [WalletKey.MetaMask]:
    'On desktop, install the MetaMask extension. On mobile, tap MetaMask in Connect Wallet to open the app.',
  [WalletKey.Trust]:
    'On desktop, install Trust Wallet extension. On mobile, tap Trust Wallet in Connect Wallet to open the app.',
  [WalletKey.Phantom]: 'Install the Phantom browser extension, then refresh this page.',
}

const useAuth = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { chainId, activate, deactivate } = useWeb3React()
  const { toastError } = useToast()

  const handleActivationError = useCallback(
    async (error: Error, connector: (typeof connectorsByName)[ConnectorNames], connectorID: ConnectorNames) => {
      window.localStorage.removeItem(connectorLocalStorageKey)

      if (error instanceof UnsupportedChainIdError) {
        const provider = getActiveWalletProvider()
        const hasSetup = await setupNetwork(provider)
        if (hasSetup) {
          try {
            await activate(connector, undefined, true)
            window.localStorage.setItem(connectorLocalStorageKey, connectorID)
          } catch (retryError) {
            if (isUserRejectedRequest(retryError)) {
              if (isWalletConnectConnector(connector)) {
                void connector.close()
              }
              return
            }
            toastError(t('Network Error'), t('Please switch your wallet to BNB Smart Chain (BSC)'))
          }
          return
        }
        toastError(t('Network Error'), t('Please switch your wallet to BNB Smart Chain (BSC)'))
        return
      }

      if (isUserRejectedRequest(error)) {
        if (isWalletConnectConnector(connector)) {
          void connector.close()
        }
        return
      }

      if (error instanceof NoEthereumProviderError || error instanceof NoBscProviderError) {
        toastError(t('Provider Error'), t('No provider was found'))
        return
      }

      toastError(error.name, error.message)
    },
    [activate, t, toastError],
  )

  const login = useCallback(
    async (connectorID: ConnectorNames, walletKey?: WalletKey): Promise<void> => {
      if (connectorID === ConnectorNames.Injected && walletKey) {
        setStoredWalletKey(walletKey)
        if (shouldUseMobileWalletDeepLink(walletKey)) {
          openMobileWalletApp(walletKey)
          return
        }
        if (!isWalletInstalled(walletKey)) {
          toastError(t('Wallet not found'), WALLET_INSTALL_HINTS[walletKey])
          return
        }
      }

      if (connectorID === ConnectorNames.WalletConnect && !isWalletConnectConfigured()) {
        toastError(
          t('WalletConnect unavailable'),
          t('Add REACT_APP_WALLETCONNECT_PROJECT_ID to .env.development (free at cloud.walletconnect.com), then restart the dev server.'),
        )
        return
      }

      if (connectorID === ConnectorNames.BSC && !isBinanceChainInstalled()) {
        toastError(
          t('Wallet not found'),
          t('Install Binance Wallet extension and refresh, or use MetaMask / Trust Wallet on BSC.'),
        )
        return
      }

      const connector = connectorsByName[connectorID]
      if (!connector) {
        toastError(t('Unable to find connector'), t('The connector config is wrong'))
        return
      }

      try {
        await activate(connector, undefined, true)
        window.localStorage.setItem(connectorLocalStorageKey, connectorID)
      } catch (error) {
        try {
          await handleActivationError(error as Error, connector, connectorID)
        } catch {
          // handleActivationError must not surface user cancel as an unhandled rejection
        }
      }
    },
    [activate, handleActivationError, t, toastError],
  )

  const changeAccount = useCallback(async () => {
    const provider = getActiveWalletProvider() ?? window.ethereum
    if (!provider?.request) {
      toastError(t('Provider Error'), t('No provider was found'))
      return
    }
    try {
      await requestAccountPicker(provider)
      const connector = connectorsByName[ConnectorNames.Injected]
      if (connector) {
        await connector.activate()
      }
    } catch (error: unknown) {
      if (isUserRejectedRequest(error)) {
        return
      }
      toastError(t('Error'), t('Could not change account'))
    }
  }, [toastError, t])

  const logout = useCallback(() => {
    dispatch(profileClear())
    deactivate()
    const walletConnect = connectorsByName[ConnectorNames.WalletConnect]
    if (isWalletConnectConnector(walletConnect)) {
      void walletConnect.close()
    }
    window.localStorage.removeItem(connectorLocalStorageKey)
    if (chainId) {
      dispatch(clearAllTransactions({ chainId }))
    }
  }, [deactivate, dispatch, chainId])

  return { login, logout, changeAccount }
}

export default useAuth
