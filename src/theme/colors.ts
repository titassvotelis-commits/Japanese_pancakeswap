/** MetaKey Swap brand palette (replaces uikit default blue #0075EB). */
export const BRAND = {
  main: '#5CB1DD',
  bright: '#8DCFE8',
  dark: '#3E9BC4',
  deepest: '#1E4D63',
} as const

/** Trade / liquidity page hero background (reference: top-left → bottom-right). */
export const TRADE_PAGE_BG = {
  dark: `
    radial-gradient(ellipse 95% 70% at 6% 8%, rgba(92, 177, 221, 0.14) 0%, transparent 58%),
    radial-gradient(ellipse 90% 65% at 94% 92%, rgba(61, 43, 84, 0.2) 0%, transparent 58%),
    linear-gradient(152deg, #323D5B 0%, #34324f 22%, #362f51 48%, #392d53 72%, #3D2B54 100%)
  `,
  light: `
    radial-gradient(ellipse 85% 55% at 8% 4%, rgba(92, 177, 221, 0.1) 0%, transparent 52%),
    linear-gradient(152deg, #EEF7FC 0%, #F3F0F8 42%, #E8F4FA 100%)
  `,
} as const
