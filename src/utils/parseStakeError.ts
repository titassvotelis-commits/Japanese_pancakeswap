/**
 * Map common farm stake / harvest reverts to clearer UI copy.
 */
export function parseStakeError(error: unknown): string {
  const message =
    (error as { error?: { message?: string }; reason?: string; message?: string })?.error?.message ||
    (error as { reason?: string })?.reason ||
    (error as { message?: string })?.message ||
    ''

  if (/ds-math-sub-underflow/i.test(message)) {
    return 'Insufficient LP balance for this pool. Add the correct LP tokens for this farm, or use a wallet that holds them.'
  }
  if (/transfer amount exceeds balance|exceeds balance/i.test(message)) {
    return 'Insufficient token balance. Check that you hold the LP (or staking token) required for this farm.'
  }
  if (/insufficient allowance/i.test(message)) {
    return 'Please approve the farm contract to spend your tokens, then try again.'
  }
  if (/user rejected|rejected the request/i.test(message)) {
    return 'Transaction was rejected in your wallet.'
  }

  return 'Please try again. Confirm the transaction and make sure you are paying enough gas!'
}
