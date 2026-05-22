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
  title: string
  subtitle?: string
  badge?: string
  ctaLabel: string
  ctaHref: string
  ctaExternal?: boolean
  artTheme: PromoArtTheme
}

export const PROMO_AD_SLIDES: PromoAdSlide[] = [
  {
    id: 'jnto-intro',
    badge: 'Native token',
    title: 'JNTo powers Optimus.',
    subtitle: 'JNToken — the core asset behind swaps, farms, and rewards on Optimus Swap.',
    ctaLabel: 'Get JNTo',
    ctaHref: JNTO_SWAP_GET,
    artTheme: 'jnto-hero',
  },
  {
    id: 'jnto-trade',
    badge: 'Trade',
    title: 'Swap into JNTo instantly.',
    subtitle: 'Pair BNB or stablecoins with JNTo — deep routes, minimal friction.',
    ctaLabel: 'Trade JNTo',
    ctaHref: JNTO_SWAP_TRADE,
    artTheme: 'jnto-swap',
  },
  {
    id: 'jnto-earn',
    badge: 'Earn',
    title: 'Stake JNTo. Harvest more.',
    subtitle: 'Farm and pool your JNTo to compound yields across the ecosystem.',
    ctaLabel: 'Stake JNTo',
    ctaHref: JNTO_STAKE,
    artTheme: 'jnto-earn',
  },
]

/** Auto-advance interval (ms). Paused while dragging. */
export const PROMO_AD_ROTATE_MS = 6000

export const PROMO_SWIPE_THRESHOLD_PX = 48
export const PROMO_SWIPE_VELOCITY = 0.35
