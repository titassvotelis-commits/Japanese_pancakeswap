import React, { useState } from 'react'
import BigNumber from 'bignumber.js'
import styled, { keyframes } from 'styled-components'
import { Card, Flex, Text, Skeleton } from '@pancakeswap/uikit'
import { DeserializedFarm } from 'state/types'
import { getBscScanLink } from 'utils'
import { useTranslation } from 'contexts/Localization'
import ExpandableSectionButton from 'components/ExpandableSectionButton'
import tokens from 'config/constants/tokens'
import { getAddress } from 'utils/addressHelpers'
import { getAddLiquidityPath } from 'utils/getLiquidityUrlPathParts'
import { isAddress } from 'utils'
import { BIG_TEN } from 'utils/bigNumber'
import DetailsSection from './DetailsSection'
import CardHeading from './CardHeading'
import CardActionsContainer from './CardActionsContainer'
import ApyButton from './ApyButton'

export interface FarmWithStakedValue extends DeserializedFarm {
  apr?: number
  lpRewardsApr?: number
  liquidity?: BigNumber
}

const animationKeyFrame = keyframes`
  0% {
    background-position: 50% 0%;
  }
  50% {
    background-position: 0% 100%;
  }
  100% {
    background-position: 50% 0%;
  }
`

const StyledCard = styled(Card)`
  align-self: baseline;
  // background: linear-gradient(135deg, #FF007A, #3300FF);
  background: none;
  animation: ${animationKeyFrame} 3s ease infinite;
  background-size: 400% 400%;
  border-radius: 20px;
  &>div {
    border-radius: 20px;
  }
`

const FarmCardInnerContainer = styled(Flex)`
  flex-direction: column;
  justify-content: space-around;
  padding: 16px;
  background-image: url(images/farm0.png);
  background-repeat: no-repeat;
  background-position: right top;
  background-size: 120px auto;

  ${({ theme }) => theme.mediaQueries.sm} {
    padding: 24px;
    background-size: auto;
  }
`

const ExpandingWrapper = styled.div`
  padding: 24px;
  border-top: 2px solid ${({ theme }) => theme.colors.cardBorder};
  overflow: hidden;
`

interface FarmCardProps {
  farm: FarmWithStakedValue
  displayApr: string
  removed: boolean
  cakePrice?: BigNumber
  account?: string
}

const FarmCard: React.FC<FarmCardProps> = ({ farm, displayApr, removed, cakePrice, account }) => {
  const { t } = useTranslation()

  const [showExpandableSection, setShowExpandableSection] = useState(false)

  const totalValueFormatted =
    farm.liquidity && farm.liquidity.gt(0)
      ? `$${farm.liquidity.toNumber().toLocaleString(undefined, { maximumFractionDigits: 0 })}`
      : ''
  const totalValueFormattedForOpt = farm.lpSupply && farm.lpSupply.gt(0)
    ? `$${farm.lpSupply.div(BIG_TEN.pow(farm.token.decimals)).times(farm.tokenPriceBusd).toNumber().toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    : ''

  const lpLabel = farm.lpSymbol && farm.lpSymbol.toUpperCase().replace('PANCAKE', '')
  const earnLabel = farm.dual ? farm.dual.earnLabel : tokens.jnto.symbol
  const depositFeeBP = farm ? farm.depositFeeBP : 0


  // JNTo-USDT farm (pid 0): show JNTo / USDT in the UI for liquidity links.
  const displayToken = farm.pid === 0 ? tokens.jnto : farm.token
  const displayQuote = farm.pid === 0 ? tokens.usdt : farm.quoteToken

  let addLiquidityUrl = getAddLiquidityPath({
    quoteTokenAddress: displayQuote.address,
    tokenAddress: displayToken.address,
  })
  if (farm.isTokenOnly) {
    addLiquidityUrl = `/swap?outputCurrency=${displayToken.address}`
  }
  const lpAddress = farm.displayLpAddresses ? getAddress(farm.displayLpAddresses) : getAddress(farm.lpAddresses)
  const bscScanAddress = isAddress(lpAddress) ? getBscScanLink(lpAddress, 'address') : undefined
  const farmDataReady = Boolean(farm.displayLpTotalInQuoteToken ?? farm.lpTotalInQuoteToken)
  const isPromotedFarm = farm.pid === 0
  const stakingDisabled = farm.multiplier === '0X'

  const style = {
    fontSize: '16px'
  }

  return (
    <StyledCard isActive={isPromotedFarm}>
      <FarmCardInnerContainer>
        <CardHeading
          lpLabel={farm.lpSymbol}
          multiplier={farm.multiplier}
          isCommunityFarm={farm.isCommunity}
          token={displayToken}
          quoteToken={displayQuote}
          isTokenOnly={farm.isTokenOnly}
          lockingPeriod={farm.lockingPeriod.toFixed(0)}
        />
        {!removed && (
          <Flex justifyContent="space-between" alignItems="center" marginBottom="10px">
            <Text>{t('APR')}:</Text>
            <Text bold style={{ display: 'flex', alignItems: 'center' }}>
              {farmDataReady ? (
                <ApyButton
                  variant="text-and-button"
                  pid={farm.pid}
                  lpSymbol={farm.lpSymbol}
                  multiplier={farm.multiplier}
                  lpLabel={lpLabel}
                  addLiquidityUrl={addLiquidityUrl}
                  cakePrice={cakePrice}
                  apr={farm.apr ?? 0}
                  displayApr={displayApr}
                />
              ) : (
                <Skeleton height={24} width={80} />
              )}
            </Text>
          </Flex>
        )}
        <Flex justifyContent="space-between" marginBottom="10px" style={style}>
          <Text>{t('Earn')}:</Text>
          <Text bold>{earnLabel}</Text>
        </Flex>
        <Flex justifyContent="space-between">
          <Text>{t('Deposit Fee')}:</Text>
          <Text bold>{depositFeeBP}%</Text>
        </Flex>
        <CardActionsContainer
          farm={farm}
          lpLabel={lpLabel}
          account={account}
          cakePrice={cakePrice}
          addLiquidityUrl={addLiquidityUrl}
          stakingDisabled={stakingDisabled}
        />
      </FarmCardInnerContainer>

      <ExpandingWrapper>
        <ExpandableSectionButton
          onClick={() => setShowExpandableSection(!showExpandableSection)}
          expanded={showExpandableSection}
        />
        {showExpandableSection && (
          <DetailsSection
            removed={removed}
            bscScanAddress={bscScanAddress}
            infoAddress={`/info/pool/${lpAddress}`}
            totalValueFormatted={farm.isTokenOnly ? totalValueFormattedForOpt : totalValueFormatted}
            lpLabel={lpLabel}
            addLiquidityUrl={addLiquidityUrl}
            stakingNote={
              farm.pid === 0 && stakingDisabled
                ? t('Staking is disabled (0X rewards). Add JNTo–USDT liquidity before staking is available.')
                : undefined
            }
          />
        )}
      </ExpandingWrapper>
    </StyledCard>
  )
}

export default FarmCard
