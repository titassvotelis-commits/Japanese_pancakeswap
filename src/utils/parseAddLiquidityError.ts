/**
 * Map add-liquidity / router reverts to clearer UI copy.
 */
export function parseAddLiquidityError(error: unknown): string {
  const message =
    (error as { error?: { message?: string }; reason?: string; message?: string })?.error?.message ||
    (error as { reason?: string })?.reason ||
    (error as { message?: string })?.message ||
    ''

  if (/user rejected|rejected the request/i.test(message)) {
    return 'Transaction was rejected in your wallet.'
  }
  if (/insufficient allowance/i.test(message)) {
    return 'Please approve both tokens for the router, then try again.'
  }
  if (/INSUFFICIENT_A_AMOUNT|INSUFFICIENT_B_AMOUNT/i.test(message)) {
    return (
      'Token amounts do not match the pool price ratio. Clear both fields, enter only the JNTo or USDT amount ' +
      '(the other side will auto-fill), then confirm. You can also raise slippage tolerance in settings.'
    )
  }
  if (/TRANSFER_FROM_FAILED|TRANSFER_FAILED|exceeds balance/i.test(message)) {
    return 'Insufficient token balance or approval. Approve both tokens for the router, then try again.'
  }
  if (/cannot estimate gas|UNPREDICTABLE_GAS_LIMIT/i.test(message)) {
    if (/INSUFFICIENT_A_AMOUNT|INSUFFICIENT_B_AMOUNT/i.test(message)) {
      return (
        'Token amounts do not match the pool price ratio. Enter one amount and let the other auto-fill, or increase slippage.'
      )
    }
    return (
      'Add liquidity simulation failed. Check that amounts match the pool ratio, both tokens are approved, ' +
      'and you have enough BNB for gas.'
    )
  }
  if (/execution reverted/i.test(message)) {
    return 'Add liquidity failed on-chain. Check token approvals, pool ratio, and BNB for gas.'
  }

  return 'Add liquidity failed. Check balances, approvals, and that amounts match the pool ratio.'
}
