import { Percent, Router, SwapParameters, Trade, TradeType } from '@pancakeswap/sdk'
import { tradeRequiresFeeOnTransfer } from './feeOnTransfer'

type SwapVariantOptions = {
  allowedSlippage: Percent
  recipient: string
  deadline: number
}

/** Order swap router methods — fee-on-transfer first when the path includes taxed tokens (e.g. JNTo). */
export function getOrderedSwapCallParameters(trade: Trade, options: SwapVariantOptions): SwapParameters[] {
  const standard = Router.swapCallParameters(trade, {
    feeOnTransfer: false,
    allowedSlippage: options.allowedSlippage,
    recipient: options.recipient,
    deadline: options.deadline,
  })

  if (trade.tradeType !== TradeType.EXACT_INPUT) {
    return [standard]
  }

  const withFeeOnTransfer = Router.swapCallParameters(trade, {
    feeOnTransfer: true,
    allowedSlippage: options.allowedSlippage,
    recipient: options.recipient,
    deadline: options.deadline,
  })

  return tradeRequiresFeeOnTransfer(trade) ? [withFeeOnTransfer, standard] : [standard, withFeeOnTransfer]
}
