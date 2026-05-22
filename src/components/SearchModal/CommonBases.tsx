import React from 'react'
import { ChainId, Currency, currencyEquals, ETHER, Token } from '@pancakeswap/sdk'
import { Text } from '@pancakeswap/uikit'
import styled from 'styled-components'
import { useTranslation } from 'contexts/Localization'

import { SUGGESTED_BASES } from '../../config/constants'
import { AutoColumn } from '../Layout/Column'
import { CurrencyLogo } from '../Logo'

const BaseGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
`

const BaseChip = styled.button<{ $selected?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid
    ${({ theme, $selected }) =>
      $selected ? theme.colors.primary : theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(25,19,38,0.08)'};
  background: ${({ theme, $selected }) =>
    $selected ? (theme.isDark ? 'rgba(118, 69, 217, 0.2)' : 'rgba(118, 69, 217, 0.1)') : theme.colors.background};
  cursor: ${({ $selected }) => ($selected ? 'default' : 'pointer')};
  opacity: ${({ $selected }) => ($selected ? 0.85 : 1)};

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

export default function CommonBases({
  chainId,
  onSelect,
  selectedCurrency,
}: {
  chainId?: ChainId
  selectedCurrency?: Currency | null
  onSelect: (currency: Currency) => void
}) {
  const { t } = useTranslation()
  const bases = chainId ? SUGGESTED_BASES[chainId] : []

  const renderChip = (currency: Currency, label: string) => {
    const selected =
      currency === ETHER
        ? selectedCurrency === ETHER
        : selectedCurrency instanceof Token && currencyEquals(selectedCurrency, currency)
    return (
      <BaseChip
        key={label}
        type="button"
        $selected={selected}
        disabled={selected}
        onClick={() => !selected && onSelect(currency)}
      >
        <CurrencyLogo currency={currency} size="24px" />
        <Text fontSize="14px" fontWeight={600}>
          {label}
        </Text>
      </BaseChip>
    )
  }

  return (
    <AutoColumn gap="sm">
      <Text fontSize="12px" color="textSubtle" fontWeight={600}>
        {t('Popular tokens')}
      </Text>
      <BaseGrid>
        {renderChip(ETHER, 'BNB')}
        {bases.map((token: Token) => renderChip(token, token.symbol))}
      </BaseGrid>
    </AutoColumn>
  )
}
