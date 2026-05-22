import { BscConnector } from '@binance-chain/bsc-connector'
import { ConnectorNames } from '@pancakeswap/uikit'
import { ethers } from 'ethers'
import { InjectedWalletConnector } from './InjectedWalletConnector'
import { WalletConnectV2Connector } from './WalletConnectV2Connector'
import getNodeUrl from './getRpcUrl'

const POLLING_INTERVAL = 12000
const rpcUrl = getNodeUrl()
const chainId = parseInt(process.env.REACT_APP_CHAIN_ID, 10)

const injected = new InjectedWalletConnector({ supportedChainIds: [chainId] })

/** WalletConnect v2 (v1 bridge is shut down). Requires REACT_APP_WALLETCONNECT_PROJECT_ID. */
const walletconnect = new WalletConnectV2Connector({
  supportedChainIds: [chainId],
  rpcUrl,
})

const bscConnector = new BscConnector({ supportedChainIds: [chainId] })

export const connectorsByName: { [connectorName in ConnectorNames]: any } = {
  [ConnectorNames.Injected]: injected,
  [ConnectorNames.WalletConnect]: walletconnect,
  [ConnectorNames.BSC]: bscConnector,
}

export const getLibrary = (provider): ethers.providers.Web3Provider => {
  const library = new ethers.providers.Web3Provider(provider)
  library.pollingInterval = POLLING_INTERVAL
  return library
}

/**
 * BSC Wallet requires a different sign method
 * @see https://docs.binance.org/smart-chain/wallet/wallet_api.html#binancechainbnbsignaddress-string-message-string-promisepublickey-string-signature-string
 */
export const signMessage = async (provider: any, account: string, message: string): Promise<string> => {
  if (window.BinanceChain) {
    const { signature } = await window.BinanceChain.bnbSign(account, message)
    return signature
  }

  /** WalletConnect v2 — standard personal_sign via ethers */
  if (provider?.provider?.wc) {
    const wcMessage = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message))
    const signature = await provider.provider.wc.signPersonalMessage([wcMessage, account])
    return signature
  }

  return provider.getSigner(account).signMessage(message)
}
