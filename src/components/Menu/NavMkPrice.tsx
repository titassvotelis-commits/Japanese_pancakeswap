import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { Flex, Image, Skeleton, Text } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { useMkTokenPriceDisplay } from 'hooks/useMkWalletUsd'
import tokens from 'config/constants/tokens'

const PriceLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  margin-right: 8px;
  line-height: 1;

  &:hover {
    opacity: 0.85;
  }
`

const NavMkPrice = () => {
  const { t } = useTranslation()
  const { part, pending } = useMkTokenPriceDisplay()
  const swapTo = `/swap?outputCurrency=${tokens.jnto.address}`

  if (pending) {
    return (
      <Flex alignItems="center" height="100%" mr="8px">
        <Skeleton width={100} height={22} />
      </Flex>
    )
  }

  return (
    <PriceLink to={swapTo} title={t('JNTo price (USD)')}>
      <Image
        src="/images/metakey-logo-icon.png"
        alt="JNTo"
        width={24}
        height={24}
        mr="8px"
        style={{ borderRadius: 6, flexShrink: 0 }}
      />
      <Text bold color="primary" fontSize="14px" style={{ lineHeight: 1 }}>
        ${part}
      </Text>
    </PriceLink>
  )
}

export default NavMkPrice
