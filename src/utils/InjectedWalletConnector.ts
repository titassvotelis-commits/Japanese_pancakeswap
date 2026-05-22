import { AbstractConnector } from '@web3-react/abstract-connector'
import { UnsupportedChainIdError } from '@web3-react/core'
import { NoEthereumProviderError, UserRejectedRequestError } from '@web3-react/injected-connector'
import { requestWalletAccounts } from './metamaskAccount'
import {
  Eip1193Provider,
  getProviderForWallet,
  getStoredWalletKey,
  WalletKey,
} from './walletProviders'

function parseChainId(chainId: string): number {
  return chainId.startsWith('0x') ? parseInt(chainId, 16) : parseInt(chainId, 10)
}

/**
 * Connects via the wallet chosen in the connect modal (MetaMask, Trust, Phantom).
 * Each uses its own injected provider instead of the default window.ethereum aggregator.
 */
export class InjectedWalletConnector extends AbstractConnector {
  private boundProvider: Eip1193Provider | null = null

  constructor({ supportedChainIds }: { supportedChainIds: number[] }) {
    super({ supportedChainIds })
    this.handleChainChanged = this.handleChainChanged.bind(this)
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this)
  }

  private resolveWalletKey(): WalletKey {
    return getStoredWalletKey() ?? WalletKey.MetaMask
  }

  private resolveProvider(): Eip1193Provider {
    const walletKey = this.resolveWalletKey()
    const provider = getProviderForWallet(walletKey)
    if (!provider) {
      throw new NoEthereumProviderError()
    }
    return provider
  }

  private attachListeners(provider: Eip1193Provider): void {
    this.boundProvider = provider
    if (typeof provider.on === 'function') {
      provider.on('chainChanged', this.handleChainChanged)
      provider.on('accountsChanged', this.handleAccountsChanged)
    }
    if (provider.isMetaMask) {
      ;(provider as Eip1193Provider & { autoRefreshOnNetworkChange?: boolean }).autoRefreshOnNetworkChange =
        false
    }
  }

  private detachListeners(): void {
    const provider = this.boundProvider
    if (provider && typeof provider.removeListener === 'function') {
      provider.removeListener('chainChanged', this.handleChainChanged)
      provider.removeListener('accountsChanged', this.handleAccountsChanged)
    }
    this.boundProvider = null
  }

  private handleChainChanged(chainId: unknown): void {
    this.emitUpdate({
      chainId: parseChainId(String(chainId)),
      provider: this.boundProvider ?? undefined,
    })
  }

  private handleAccountsChanged(accounts: unknown): void {
    const list = accounts as string[]
    if (!list.length) {
      this.emitDeactivate()
      return
    }
    this.emitUpdate({
      account: list[0],
      provider: this.boundProvider ?? undefined,
    })
  }

  public async activate(): Promise<{ provider: Eip1193Provider; account: string }> {
    const walletKey = this.resolveWalletKey()
    const provider = this.resolveProvider()
    this.detachListeners()
    this.attachListeners(provider)

    try {
      const accounts = await requestWalletAccounts(provider, walletKey)
      const chainIdHex = (await provider.request?.({ method: 'eth_chainId' })) as string
      const account = accounts[0]
      const chainId = parseChainId(chainIdHex)

      if (this.supportedChainIds?.length && !this.supportedChainIds.includes(chainId)) {
        throw new UnsupportedChainIdError(chainId, this.supportedChainIds)
      }

      this.emitUpdate({ provider, chainId, account })
      return { provider, account }
    } catch (error: unknown) {
      this.detachListeners()
      const code = (error as { code?: number })?.code
      if (code === 4001) {
        throw new UserRejectedRequestError()
      }
      throw error
    }
  }

  public async getProvider(): Promise<Eip1193Provider | null> {
    try {
      return this.resolveProvider()
    } catch {
      return null
    }
  }

  public async getChainId(): Promise<number> {
    const provider = this.resolveProvider()
    const chainIdHex = (await provider.request?.({ method: 'eth_chainId' })) as string
    return parseChainId(chainIdHex)
  }

  public async getAccount(): Promise<null | string> {
    const provider = this.resolveProvider()
    const accounts = (await provider.request?.({ method: 'eth_accounts' })) as string[]
    return accounts[0] ?? null
  }

  public async deactivate(): Promise<void> {
    this.detachListeners()
  }

  public async isAuthorized(): Promise<boolean> {
    try {
      const provider = getProviderForWallet(this.resolveWalletKey())
      if (!provider) {
        return false
      }
      const accounts = (await provider.request?.({ method: 'eth_accounts' })) as string[]
      return accounts.length > 0
    } catch {
      return false
    }
  }
}
