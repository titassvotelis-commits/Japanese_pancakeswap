import { Fraction, Price, JSBI } from '@pancakeswap/sdk'

const ZERO = JSBI.BigInt(0)

/** Avoid SDK Fraction/Price throws (e.g. division by zero) on empty or extreme pool ratios. */
export function safePriceSignificant(price?: Price | Fraction | null, significantDigits = 6): string | undefined {
  if (!price) {
    return undefined
  }
  try {
    if (JSBI.equal(price.denominator, ZERO) || JSBI.equal(price.numerator, ZERO)) {
      return undefined
    }
    return price.toSignificant(significantDigits)
  } catch {
    return undefined
  }
}

export function safePriceInvert(price?: Price | Fraction | null): Price | Fraction | undefined {
  if (!price) {
    return undefined
  }
  try {
    if (JSBI.equal(price.numerator, ZERO)) {
      return undefined
    }
    return price.invert()
  } catch {
    return undefined
  }
}

export function safeInvertedPriceSignificant(price?: Price | Fraction | null, significantDigits = 6): string | undefined {
  const inverted = safePriceInvert(price)
  return inverted ? safePriceSignificant(inverted, significantDigits) : undefined
}
