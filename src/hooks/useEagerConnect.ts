import { useEffect } from 'react'
import { connectorLocalStorageKey, ConnectorNames } from '@pancakeswap/uikit'
import useAuth from 'hooks/useAuth'
import {
  getStoredWalletKey,
  isBinanceChainInstalled,
  isWalletInstalled,
  normalizeWalletKey,
  WalletKey,
} from 'utils/walletProviders'

const _binanceChainListener = async () =>
  new Promise<void>((resolve) =>
    Object.defineProperty(window, 'BinanceChain', {
      get() {
        return this.bsc
      },
      set(bsc) {
        this.bsc = bsc

        resolve()
      },
    }),
  )

const useEagerConnect = () => {
  const { login } = useAuth()

  useEffect(() => {
    const connectorId = window.localStorage.getItem(connectorLocalStorageKey) as ConnectorNames

    if (!connectorId) {
      return
    }

    if (connectorId === ConnectorNames.Injected) {
      const walletKey = getStoredWalletKey() ?? normalizeWalletKey(window.localStorage.getItem('wallet'))
      if (walletKey && !isWalletInstalled(walletKey)) {
        window.localStorage.removeItem(connectorLocalStorageKey)
        return
      }
      if (!walletKey && !isWalletInstalled(WalletKey.MetaMask)) {
        window.localStorage.removeItem(connectorLocalStorageKey)
        return
      }
    }

    if (connectorId === ConnectorNames.BSC && !isBinanceChainInstalled()) {
      window.localStorage.removeItem(connectorLocalStorageKey)
      return
    }

    const isConnectorBinanceChain = connectorId === ConnectorNames.BSC
    const isBinanceChainDefined = Reflect.has(window, 'BinanceChain')

    if (isConnectorBinanceChain && !isBinanceChainDefined) {
      _binanceChainListener().then(() => {
        void login(connectorId)
      })
      return
    }

    void login(connectorId)
  }, [login])
}

export default useEagerConnect
