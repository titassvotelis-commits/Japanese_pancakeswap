import React, { useMemo } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { ArrowForwardIcon, Image, Skeleton } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { useMkTokenPriceDisplay } from 'hooks/useMkWalletUsd'
import tokens from 'config/constants/tokens'
import { NAV_HEADER } from './navHeaderTheme'

export const MK_LOGO_SRC = '/images/metakey-logo-icon.png'

/** Horizontal JNTo price + Buy JNTo row (footer + nav logo dropdown). */
export const ActionsRow = styled.div`
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  flex-shrink: 0;
`

/** Fixed gap between JNTo price and Buy JNTo button. */
const PriceBuySpacer = styled.div`
  width: 72px;
  min-width: 72px;
  flex-shrink: 0;
`

const PriceLink = styled(Link)`
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  flex-shrink: 0;
`

const MkPriceText = styled.span`
  font-weight: 700;
  font-size: 15px;
  line-height: 1;
  color: ${({ theme }) => theme.colors.primary};
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
`

const BuyLink = styled(Link)`
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 15px;
  text-decoration: none;
  color: ${NAV_HEADER.ctaText};
  background: ${NAV_HEADER.ctaGradient};
  box-shadow: ${NAV_HEADER.ctaShadow};
  flex-shrink: 0;
  white-space: nowrap;

  &:hover {
    filter: brightness(1.05);
    color: ${NAV_HEADER.ctaText};
  }
`

type MkPriceBuyActionsProps = {
  /** Called when user clicks Buy JNTo (e.g. to close the logo hover dropdown). */
  onBuyMkClick?: () => void
}

const MkPriceBuyActions: React.FC<MkPriceBuyActionsProps> = ({ onBuyMkClick }) => {
  const { t } = useTranslation()
  const { part: mkPricePart, pending: mkPricePending } = useMkTokenPriceDisplay()
  const swapTo = useMemo(() => `/swap?outputCurrency=${tokens.jnto.address}`, [])

  return (
    <ActionsRow>
      <PriceLink
        to={swapTo}
        title={mkPricePending ? t('JNTo price (USD)') : t('JNTo price: $%price%', { price: mkPricePart })}
      >
        <Image
          src={MK_LOGO_SRC}
          alt="JNTo"
          width={28}
          height={28}
          style={{ borderRadius: 6, flexShrink: 0 }}
        />
        {mkPricePending ? (
          <Skeleton width={100} height={22} />
        ) : (
          <MkPriceText>${mkPricePart}</MkPriceText>
        )}
      </PriceLink>
      <PriceBuySpacer aria-hidden />
      <BuyLink to={swapTo} onClick={onBuyMkClick}>
        {t('Buy JNTo')}
        <ArrowForwardIcon color="white" width="18px" />
      </BuyLink>
    </ActionsRow>
  )
}

export default MkPriceBuyActions
