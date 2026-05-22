import React from 'react'
import styled from 'styled-components'
import { Tag, Flex, Heading, Skeleton, Image } from '@pancakeswap/uikit'
import { Token } from '@pancakeswap/sdk'
import { CommunityTag, CoreTag } from 'components/Tags'
import { TokenPairImage } from 'components/TokenImage'

export interface ExpandableSectionProps {
  lpLabel?: string
  multiplier?: string
  isCommunityFarm?: boolean
  token: Token
  quoteToken: Token
  isTokenOnly: boolean
  lockingPeriod: string
}

const Wrapper = styled(Flex)`
  svg {
    margin-right: 4px;
  }
`

const MultiplierTag = styled(Tag)`
  margin-left: 4px;
  color: #262626;
`

const CardHeading: React.FC<ExpandableSectionProps> = ({ lpLabel, multiplier, isCommunityFarm, token, quoteToken, isTokenOnly, lockingPeriod }) => {
  const image = `/images/tokens/${token.address}.svg`
  return (
    <Wrapper alignItems="center" mb="12px">
      <div style={{ width: '240px', display: 'flex', alignItems: 'center' }}>
        {
          isTokenOnly ?
            <Image src={image} width={48} height={48} alt="Token Image" /> :
            <TokenPairImage variant="inverted" primaryToken={quoteToken} secondaryToken={token} width={48} height={48} />
        }
        {/* <div>
          <Heading marginLeft="6px">{lpLabel}</Heading>
        </div> */}
      </div>

      <Flex flexDirection="column" alignItems="flex-end" flex="auto">
        <Heading mb="4px">{lpLabel.split(' ')[0]}</Heading>
        <Flex justifyContent="center">
          {isCommunityFarm ? <CommunityTag /> : <CoreTag />}
          {/* {
            lockingPeriod && Number(lockingPeriod) !== 0 ? (
              <Tag variant="secondary" outline>
                {`${(Number(lockingPeriod) / 7 / 24 / 1200).toFixed(0)}W`}
              </Tag>
            ) : (
              <></>
            )
          } */}
          {
            multiplier && multiplier !== '0X' ? (
              <MultiplierTag variant="secondary">{ multiplier || '0X'}</MultiplierTag>
            ) : (
              <></>
            )
          }

        </Flex>
      </Flex>
    </Wrapper>
  )
}

export default CardHeading
