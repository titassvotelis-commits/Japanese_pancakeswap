import { MenuItemsType } from '@pancakeswap/uikit'
import { ContextApi } from 'contexts/Localization/types'

export type ConfigMenuItemsType = MenuItemsType & { hideSubNav?: boolean }

const config: (t: ContextApi['t']) => ConfigMenuItemsType[] = (t) => [
  {
    label: t('Exchange'),
    icon: 'Swap',
    href: '/swap',
    showOnMobile: false,
    showItemsOnMobile: false,
    items: [],
  },
  {
    label: t('Liquidity'),
    icon: 'Pool',
    href: '/liquidity',
    showOnMobile: false,
    showItemsOnMobile: false,
    items: [],
  },
  {
    label: t('Farms'),
    icon: 'Earn',
    href: '/farms',
    showOnMobile: false,
    showItemsOnMobile: false,
    items: [],
  },
  {
    label: t('Launch'),
    icon: 'Pool',
    href: '/marketplace',
    showOnMobile: false,
    showItemsOnMobile: false,
    items: [],
  },
]

export default config
