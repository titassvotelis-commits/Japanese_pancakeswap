import { ConfigMenuItemsType } from './config/config'

const normalizePathname = (pathname: string) => {
  if (!pathname || pathname === '/') {
    return '/'
  }
  return pathname.replace(/\/+$/, '')
}

const pathMatchesHref = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`)

export const getActiveMenuItem = ({ pathname, menuConfig }: { pathname: string; menuConfig: ConfigMenuItemsType[] }) => {
  const path = normalizePathname(pathname)
  if (path === '/') {
    return undefined
  }

  const matches = menuConfig.filter(
    (menuItem) =>
      menuItem.href &&
      (pathMatchesHref(path, menuItem.href) || getActiveSubMenuItem({ menuItem, pathname: path })),
  )

  if (matches.length === 0) {
    return undefined
  }

  return matches.sort((a, b) => b.href.length - a.href.length)[0]
}

export const getActiveSubMenuItem = ({ pathname, menuItem }: { pathname: string; menuItem?: ConfigMenuItemsType }) => {
  const activeSubMenuItems = menuItem?.items.filter((subMenuItem) => pathname.startsWith(subMenuItem.href)) ?? []

  // Pathname doesn't include any submenu item href - return undefined
  if (!activeSubMenuItems || activeSubMenuItems.length === 0) {
    return undefined
  }

  // Pathname includes one sub menu item href - return it
  if (activeSubMenuItems.length === 1) {
    return activeSubMenuItems[0]
  }

  // Pathname includes multiple sub menu item hrefs - find the most specific match
  const mostSpecificMatch = activeSubMenuItems.sort(
    (subMenuItem1, subMenuItem2) => subMenuItem2.href.length - subMenuItem1.href.length,
  )[0]

  return mostSpecificMatch
}
