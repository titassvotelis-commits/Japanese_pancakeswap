import { connectorLocalStorageKey, ConnectorNames } from '@pancakeswap/uikit'
import { isMobileBrowser } from './isMobileBrowser'
import { setStoredWalletKey, WalletKey } from './walletProviders'

/** BNB Smart Chain in Trust Wallet deep links */
const TRUST_BSC_COIN_ID = '20000714'

/**
 * MetaMask Mobile — opens in-app browser with injected provider.
 * @see https://docs.metamask.io/sdk/guides/use-deeplinks/
 */
export function getMetaMaskMobileDappUrl(pageUrl?: string): string {
  const href = pageUrl ?? (typeof window !== 'undefined' ? window.location.href : '')
  const withoutProtocol = href.replace(/^https?:\/\//i, '')
  return `https://metamask.app.link/dapp/${withoutProtocol}`
}

/**
 * Trust Wallet Mobile — opens dapp in Trust in-app browser (BSC).
 * @see https://developer.trustwallet.com/developer/develop-for-trust/deeplinking
 */
export function getTrustWalletMobileDappUrl(pageUrl?: string): string {
  const href = pageUrl ?? (typeof window !== 'undefined' ? window.location.href : '')
  const params = new URLSearchParams({
    coin_id: TRUST_BSC_COIN_ID,
    url: href,
  })
  return `https://link.trustwallet.com/open_url?${params.toString()}`
}

function persistMobileWalletChoice(walletKey: WalletKey): void {
  setStoredWalletKey(walletKey)
  window.localStorage.setItem(connectorLocalStorageKey, ConnectorNames.Injected)
}

export function openMetaMaskMobileApp(pageUrl?: string): void {
  persistMobileWalletChoice(WalletKey.MetaMask)
  window.location.assign(getMetaMaskMobileDappUrl(pageUrl))
}

export function openTrustWalletMobileApp(pageUrl?: string): void {
  persistMobileWalletChoice(WalletKey.Trust)
  window.location.assign(getTrustWalletMobileDappUrl(pageUrl))
}

/** Open the chosen wallet’s mobile app (current page URL — works on any deployed host). */
export function openMobileWalletApp(walletKey: WalletKey, pageUrl?: string): void {
  if (walletKey === WalletKey.MetaMask) {
    openMetaMaskMobileApp(pageUrl)
    return
  }
  if (walletKey === WalletKey.Trust) {
    openTrustWalletMobileApp(pageUrl)
  }
}

export { isMobileBrowser }
