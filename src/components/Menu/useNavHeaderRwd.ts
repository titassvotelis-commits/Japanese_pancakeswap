import { useMatchBreakpoints } from '@pancakeswap/uikit'

export type NavHeaderTier = 'mobile' | 'tablet' | 'desktop'

export type NavHeaderRwd = {
  tier: NavHeaderTier
  /** Icon-only search button */
  compactSearch: boolean
  /** Icon + label, no slash (tablet) */
  slimSearch: boolean
  /** Fox + chevron only */
  compactWallet: boolean
  showWalletBalance: boolean
  showSearchSlash: boolean
  showLanguageInNav: boolean
  useTouchWalletMenu: boolean
  clusterGap: number
  /** Hide inline Trade/Earn/… and show BottomNav (uikit only does this ≤576px). */
  showBottomNav: boolean
  /** ≤1080px: compact header bar (logo + right cluster only). */
  compactHeader: boolean
}

/**
 * Below uikit `xxl` (1081px) the logo + nav links + full search cluster overlap;
 * use compact header (mobile-style right cluster) and bottom nav for main links.
 */
export function useNavHeaderRwd(): NavHeaderRwd {
  const { isMobile, isMd, isLg, isXl, isXxl } = useMatchBreakpoints()

  const isCompactNav = !isXxl
  const isTablet = isMd && !isMobile && isXxl
  const useMobileLayout = isCompactNav || isMobile

  const tier: NavHeaderTier = useMobileLayout
    ? 'mobile'
    : isLg || isXl
      ? 'desktop'
      : isTablet
        ? 'tablet'
        : 'desktop'

  return {
    tier,
    compactSearch: useMobileLayout,
    slimSearch: false,
    compactWallet: useMobileLayout,
    showWalletBalance: true,
    showSearchSlash: !useMobileLayout,
    showLanguageInNav: !useMobileLayout,
    useTouchWalletMenu: useMobileLayout || isTablet,
    clusterGap: useMobileLayout ? 10 : 12,
    showBottomNav: isCompactNav,
    compactHeader: useMobileLayout,
  }
}
