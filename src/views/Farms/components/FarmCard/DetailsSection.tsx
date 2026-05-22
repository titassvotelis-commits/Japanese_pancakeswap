import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'contexts/Localization'
import styled from 'styled-components'
import { Text, Flex, Skeleton, Button } from '@pancakeswap/uikit'

export interface ExpandableSectionProps {
  bscScanAddress?: string
  infoAddress?: string
  removed?: boolean
  totalValueFormatted?: string
  lpLabel?: string
  addLiquidityUrl?: string
  stakingNote?: string
}

const Wrapper = styled.div`
  margin-top: 24px;
`

const LiquidityLink = styled(Link)`
  font-weight: 400;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const DetailsSection: React.FC<ExpandableSectionProps> = ({
  bscScanAddress,
  removed,
  totalValueFormatted,
  lpLabel,
  addLiquidityUrl,
  stakingNote,
}) => {
  const { t } = useTranslation()

  return (
    <Wrapper>
      {!removed && addLiquidityUrl && (
        <Flex justifyContent="space-between">
          <Text>{t('GET')}:</Text>
          <LiquidityLink to={addLiquidityUrl}>{t('%symbol%', { symbol: lpLabel })}</LiquidityLink>
        </Flex>
      )}
      <Flex justifyContent="space-between">
        <Text>{t('Total Liquidity')}:</Text>
        {totalValueFormatted ? <Text>{totalValueFormatted}</Text> : <Skeleton width={75} height={25} />}
      </Flex>
      {stakingNote ? (
        <Text fontSize="12px" color="textSubtle" mt="12px">
          {stakingNote}
        </Text>
      ) : null}
      {bscScanAddress && (
        <Button
          as="a"
          href={bscScanAddress}
          target="_blank"
          rel="noopener noreferrer"
          variant="primary"
          marginTop="16px"
          width="100%"
        >
          {t('View on BscScan')}
        </Button>
      )}
    </Wrapper>
  )
}

export default DetailsSection
