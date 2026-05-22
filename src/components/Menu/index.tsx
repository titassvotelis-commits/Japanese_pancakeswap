import React, { useEffect } from 'react'
import { useLocation } from 'react-router'
import { Menu as UikitMenu, Flex } from '@pancakeswap/uikit'
import { languageList } from 'config/localization/languages'
import { useTranslation } from 'contexts/Localization'
import useTheme from 'hooks/useTheme'
import { useProfile } from 'state/profile/hooks'
import { nftsBaseUrl } from 'views/Nft/market/constants'
import config from './config/config'
import LanguageNavMenu from './LanguageNavMenu'
import NavRightCluster from './NavRightCluster'
import NavLogoMkDropdown from './NavLogoMkDropdown'
import NavCompactBottomNav from './NavCompactBottomNav'
import { useTradeNavHeader } from './useTradeNavHeader'
import { useNavHeaderRwd } from './useNavHeaderRwd'
import NavMenuActiveStyle from './NavMenuActiveStyle'
import { getActiveMenuItem } from './utils'
import { footerLinks } from './config/footerConfig'

const Menu = (props: any) => {
  const { children, ...rest } = props
  const { isDark, toggleTheme } = useTheme()
  const { profile } = useProfile()
  const { currentLanguage, setLanguage, t } = useTranslation()
  const { pathname } = useLocation()
  const navRwd = useNavHeaderRwd()
  useTradeNavHeader()

  useEffect(() => {
    document.body.classList.toggle('nav-compact-header', navRwd.compactHeader)
    return () => document.body.classList.remove('nav-compact-header')
  }, [navRwd.compactHeader])

  const menuConfig = config(t)
  const activeMenuItem = getActiveMenuItem({ menuConfig, pathname })
  const activeHref = activeMenuItem?.href
  return (
    <>
      <NavMenuActiveStyle $activeHref={activeHref} />
      <UikitMenu
        globalMenu={<NavRightCluster rwd={navRwd} />}
        isDark={isDark}
        toggleTheme={toggleTheme}
        currentLang={currentLanguage.code}
        langs={languageList}
        setLang={setLanguage}
        links={menuConfig}
        footerLinks={footerLinks(t)}
        activeItem={activeMenuItem?.href}
        buyCakeLabel={t('Buy JNTo')}
        profile={{
          username: profile?.username,
          image: profile?.nft ? `/images/nfts/${profile.nft?.images.sm}` : undefined,
          profileLink: `${nftsBaseUrl}/profile`,
          noProfileLink: `${nftsBaseUrl}/profile`,
          showPip: !profile?.username,
        }}
        {...rest}
        languageMenu={
          navRwd.showLanguageInNav ? (
            <Flex alignItems="center" height="100%" flexShrink={0} style={{ gap: 4 }}>
              <LanguageNavMenu />
            </Flex>
          ) : undefined
        }
      >
        {children}
      </UikitMenu>
      <NavLogoMkDropdown />
      {navRwd.showBottomNav && (
        <NavCompactBottomNav items={menuConfig} activeItem={activeMenuItem?.href} />
      )}
    </>
  )
}

export default Menu
