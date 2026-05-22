export function parseSwapError(error: unknown): string {
  const err = error as {
    reason?: string
    message?: string
    data?: { message?: string }
    error?: { message?: string; data?: { message?: string } }
  }

  const nested =
    err?.reason ||
    err?.data?.message ||
    err?.error?.data?.message ||
    err?.error?.message ||
    err?.message

  if (!nested) {
    return 'Swap failed. Try increasing slippage or reducing trade size.'
  }

  if (
    nested.toLowerCase().includes('cannot estimate gas') ||
    nested.toLowerCase().includes('transaction was canceled') ||
    nested.toLowerCase().includes("couldn't be completed")
  ) {
    return 'Swap simulation failed. This route may use both PancakeSwap and MetakeySwap pools — refresh the page and try again, or increase slippage tolerance.'
  }

  if (/INSUFFICIENT_A_AMOUNT|INSUFFICIENT_B_AMOUNT/i.test(nested)) {
    return (
      'Amounts do not match the pool price. If you are adding liquidity, enter one token amount and let the other auto-fill.'
    )
  }

  if (/TRANSFER_FROM_FAILED|TRANSFER_FAILED/i.test(nested)) {
    return (
      'The router could not pull tokens from your wallet. For BNB swaps, use enough BNB to cover the trade plus gas. ' +
      'For token swaps, click Approve on the input token first. If you are buying a fixed amount (e.g. 1 JNTo), try entering the BNB amount instead or increase slippage.'
    )
  }

  if (/INSUFFICIENT_OUTPUT_AMOUNT|INSUFFICIENT_INPUT_AMOUNT|EXCESSIVE_INPUT_AMOUNT/i.test(nested)) {
    return 'Trade amount is too small or slippage is too low. Increase slippage tolerance or use a larger amount.'
  }

  return nested
}
