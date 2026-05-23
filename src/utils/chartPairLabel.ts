import { mainnetTokens } from 'config/constants/tokens'
import { isAddress } from './index'

/** Resolve swap currencyId (address or "BNB") to display symbol for chart header */
export function symbolFromCurrencyId(currencyId: string): string | null {
  if (!currencyId) {
    return null
  }
  if (currencyId.toUpperCase() === 'BNB') {
    return 'BNB'
  }
  if (isAddress(currencyId)) {
    const found = Object.values(mainnetTokens).find((t) => t.address.toLowerCase() === currencyId.toLowerCase())
    if (found) {
      return found.symbol === 'WBNB' ? 'BNB' : found.symbol ?? null
    }
    return null
  }
  return currencyId
}

export function getChartPairLabelFromIds(baseCurrencyId: string, quoteCurrencyId: string): string | null {
  const base = symbolFromCurrencyId(baseCurrencyId)
  const quote = symbolFromCurrencyId(quoteCurrencyId)
  if (!base || !quote) {
    return null
  }
  return `${base}/${quote}`
}
