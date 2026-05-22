import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import {
  EarnIcon,
  Flex,
  MenuItemsType,
  PoolIcon,
  SvgProps,
  SwapIcon,
  Text,
} from '@pancakeswap/uikit'
import { SITE_CHROME_BG } from './navHeaderTheme'

const Bar = styled(Flex)`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 5px 8px;
  padding-bottom: env(safe-area-inset-bottom);
  background: ${SITE_CHROME_BG};
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 20;
  justify-content: space-around;
`

const NavLink = styled(Link)<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 4px 10px;
  text-decoration: none;
  border-radius: 16px;
  border: 0;
  background: transparent;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.backgroundAlt};
  }
`

const ICONS: Record<string, React.FC<SvgProps>> = {
  Swap: SwapIcon,
  Earn: EarnIcon,
  Pool: PoolIcon,
}

interface NavCompactBottomNavProps {
  items: MenuItemsType[]
  activeItem?: string
}

const NavCompactBottomNav: React.FC<NavCompactBottomNavProps> = ({ items, activeItem }) => (
  <Bar role="navigation" aria-label="Main">
    {items.map((item) => {
      if (!item.href) {
        return null
      }
      const Icon = ICONS[item.icon ?? ''] ?? EarnIcon
      const isActive = item.href === activeItem
      return (
        <NavLink key={`${item.href}-${item.label}`} to={item.href} $active={isActive}>
          <Icon color={isActive ? 'secondary' : 'textSubtle'} width="21px" height="22px" />
          <Text
            as={isActive ? 'strong' : 'span'}
            fontSize="10px"
            fontWeight={isActive ? 700 : 400}
            color={isActive ? 'text' : 'textSubtle'}
            lineHeight="1.2"
            mt="2px"
          >
            {item.label}
          </Text>
        </NavLink>
      )
    })}
  </Bar>
)

export default NavCompactBottomNav
