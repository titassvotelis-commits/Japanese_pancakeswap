import { dark as uikitDark, light as uikitLight } from '@pancakeswap/uikit'
import { BRAND, TRADE_PAGE_BG } from './colors'

type ThemeColors = typeof uikitLight.colors

const brandColorOverrides = {
  primary: BRAND.main,
  primaryBright: BRAND.bright,
  primaryDark: BRAND.dark,
  secondary: BRAND.main,
}

const lightGradients = {
  ...uikitLight.colors.gradients,
  blue: `linear-gradient(180deg, ${BRAND.bright} 0%, ${BRAND.main} 100%)`,
  bubblegum: 'linear-gradient(139.73deg, #E8F6FC 0%, #EDF5FA 100%)',
  cardHeader: 'linear-gradient(111.68deg, #E8F4FA 0%, #D4EBF5 100%)',
}

const darkGradients = {
  ...uikitDark.colors.gradients,
  blue: `linear-gradient(180deg, ${BRAND.dark} 0%, #2A6F8F 100%)`,
  bubblegum: TRADE_PAGE_BG.dark,
}

export const light = {
  ...uikitLight,
  colors: {
    ...uikitLight.colors,
    ...brandColorOverrides,
    textSubtle: BRAND.main,
    input: '#E8F4FA',
    inputSecondary: '#D4EBF5',
    gradients: lightGradients,
  } as ThemeColors,
}

/** Uikit dark theme ships backgroundAlt2 as light gray; use a dark inset surface instead. */
export const dark = {
  ...uikitDark,
  colors: {
    ...uikitDark.colors,
    ...brandColorOverrides,
    backgroundAlt2: uikitDark.colors.tertiary,
    gradients: darkGradients,
  } as ThemeColors,
}

export { BRAND } from './colors'
