import { CurrencyAmount, ETHER, JSBI } from '@pancakeswap/sdk'
import { MIN_BNB } from '../config/constants'

/**
 * When native BNB balance is at or below {@link MIN_BNB} (0.01 BNB), we still need "MAX" to work.
 * On BSC, gas is cheap; reserve this instead of the full 0.01 BNB floor.
 */
const MIN_BNB_FALLBACK_GAS_RESERVE = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(15)) // 0.001 BNB
/** For dust-sized BNB balances, reserve only 0.0001 BNB so MAX is still usable. */
const MIN_BNB_LAST_RESERVE = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(14)) // 0.0001 BNB

/**
 * Given some token amount, return the max that can be spent of it
 * @param currencyAmount to return max of
 */
export function maxAmountSpend(currencyAmount?: CurrencyAmount): CurrencyAmount | undefined {
  if (!currencyAmount) return undefined
  if (currencyAmount.currency === ETHER) {
    if (JSBI.greaterThan(currencyAmount.raw, MIN_BNB)) {
      return CurrencyAmount.ether(JSBI.subtract(currencyAmount.raw, MIN_BNB))
    }
    if (JSBI.greaterThan(currencyAmount.raw, MIN_BNB_FALLBACK_GAS_RESERVE)) {
      return CurrencyAmount.ether(JSBI.subtract(currencyAmount.raw, MIN_BNB_FALLBACK_GAS_RESERVE))
    }
    if (JSBI.greaterThan(currencyAmount.raw, MIN_BNB_LAST_RESERVE)) {
      return CurrencyAmount.ether(JSBI.subtract(currencyAmount.raw, MIN_BNB_LAST_RESERVE))
    }
    return CurrencyAmount.ether(JSBI.BigInt(0))
  }
  return currencyAmount
}

export default maxAmountSpend
