export const WALLET_LOCAL_STORAGE_KEY = 'wallet'

/** EIP-6963 rdns identifiers */
const RDNS_METAMASK = 'io.metamask'
const RDNS_TRUST = 'com.trustwallet.app'

export enum WalletKey {
  MetaMask = 'metamask',
  Trust = 'trust',
  Phantom = 'phantom',
}

import { isMobileBrowser } from './isMobileBrowser'

export type Eip1193Provider = {
  isMetaMask?: boolean
  isTrust?: boolean
  isPhantom?: boolean
  providers?: Eip1193Provider[]
  providerInfo?: { name?: string; rdns?: string }
  request?: (args: { method: string; params?: unknown }) => Promise<unknown>
  on?: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
}

const eip6963ByRdns = new Map<string, Eip1193Provider>()
let eip6963ListenerInstalled = false

function onEip6963Announce(event: Event): void {
  const detail = (event as CustomEvent<{ info?: { rdns?: string }; provider?: Eip1193Provider }>).detail
  const rdns = detail?.info?.rdns
  const provider = detail?.provider
  if (rdns && provider?.request) {
    eip6963ByRdns.set(rdns, provider)
  }
}

/** Discover injected wallets via EIP-6963 (MetaMask, Trust, etc.). */
export function installEip6963Discovery(): void {
  if (eip6963ListenerInstalled || typeof window === 'undefined') {
    return
  }
  eip6963ListenerInstalled = true
  window.addEventListener('eip6963:announceProvider', onEip6963Announce as EventListener)
  window.dispatchEvent(new Event('eip6963:requestProvider'))
}

function getEip6963Provider(rdns: string): Eip1193Provider | undefined {
  installEip6963Discovery()
  return eip6963ByRdns.get(rdns)
}

function collectProviders(eth: Eip1193Provider): Eip1193Provider[] {
  const seen = new Set<Eip1193Provider>()
  const list: Eip1193Provider[] = []

  const visit = (provider: Eip1193Provider | undefined) => {
    if (!provider || seen.has(provider)) {
      return
    }
    seen.add(provider)
    list.push(provider)
    if (Array.isArray(provider.providers)) {
      provider.providers.forEach(visit)
    }
  }

  if (Array.isArray(eth.providers)) {
    eth.providers.forEach(visit)
  }
  visit(eth)

  return list
}

function matchesMetaMask(provider: Eip1193Provider): boolean {
  if (provider.isPhantom || provider.isTrust) {
    return false
  }
  if (provider.isMetaMask) {
    return true
  }
  const rdns = String(provider.providerInfo?.rdns || '').toLowerCase()
  const name = String(provider.providerInfo?.name || '').toLowerCase()
  return rdns === RDNS_METAMASK || rdns.includes('metamask') || name.includes('metamask')
}

function matchesTrust(provider: Eip1193Provider): boolean {
  if (provider.isMetaMask || provider.isPhantom) {
    return false
  }
  if (provider.isTrust) {
    return true
  }
  const rdns = String(provider.providerInfo?.rdns || '').toLowerCase()
  const name = String(provider.providerInfo?.name || '').toLowerCase()
  return rdns === RDNS_TRUST || rdns.includes('trust') || name.includes('trust')
}

function matchesPhantom(provider: Eip1193Provider): boolean {
  if (provider.isPhantom) {
    return true
  }
  const rdns = String(provider.providerInfo?.rdns || '').toLowerCase()
  const name = String(provider.providerInfo?.name || '').toLowerCase()
  return rdns.includes('phantom') || name.includes('phantom')
}

/** Maps uikit / legacy modal titles to WalletKey. */
export function normalizeWalletKey(stored: string | null): WalletKey | null {
  if (!stored) {
    return null
  }
  const value = stored.toLowerCase().trim()
  if (value === WalletKey.MetaMask || value.includes('metamask')) {
    return WalletKey.MetaMask
  }
  if (value === WalletKey.Trust || value.includes('trust')) {
    return WalletKey.Trust
  }
  if (value === WalletKey.Phantom || value.includes('phantom')) {
    return WalletKey.Phantom
  }
  return null
}

export function getStoredWalletKey(): WalletKey | null {
  if (typeof window === 'undefined') {
    return null
  }
  return normalizeWalletKey(window.localStorage.getItem(WALLET_LOCAL_STORAGE_KEY))
}

export function setStoredWalletKey(key: WalletKey): void {
  window.localStorage.setItem(WALLET_LOCAL_STORAGE_KEY, key)
}

export function getTrustWalletProvider(): Eip1193Provider | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  installEip6963Discovery()

  const win = window as Window & {
    ethereum?: Eip1193Provider
    trustwallet?: Eip1193Provider
  }

  if (win.trustwallet?.request) {
    return win.trustwallet
  }

  const from6963 = getEip6963Provider(RDNS_TRUST)
  if (from6963) {
    return from6963
  }

  const eth = win.ethereum
  if (eth) {
    const fromList = collectProviders(eth).find(matchesTrust)
    if (fromList) {
      return fromList
    }
    if (eth.isTrust && !eth.isMetaMask) {
      return eth
    }
  }

  return undefined
}

export function getMetaMaskWalletProvider(): Eip1193Provider | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  installEip6963Discovery()

  const from6963 = getEip6963Provider(RDNS_METAMASK)
  if (from6963) {
    return from6963
  }

  const eth = (window as Window & { ethereum?: Eip1193Provider }).ethereum
  if (!eth) {
    return undefined
  }

  const fromList = collectProviders(eth).find(matchesMetaMask)
  if (fromList) {
    return fromList
  }

  if (eth.isMetaMask && !eth.isPhantom && !eth.isTrust) {
    return eth
  }

  return undefined
}

export function getProviderForWallet(key: WalletKey): Eip1193Provider | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  const win = window as Window & {
    ethereum?: Eip1193Provider
    phantom?: { ethereum?: Eip1193Provider }
  }

  switch (key) {
    case WalletKey.MetaMask:
      return getMetaMaskWalletProvider()
    case WalletKey.Trust:
      return getTrustWalletProvider()
    case WalletKey.Phantom:
      if (win.phantom?.ethereum?.request) {
        return win.phantom.ethereum
      }
      if (win.ethereum) {
        return collectProviders(win.ethereum).find(matchesPhantom)
      }
      return undefined
    default:
      return undefined
  }
}

export function getActiveWalletProvider(): Eip1193Provider | undefined {
  const key = getStoredWalletKey()
  if (!key) {
    return undefined
  }
  return getProviderForWallet(key)
}

/** Injected provider present, or mobile browser (use wallet app deep link). */
export function isMetaMaskConnectable(): boolean {
  return !!getMetaMaskWalletProvider() || isMobileBrowser()
}

export function isTrustConnectable(): boolean {
  return !!getTrustWalletProvider() || isMobileBrowser()
}

export function shouldUseMetaMaskMobileDeepLink(): boolean {
  return isMobileBrowser() && !getMetaMaskWalletProvider()
}

export function shouldUseTrustMobileDeepLink(): boolean {
  return isMobileBrowser() && !getTrustWalletProvider()
}

export function shouldUseMobileWalletDeepLink(key: WalletKey): boolean {
  if (key === WalletKey.MetaMask) {
    return shouldUseMetaMaskMobileDeepLink()
  }
  if (key === WalletKey.Trust) {
    return shouldUseTrustMobileDeepLink()
  }
  return false
}

export function isWalletInstalled(key: WalletKey): boolean {
  if (key === WalletKey.MetaMask) {
    return isMetaMaskConnectable()
  }
  if (key === WalletKey.Trust) {
    return isTrustConnectable()
  }
  return !!getProviderForWallet(key)
}

export function isBinanceChainInstalled(): boolean {
  return typeof window !== 'undefined' && !!window.BinanceChain
}
