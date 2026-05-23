import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { Mail } from 'react-feather'
import {
  Box,
  Flex,
  Text,
  Image,
  TwitterIcon,
  TelegramIcon,
  ChartIcon,
  ListViewIcon,
  FarmIcon,
} from '@pancakeswap/uikit'
import type { SvgProps } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import useTheme from 'hooks/useTheme'
import tokens from 'config/constants/tokens'
import LanguageNavMenu from './LanguageNavMenu'
import FooterThemeToggle from './FooterThemeToggle'
import MkPriceBuyActions from './MkPriceBuyActions'
import { NAV_BREAKPOINTS, SITE_CHROME_BG } from './navHeaderTheme'

const BRAND = {
  titleKey: 'METAKEY SWAP',
  logoSrc: '/images/metakey-logo-icon.png',
} as const

type SocialEntry =
  | { href: string; labelKey: string; Icon: React.ComponentType<SvgProps>; internal?: boolean }
  | { href: string; labelKey: string; kind: 'mail' }

const SOCIAL: SocialEntry[] = [
  { href: 'https://twitter.com/', labelKey: 'Twitter', Icon: TwitterIcon },
  { href: 'https://t.me/optimus', labelKey: 'Telegram', Icon: TelegramIcon },
  { href: 'https://t.me/optimus', labelKey: 'Telegram announcements', Icon: TelegramIcon },
  {
    href: `https://dexscreener.com/bsc/${tokens.jnto.address}`,
    labelKey: 'Charts',
    Icon: ChartIcon,
  },
  { href: 'https://docs.optimuswap.io/products/pancakeswap-exchange', labelKey: 'Docs', Icon: ListViewIcon },
  { href: '/farms', labelKey: 'Farms', Icon: FarmIcon, internal: true },
  { href: 'mailto:support@optimuswap.io?subject=optimus', labelKey: 'Email', kind: 'mail' },
]

const Outer = styled(Box).attrs({ id: 'site-footer' })`
  width: 100%;
  /* Extra bottom padding on small screens: uikit BottomNav is position:fixed and would cover the last footer row */
  padding: 28px 16px calc(68px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${SITE_CHROME_BG};

  ${({ theme }) => theme.mediaQueries.sm} {
    padding: 32px 24px calc(68px + env(safe-area-inset-bottom, 0px));
  }

  @media screen and (min-width: ${NAV_BREAKPOINTS.headerFull + 1}px) {
    padding: 32px 24px 28px;
  }
`

const Inner = styled(Box)`
  max-width: 1200px;
  margin: 0 auto;
`

const Divider = styled(Box)`
  height: 1px;
  width: 100%;
  max-width: 1200px;
  margin: 24px auto 20px;
  background: rgba(255, 255, 255, 0.12);
`

const BrandRow = styled(Flex)`
  flex-direction: row;
  align-items: center;
  flex-wrap: nowrap;
  width: 100%;
  margin-bottom: 14px;
  gap: 10px;
`

const BrandTitle = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #9b9b9b;
  letter-spacing: 0.02em;
  white-space: nowrap;
  line-height: 1.2;
`

const SocialLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary};
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.75;
  }
`

const InternalSocialLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary};
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.75;
  }
`

const FooterActionsWrap = styled(Flex)`
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
  max-width: 100%;
  overflow-x: auto;
  padding: 4px 0;

  ${({ theme }) => theme.mediaQueries.md} {
    justify-content: flex-end;
  }
`

/** Mobile: theme + language + JNTo price row, centered. */
const MobileBottomRow = styled(Flex)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
  width: 100%;
  row-gap: 12px;

  ${({ theme }) => theme.mediaQueries.md} {
    display: none;
  }
`

/** Desktop: controls left, JNTo price + Buy JNTo right. */
const DesktopBottomRow = styled(Flex)`
  display: none;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;

  ${({ theme }) => theme.mediaQueries.md} {
    display: flex;
    flex-wrap: nowrap;
  }
`

const BottomBar = styled(Flex)`
  width: 100%;
`

const SiteFooter = () => {
  const { isDark, setTheme } = useTheme()
  const { t, currentLanguage } = useTranslation()

  return (
    <Outer as="footer" role="contentinfo">
      <Inner>
        <Flex flexDirection="column" alignItems={['center', 'center', 'flex-start']}>
          <BrandRow justifyContent={['center', 'center', 'flex-start']}>
            <Image src={BRAND.logoSrc} alt={t(BRAND.titleKey)} width={36} height={36} style={{ borderRadius: 8, flexShrink: 0 }} />
            <BrandTitle>{t(BRAND.titleKey)}</BrandTitle>
          </BrandRow>
          <Flex flexWrap="wrap" alignItems="center" justifyContent={['center', 'center', 'flex-start']} style={{ gap: 14 }}>
            {SOCIAL.map((item) => {
              const label = t(item.labelKey)
              const wrapProps = {
                key: `${item.labelKey}-${'kind' in item ? item.kind : item.href}`,
                'aria-label': label,
                title: label,
              }
              if ('kind' in item && item.kind === 'mail') {
                return (
                  <SocialLink {...wrapProps} href={item.href}>
                    <Mail size={22} strokeWidth={2} />
                  </SocialLink>
                )
              }
              const iconItem = item as Extract<SocialEntry, { Icon: React.ComponentType<SvgProps> }>
              const { Icon, href, internal } = iconItem
              if (internal) {
                return (
                  <InternalSocialLink {...wrapProps} to={href}>
                    <Icon width={22} height={22} color="primary" />
                  </InternalSocialLink>
                )
              }
              return (
                <SocialLink {...wrapProps} href={href} target="_blank" rel="noreferrer noopener">
                  <Icon width={22} height={22} color="primary" />
                </SocialLink>
              )
            })}
          </Flex>
        </Flex>
      </Inner>

      <Divider />

      <Inner>
        <BottomBar>
          <MobileBottomRow>
            <FooterThemeToggle isDark={isDark} onToggle={setTheme} />
            <Flex alignItems="center" flexShrink={0}>
              <LanguageNavMenu />
              <Text bold color="primary" fontSize="16px" ml="6px" style={{ lineHeight: 1 }}>
                {String(currentLanguage.code).toUpperCase()}
              </Text>
            </Flex>
            <MkPriceBuyActions />
          </MobileBottomRow>

          <DesktopBottomRow>
            <Flex alignItems="center" flexWrap="wrap" style={{ gap: 14 }}>
              <FooterThemeToggle isDark={isDark} onToggle={setTheme} />
              <Flex alignItems="center" flexShrink={0}>
                <LanguageNavMenu />
                <Text bold color="primary" fontSize="16px" ml="6px" style={{ lineHeight: 1 }}>
                  {String(currentLanguage.code).toUpperCase()}
                </Text>
              </Flex>
            </Flex>
            <FooterActionsWrap>
              <MkPriceBuyActions />
            </FooterActionsWrap>
          </DesktopBottomRow>
        </BottomBar>
      </Inner>
    </Outer>
  )
}

export default SiteFooter
