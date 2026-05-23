import tokens from 'config/constants/tokens'
import { isAddress } from 'utils'

export type PromoArtTheme = 'jnto-hero' | 'jnto-swap' | 'jnto-earn'

const jntoAddress = isAddress(tokens.jnto.address) || tokens.jnto.address

/** Query-string swap routes (same pattern as Farms page header). */
export const JNTO_SWAP_GET = `/swap?outputCurrency=${jntoAddress}`
export const JNTO_SWAP_TRADE = `/swap?inputCurrency=BNB&outputCurrency=${jntoAddress}`
export const JNTO_STAKE = '/farms'

export type PromoAdSlide = {
  id: string
  titleKey: string
  subtitleKey?: string
  badgeKey?: string
  ctaLabelKey: string
  ctaHref: string
  ctaExternal?: boolean
  artTheme: PromoArtTheme
}

export const PROMO_AD_SLIDES: PromoAdSlide[] = [
  {
    id: 'jnto-intro',
    badgeKey: 'Native token',
    titleKey: 'JNTo powers Optimus.',
    subtitleKey: 'JNToken — the core asset behind swaps, farms, and rewards on Optimus Swap.',
    ctaLabelKey: 'Get JNTo',
    ctaHref: JNTO_SWAP_GET,
    artTheme: 'jnto-hero',
  },
  {
    id: 'jnto-trade',
    badgeKey: 'Trade',
    titleKey: 'Swap into JNTo instantly.',
    subtitleKey: 'Pair BNB or stablecoins with JNTo — deep routes, minimal friction.',
    ctaLabelKey: 'Trade JNTo',
    ctaHref: JNTO_SWAP_TRADE,
    artTheme: 'jnto-swap',
  },
  {
    id: 'jnto-earn',
    badgeKey: 'Earn',
    titleKey: 'Stake JNTo. Harvest more.',
    subtitleKey: 'Farm and pool your JNTo to compound yields across the ecosystem.',
    ctaLabelKey: 'Stake JNTo',
    ctaHref: JNTO_STAKE,
    artTheme: 'jnto-earn',
  },
]

/** Auto-advance interval (ms). Paused while dragging. */
export const PROMO_AD_ROTATE_MS = 6000

export const PROMO_SWIPE_THRESHOLD_PX = 48
export const PROMO_SWIPE_VELOCITY = 0.35
