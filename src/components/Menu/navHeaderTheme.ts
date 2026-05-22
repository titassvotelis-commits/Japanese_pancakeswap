/** Shared chrome background (header + footer). */
export const SITE_CHROME_BG = '#27262c'

/** Matches @pancakeswap/uikit breakpointMap. */
export const NAV_BREAKPOINTS = {
  sm: 576,
  md: 852,
  lg: 968,
  /** Full horizontal nav + wide search (uikit `xl`; below this use compact header). */
  headerFull: 1080,
  /** Swap chart + form side-by-side (avoids chart column min-width overflow). */
  swapSideBySide: 1200,
} as const

/** Fixed top nav bar height (uikit MENU_HEIGHT). */
export const NAV_HEADER_HEIGHT = 56

/** Body offset below fixed nav (MENU_HEIGHT + 1px uikit margin). */
export const NAV_BODY_OFFSET = NAV_HEADER_HEIGHT + 1

/** Fixed bottom nav bar height (compact / mobile). */
export const NAV_BOTTOM_BAR_HEIGHT = 56

/** Reference-style header pills (dark DeFi nav). */
export const NAV_HEADER = {
  pillHeight: 40,
  pillRadius: 999,
  gap: 12,
  searchMinWidth: 220,
  searchSlimMinWidth: 128,
  mobilePillSize: 40,
  searchBgDark: 'rgba(36, 34, 44, 0.88)',
  walletBgDark: 'rgba(58, 54, 72, 0.92)',
  borderDark: 'rgba(255, 255, 255, 0.07)',
  slashBgDark: 'rgba(88, 80, 108, 0.55)',
  settingsIconDark: '#B8A8D4',
  searchBgLight: '#EEF4F8',
  walletBgLight: '#F0EEF4',
  /** Matches footer "Buy JNTo" CTA */
  ctaGradient: 'linear-gradient(90deg, #ffb237 0%, #ffcd38 50%, #ffe56a 100%)',
  ctaText: '#ffffff',
  ctaShadow: '0 2px 0 rgba(0, 0, 0, 0.12)',
} as const
