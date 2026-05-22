import React, { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'
import { Search } from 'react-feather'
import { Currency, ETHER, Token } from '@pancakeswap/sdk'
import { useModal } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import { AppDispatch } from 'state'
import { Field, selectCurrency } from 'state/swap/actions'
import { NAV_HEADER } from './navHeaderTheme'

const SearchPill = styled.button<{ $embedded?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: ${NAV_HEADER.pillHeight}px;
  min-width: ${({ $embedded }) => ($embedded ? '0' : `${NAV_HEADER.searchMinWidth}px`)};
  flex: ${({ $embedded }) => ($embedded ? '1 1 auto' : '0 0 auto')};
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSubtle};

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`

const Shell = styled.div<{ $minWidth: number }>`
  display: inline-flex;
  align-items: center;
  height: ${NAV_HEADER.pillHeight}px;
  min-width: ${({ $minWidth }) => $minWidth}px;
  padding: 0 6px 0 4px;
  border-radius: ${NAV_HEADER.pillRadius}px;
  border: 1px solid
    ${({ theme }) => (theme.isDark ? NAV_HEADER.borderDark : theme.colors.cardBorder)};
  background: ${({ theme }) => (theme.isDark ? NAV_HEADER.searchBgDark : NAV_HEADER.searchBgLight)};
  flex-shrink: 0;
  box-shadow: ${({ theme }) =>
    theme.isDark ? 'inset 0 1px 0 rgba(255, 255, 255, 0.04)' : 'none'};
`

const SlashBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  margin-left: auto;
  border-radius: 6px;
  background: ${({ theme }) =>
    theme.isDark ? NAV_HEADER.slashBgDark : 'rgba(180, 170, 200, 0.35)'};
  color: ${({ theme }) => (theme.isDark ? 'rgba(255, 255, 255, 0.85)' : theme.colors.text)};
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  flex-shrink: 0;
`

const Label = styled.span`
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  color: ${({ theme }) => (theme.isDark ? 'rgba(255, 255, 255, 0.45)' : theme.colors.textSubtle)};
`

const MobileSearchButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${NAV_HEADER.mobilePillSize}px;
  height: ${NAV_HEADER.mobilePillSize}px;
  padding: 0;
  border-radius: 12px;
  border: 1px solid
    ${({ theme }) => (theme.isDark ? NAV_HEADER.borderDark : theme.colors.cardBorder)};
  background: ${({ theme }) => (theme.isDark ? 'rgba(28, 26, 34, 0.95)' : NAV_HEADER.searchBgLight)};
  color: ${({ theme }) => (theme.isDark ? 'rgba(255, 255, 255, 0.5)' : theme.colors.textSubtle)};
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => (theme.isDark ? 'rgba(255, 255, 255, 0.14)' : theme.colors.primary)};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`

export type NavSearchMode = 'compact' | 'slim' | 'full'

interface NavTokenSearchProps {
  embedded?: boolean
  mode?: NavSearchMode
  /** @deprecated Use `mode="full"` or `mode="slim"` instead */
  showSlash?: boolean
}

const NavTokenSearch: React.FC<NavTokenSearchProps> = ({
  embedded = false,
  mode,
  showSlash,
}) => {
  const resolvedMode: NavSearchMode =
    mode ?? (showSlash === false ? 'slim' : 'full')
  const { t } = useTranslation()
  const history = useHistory()
  const dispatch = useDispatch<AppDispatch>()

  const onCurrencySelect = useCallback(
    (currency: Currency) => {
      const id =
        currency === ETHER ? 'BNB' : currency instanceof Token ? currency.address : 'BNB'

      dispatch(selectCurrency({ field: Field.OUTPUT, currencyId: id }))

      const onSwap =
        history.location.pathname === '/swap' || history.location.pathname.startsWith('/swap/')
      if (onSwap) {
        history.replace({ pathname: '/swap', search: `?outputCurrency=${id}` })
      } else {
        history.push(`/swap?outputCurrency=${id}`)
      }
    },
    [dispatch, history],
  )

  const [onPresentSearch] = useModal(
    <CurrencySearchModal onCurrencySelect={onCurrencySelect} showCommonBases />,
    true,
    true,
    'navTokenSearch',
  )

  if (resolvedMode === 'compact') {
    return (
      <MobileSearchButton type="button" onClick={onPresentSearch} aria-label={t('Search tokens')}>
        <Search size={18} strokeWidth={2} color="currentColor" aria-hidden />
      </MobileSearchButton>
    )
  }

  const showSlashBadge = resolvedMode === 'full'
  const minWidth =
    resolvedMode === 'slim' ? NAV_HEADER.searchSlimMinWidth : NAV_HEADER.searchMinWidth

  const pill = (
    <SearchPill type="button" $embedded={embedded} onClick={onPresentSearch} aria-label={t('Search tokens')}>
      <Search size={16} strokeWidth={2} color="currentColor" aria-hidden />
      <Label>{t('Search')}</Label>
      {showSlashBadge && <SlashBadge>/</SlashBadge>}
    </SearchPill>
  )

  if (embedded) {
    return (
      <SearchPill
        type="button"
        $embedded
        onClick={onPresentSearch}
        aria-label={t('Search tokens')}
        style={{ flex: 1, minWidth: 0 }}
      >
        <Search size={16} strokeWidth={2} color="currentColor" aria-hidden />
        <Label>{t('Search')}</Label>
        {showSlashBadge && <SlashBadge>/</SlashBadge>}
      </SearchPill>
    )
  }

  return <Shell $minWidth={minWidth}>{pill}</Shell>
}

export default NavTokenSearch
