import tokens from 'config/constants/tokens'
import { isAddress } from './index'

/** Resolve swap currencyId (address or "BNB") to display symbol for chart header */
export function symbolFromCurrencyId(currencyId: string): string {
  if (!currencyId) {
    return ''
  }
  if (currencyId.toUpperCase() === 'BNB') {
    return 'BNB'
  }
  if (isAddress(currencyId)) {
    const found = Object.values(tokens).find((t) => t.address.toLowerCase() === currencyId.toLowerCase())
    if (found) {
      return found.symbol === 'WBNB' ? 'BNB' : found.symbol ?? 'TOKEN'
    }
  }
  return currencyId.slice(0, 6)
}

export function getChartPairLabelFromIds(baseCurrencyId: string, quoteCurrencyId: string): string {
  const base = symbolFromCurrencyId(baseCurrencyId)
  const quote = symbolFromCurrencyId(quoteCurrencyId)
  if (!base || !quote) {
    return ''
  }
  return `${base}/${quote}`
}
