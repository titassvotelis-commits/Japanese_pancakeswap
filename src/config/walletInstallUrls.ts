import { WalletKey } from 'utils/walletProviders'

export const WALLET_INSTALL_URLS: Partial<Record<WalletKey, string>> = {
  [WalletKey.MetaMask]: 'https://metamask.io/download/',
  [WalletKey.Trust]: 'https://trustwallet.com/download',
  [WalletKey.Phantom]: 'https://phantom.app/download',
}

export const BINANCE_WALLET_INSTALL_URL = 'https://www.binance.com/en/web3wallet'
