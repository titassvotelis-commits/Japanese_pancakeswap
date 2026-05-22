import { AbstractConnector } from '@web3-react/abstract-connector'
import { UnsupportedChainIdError } from '@web3-react/core'
import { UserRejectedRequestError } from '@web3-react/injected-connector'

const PROJECT_ID = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID?.trim() || ''

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WcEthereumProvider = any

export function isWalletConnectConfigured(): boolean {
  return PROJECT_ID.length > 0
}

/** Loaded on demand so WalletConnect does not break the initial CRA bundle. */
async function loadEthereumProvider() {
  const mod = await import('@walletconnect/ethereum-provider')
  return mod.default
}

export class WalletConnectV2Connector extends AbstractConnector {
  public provider: WcEthereumProvider | null = null

  private readonly rpcUrl: string

  constructor({
    supportedChainIds,
    rpcUrl,
  }: {
    supportedChainIds: number[]
    rpcUrl: string
  }) {
    super({ supportedChainIds })
    this.rpcUrl = rpcUrl
  }

  private async initProvider(): Promise<WcEthereumProvider> {
    if (!isWalletConnectConfigured()) {
      throw new Error(
        'WalletConnect is not configured. Set REACT_APP_WALLETCONNECT_PROJECT_ID in .env.development (free at https://cloud.walletconnect.com).',
      )
    }

    const EthereumProvider = await loadEthereumProvider()
    const chainId = this.supportedChainIds?.[0] ?? parseInt(process.env.REACT_APP_CHAIN_ID, 10)

    const provider = await EthereumProvider.init({
      projectId: PROJECT_ID,
      chains: [chainId],
      optionalChains: [chainId],
      showQrModal: true,
      rpcMap: {
        [chainId]: this.rpcUrl,
      },
      metadata: {
        name: 'Optimus',
        description: 'Optimus DEX on BNB Smart Chain',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://optimuswap.io',
        icons: [
          typeof window !== 'undefined'
            ? `${window.location.origin}/images/metakey-logo-icon.png`
            : 'https://optimuswap.io/images/metakey-logo-icon.png',
        ],
      },
    })

    this.provider = provider
    return provider
  }

  public async activate(): Promise<{ provider: WcEthereumProvider; account: string }> {
    try {
      const provider = this.provider ?? (await this.initProvider())
      const existingAccounts = provider.accounts
      if (!existingAccounts?.length) {
        await provider.enable()
      }

      const account = provider.accounts?.[0]
      const chainId = Number(provider.chainId)

      if (!account) {
        throw new Error('No account returned from WalletConnect')
      }

      if (this.supportedChainIds?.length && !this.supportedChainIds.includes(chainId)) {
        throw new UnsupportedChainIdError(chainId, this.supportedChainIds)
      }

      this.emitUpdate({ provider, chainId, account })
      return { provider, account }
    } catch (error: unknown) {
      const code = (error as { code?: number })?.code
      if (code === 4001) {
        throw new UserRejectedRequestError()
      }
      throw error
    }
  }

  public async getProvider(): Promise<WcEthereumProvider | null> {
    return this.provider
  }

  public async getChainId(): Promise<number> {
    if (this.provider) {
      return Number(this.provider.chainId)
    }
    return this.supportedChainIds?.[0] ?? parseInt(process.env.REACT_APP_CHAIN_ID, 10)
  }

  public async getAccount(): Promise<null | string> {
    const provider = this.provider
    return provider?.accounts?.[0] ?? null
  }

  public async deactivate(): Promise<void> {
    await this.close()
  }

  public async close(): Promise<void> {
    if (this.provider) {
      await this.provider.disconnect()
      this.provider = null
    }
  }

  public async isAuthorized(): Promise<boolean> {
    return (this.provider?.accounts?.length ?? 0) > 0
  }
}
