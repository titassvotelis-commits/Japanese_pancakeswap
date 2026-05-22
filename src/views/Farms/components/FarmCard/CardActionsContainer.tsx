import React, { useState, useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { Button, Text } from '@pancakeswap/uikit'
import { Action, ActionBlock, ActionTitles } from './styles'
import { getAddress } from 'utils/addressHelpers'
import { useAppDispatch } from 'state'
import { fetchFarmUserDataAsync } from 'state/farms'
import { DeserializedFarm } from 'state/types'
import { useTranslation } from 'contexts/Localization'
import { useERC20 } from 'hooks/useContract'
import ConnectWalletButton from 'components/ConnectWalletButton'
import StakeAction from './StakeAction'
import HarvestAction from './HarvestAction'
import useApproveFarm from '../../hooks/useApproveFarm'

export interface FarmWithStakedValue extends DeserializedFarm {
  apr?: number
}

interface FarmCardActionsProps {
  farm: FarmWithStakedValue
  account?: string
  addLiquidityUrl?: string
  cakePrice?: BigNumber
  lpLabel?: string
  stakingDisabled?: boolean
}

const CardActions: React.FC<FarmCardActionsProps> = ({
  farm,
  account,
  addLiquidityUrl,
  cakePrice,
  lpLabel,
  stakingDisabled,
}) => {
  const { t } = useTranslation()
  const [requestedApproval, setRequestedApproval] = useState(false)
  const { pid, lpAddresses } = farm
  const { allowance, tokenBalance, stakedBalance, earnings } = farm.userData || {}
  const lpAddress = farm.isTokenOnly ? farm.token.address : getAddress(lpAddresses)
  const isApproved = account && allowance && allowance.isGreaterThan(0)
  const dispatch = useAppDispatch()

  const lpContract = useERC20(lpAddress)

  const { onApprove } = useApproveFarm(lpContract)

  const handleApprove = useCallback(async () => {
    try {
      setRequestedApproval(true)
      await onApprove()
      dispatch(fetchFarmUserDataAsync({ account, pids: [pid] }))
      setRequestedApproval(false)
    } catch (e) {
      console.error(e)
    }
  }, [onApprove, dispatch, account, pid])

  const renderApprovalOrStakeButton = () => {
    return isApproved ? (
      <StakeAction
        stakedBalance={stakedBalance}
        tokenBalance={tokenBalance}
        tokenName={farm.lpSymbol}
        pid={pid}
        apr={farm.apr}
        lpLabel={lpLabel}
        cakePrice={cakePrice}
        addLiquidityUrl={addLiquidityUrl}
        isTokenOnly={farm.isTokenOnly}
        decimals={farm.isTokenOnly ? farm.token.decimals : 18}
        isWithdrawable={farm.isWithdrawable}
        lockingPeriod={farm.lockingPeriod}
        userStakedTime={farm.userData.userStakedTime}
        stakingDisabled={stakingDisabled}
      />
    ) : (
      <Button mt="8px" width="100%" disabled={requestedApproval} onClick={handleApprove}>
        {t('Enable Contract')}
      </Button>
    )
  }
  
  const stakedLabel = lpLabel || farm.lpSymbol

  return (
    <Action>
      <ActionBlock>
        <ActionTitles>
          <Text bold textTransform="uppercase" color="secondary" fontSize="12px">
            JNTo
          </Text>
          <Text bold textTransform="uppercase" color="textSubtle" fontSize="12px">
            {t('Earned')}
          </Text>
        </ActionTitles>
        <HarvestAction earnings={earnings} pid={pid} decimals={farm.token.decimals} />
      </ActionBlock>
      <ActionBlock>
        <ActionTitles>
          <Text bold textTransform="uppercase" color="secondary" fontSize="12px">
            {stakedLabel}
          </Text>
          <Text bold textTransform="uppercase" color="textSubtle" fontSize="12px">
            {t('Staked')}
          </Text>
        </ActionTitles>
        {!account ? <ConnectWalletButton mt="8px" width="100%" /> : renderApprovalOrStakeButton()}
      </ActionBlock>
    </Action>
  )
}

export default CardActions
