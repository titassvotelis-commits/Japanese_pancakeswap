/// <reference types="react-scripts" />

interface Window {
  ethereum?: {
    isMetaMask?: boolean
    isTrust?: boolean
    isPhantom?: boolean
    providers?: Window['ethereum'][]
    request?: (...args: any[]) => Promise<any>
    on?: (event: string, handler: (...args: any[]) => void) => void
    removeListener?: (event: string, handler: (...args: any[]) => void) => void
  }
  trustwallet?: Window['ethereum'] & { isTrust?: boolean }
  phantom?: {
    ethereum?: Window['ethereum']
  }
  BinanceChain?: {
    bnbSign?: (address: string, message: string) => Promise<{ publicKey: string; signature: string }>
    request?: (args: { method: string; params?: unknown }) => Promise<unknown>
  }
}

type SerializedBigNumber = string
