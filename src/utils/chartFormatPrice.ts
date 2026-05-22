export function formatChartPrice(price: number): string {
  if (!Number.isFinite(price)) {
    return '—'
  }
  if (price >= 1000) {
    return price.toLocaleString(undefined, { maximumFractionDigits: 2 })
  }
  if (price >= 1) {
    return price.toLocaleString(undefined, { maximumFractionDigits: 4 })
  }
  if (price >= 0.01) {
    return price.toLocaleString(undefined, { maximumFractionDigits: 6 })
  }
  return price.toLocaleString(undefined, { maximumFractionDigits: 8 })
}
