type EthereumProvider = {
  isMetaMask?: boolean
  providers?: EthereumProvider[]
}

function providerIsMetaMask(p: unknown): boolean {
  const provider = p as EthereumProvider | undefined
  if (!provider) {
    return false
  }
  if (provider.isMetaMask) {
    return true
  }
  if (Array.isArray(provider.providers)) {
    return provider.providers.some((child) => child.isMetaMask)
  }
  return false
}

/** True when the active or injected provider is MetaMask (incl. multi-wallet browsers). */
export function isMetaMaskProvider(activeProvider?: unknown): boolean {
  if (providerIsMetaMask(activeProvider)) {
    return true
  }

  if (typeof window === 'undefined') {
    return false
  }

  return providerIsMetaMask(window.ethereum)
}
