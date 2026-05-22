import { UserRejectedRequestError } from '@web3-react/injected-connector'
import type { Eip1193Provider } from './walletProviders'
import { getActiveWalletProvider, getStoredWalletKey, WalletKey } from './walletProviders'

async function requestPermissions(provider: Eip1193Provider): Promise<void> {
  await provider.request?.({
    method: 'wallet_requestPermissions',
    params: [{ eth_accounts: {} }],
  })
}

/**
 * Opens the wallet's native connect / unlock UI (MetaMask account picker, Trust password, etc.).
 */
export async function requestWalletAccounts(
  provider: Eip1193Provider,
  walletKey: WalletKey,
): Promise<string[]> {
  if (!provider.request) {
    throw new Error('No injected wallet found')
  }

  if (walletKey === WalletKey.MetaMask || walletKey === WalletKey.Trust) {
    try {
      await requestPermissions(provider)
    } catch (error: unknown) {
      const code = (error as { code?: number })?.code
      if (code === 4001) {
        throw new UserRejectedRequestError()
      }
      // Unsupported on older builds — eth_requestAccounts below still prompts unlock/connect
    }
  }

  try {
    const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as unknown as string[]
    return accounts
  } catch (error: unknown) {
    const code = (error as { code?: number })?.code
    if (code === 4001) {
      throw new UserRejectedRequestError()
    }
    throw error
  }
}

/**
 * Opens the active injected wallet account picker / unlock screen.
 */
export async function requestAccountPicker(providerOverride?: Eip1193Provider): Promise<string | null> {
  const walletKey = getStoredWalletKey() ?? WalletKey.MetaMask
  const provider = providerOverride ?? getActiveWalletProvider()
  if (!provider?.request) {
    throw new Error('No injected wallet found')
  }

  const accounts = await requestWalletAccounts(provider, walletKey)
  return accounts[0] ?? null
}

/** @deprecated Use requestAccountPicker */
export const requestMetaMaskAccountPicker = requestAccountPicker
