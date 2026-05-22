import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Flex, Image, Skeleton, Text } from '@pancakeswap/uikit'
import { useMkTokenPriceDisplay } from 'hooks/useMkWalletUsd'
import tokens from 'config/constants/tokens'

const PriceLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 130px;
  flex-shrink: 1;
  min-width: 0;
  text-decoration: none;

  &:hover {
    opacity: 0.85;
  }
`

const PriceText = styled(Text)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
`

const CompactMkPrice: React.FC = () => {
  const { part, pending } = useMkTokenPriceDisplay()
  const swapTo = `/swap?outputCurrency=${tokens.jnto.address}`

  if (pending) {
    return <Skeleton width={72} height={22} />
  }

  return (
    <Flex alignItems="center" height="100%" flexShrink={1} minWidth={0}>
      <PriceLink to={swapTo} title={`$${part}`}>
        <Image
          src="/images/metakey-logo-icon.png"
          alt="JNTo"
          width={22}
          height={22}
          style={{ borderRadius: 4, flexShrink: 0 }}
        />
        <PriceText bold color="textSubtle" fontSize="13px">
          ${part}
        </PriceText>
      </PriceLink>
    </Flex>
  )
}

export default CompactMkPrice
