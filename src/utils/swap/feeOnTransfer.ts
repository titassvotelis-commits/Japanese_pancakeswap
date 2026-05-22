import { Currency, ETHER, Token, Trade } from '@pancakeswap/sdk'
import SwapWarningTokens from 'config/constants/swapWarningTokens'

/** Tokens that need SupportingFeeOnTransfer router methods (JNTo is plain BEP20 — not listed). */
const FEE_ON_TRANSFER_ADDRESSES = new Set(
  [...Object.values(SwapWarningTokens).map((token: Token) => token.address)].map((address) =>
    address.toLowerCase(),
  ),
)

export function currencyIsFeeOnTransfer(currency?: Currency): boolean {
  if (!currency || currency === ETHER || !(currency instanceof Token)) {
    return false
  }
  return FEE_ON_TRANSFER_ADDRESSES.has(currency.address.toLowerCase())
}

export function tradeRequiresFeeOnTransfer(trade: Trade): boolean {
  return trade.route.path.some((token) => currencyIsFeeOnTransfer(token))
}
