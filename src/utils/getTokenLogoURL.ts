const TRUST_WALLET_CDN = 'https://assets.trustwalletapp.com/blockchains/smartchain/assets'

/** Prefer bundled token art (e.g. modern USDT mark); fall back to Trust Wallet CDN. */
const getTokenLogoSrcs = (address: string): string[] => [
  `/images/tokens/${address}.svg`,
  `${TRUST_WALLET_CDN}/${address}/logo.png`,
]

export default getTokenLogoSrcs
