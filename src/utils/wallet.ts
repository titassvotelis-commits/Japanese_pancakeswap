// Set of helper functions to facilitate wallet setup

import { getAddress } from '@ethersproject/address'
import { BASE_BSC_SCAN_URL, BASE_URL } from 'config'
import { nodes } from './getRpcUrl'
import { getActiveWalletProvider, Eip1193Provider } from './walletProviders'

const chainId = parseInt(process.env.REACT_APP_CHAIN_ID, 10)
const chainIdHex = `0x${chainId.toString(16)}`

const bscNetworkParams = {
  chainId: chainIdHex,
  chainName: 'Binance Smart Chain Mainnet',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'bnb',
    decimals: 18,
  },
  rpcUrls: nodes,
  blockExplorerUrls: [`${BASE_BSC_SCAN_URL}/`],
}

/**
 * Prompt the user to switch to BSC on MetaMask, or add BSC if the network is missing.
 * @returns {boolean} true if the setup succeeded, false otherwise
 */
export const setupNetwork = async (providerOverride?: Eip1193Provider | null) => {
  const provider = providerOverride ?? window.ethereum
  if (!provider?.request) {
    console.error("Can't setup the BSC network because no injected wallet was found")
    return false
  }

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    })
    return true
  } catch (switchError: unknown) {
    const code = (switchError as { code?: number })?.code
    // 4902 = chain not added to MetaMask yet
    if (code !== 4902) {
      console.error('Failed to switch to BSC in MetaMask:', switchError)
      return false
    }
  }

  try {
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [bscNetworkParams],
    })
    return true
  } catch (error) {
    console.error('Failed to add the BSC network in MetaMask:', error)
    return false
  }
}

function getTokenLogoOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return BASE_URL
}

type WatchAssetOptions = {
  address: string
  symbol: string
  decimals: number
  image?: string
}

async function requestWatchAsset(
  provider: NonNullable<typeof window.ethereum>,
  options: WatchAssetOptions,
): Promise<boolean> {
  const objectParams = { type: 'ERC20', options }
  const arrayParams = ['ERC20', options]

  const attempts: { method: string; params?: unknown }[] = [
    { method: 'wallet_watchAsset', params: objectParams },
    { method: 'wallet_watchAsset', params: arrayParams },
  ]

  if (options.image) {
    const { image, ...withoutImage } = options
    attempts.push(
      { method: 'wallet_watchAsset', params: { type: 'ERC20', options: withoutImage } },
      { method: 'wallet_watchAsset', params: ['ERC20', withoutImage] },
    )
  }

  const outcomes = await Promise.all(
    attempts.map(async (request) => {
      try {
        return await provider.request(request)
      } catch {
        return false
      }
    }),
  )

  return outcomes.some(Boolean)
}

/**
 * Prompt the user to add a custom token to MetaMask (MetaMask extension only).
 */
export const registerToken = async (
  tokenAddress: string,
  tokenSymbol: string,
  tokenDecimals: number,
): Promise<boolean> => {
  const provider = getActiveWalletProvider() ?? window.ethereum
  if (!provider?.request) {
    console.warn('wallet_watchAsset: injected wallet not found')
    return false
  }

  let address: string
  try {
    address = getAddress(tokenAddress)
  } catch {
    console.warn('wallet_watchAsset: invalid token address', tokenAddress)
    return false
  }

  const symbol = tokenSymbol.slice(0, 11)
  const origin = getTokenLogoOrigin()
  const image =
    symbol === 'JNTo' || symbol === 'MK'
      ? `${origin}/images/metakey-logo-icon.png`
      : `${origin}/images/tokens/${address}.svg`

  try {
    return await requestWatchAsset(provider, {
      address,
      symbol,
      decimals: tokenDecimals,
      image,
    })
  } catch (error) {
    console.warn('wallet_watchAsset failed:', error)
    return false
  }
}
