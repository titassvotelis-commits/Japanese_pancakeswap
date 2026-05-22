import React, { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { Heading, Card, CardBody, Button, Flex } from '@pancakeswap/uikit'
import { useWeb3React } from '@web3-react/core'
import useTokenBalance from 'hooks/useTokenBalance'
import useFarmsWithBalance from 'views/Home/hooks/useFarmsWithBalance'
import { getCakeAddress } from 'utils/addressHelpers'
import { useTranslation } from 'contexts/Localization'
import useToast from 'hooks/useToast'
import { useMasterchef } from 'hooks/useContract'
import { harvestFarm } from 'utils/calls'
import UnlockButton from 'components/UnlockButton'
import tokens from 'config/constants/tokens'
import { usePriceCakeBusd } from 'state/farms/hooks'
import { getBalanceNumber } from 'utils/formatBalance'
import useRegisterTokenInMetamask from 'hooks/useRegisterTokenInMetamask'
import CakeHarvestBalance from './CakeHarvestBalance'
import CakeWalletBalance from './CakeWalletBalance'
import { BRAND } from 'theme/colors'

const StyledFarmStakingCard = styled(Card)`
  min-height: 376px;
  margin-left: 6px;
  margin-right: 6px;
  background: ${BRAND.deepest};
  >div{
    background: none;
  }
`

const StyledCardBody = styled(CardBody)`
  background-size: 328px;
  background-repeat: no-repeat;
  background-position: top right;
`

const Block = styled.div`
  margin-bottom: 16px;
`

const CardImage = styled.img`
  margin-bottom: 16px;
`

const Label = styled.div`
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 14px;
`

const Actions = styled.div`
  margin-top: 24px;
`

const FarmedStakingCard = () => {
  const [pendingTx, setPendingTx] = useState(false)
  const { account } = useWeb3React()
  const { t } = useTranslation()
  const metaBalance = useTokenBalance(getCakeAddress())
  const metaUserBalance = metaBalance.balance ? getBalanceNumber(metaBalance.balance, tokens.jnto.decimals) : 0
  const metaPrice = usePriceCakeBusd().toNumber()

  const { toastSuccess, toastError } = useToast()
  const addTokenToMetamask = useRegisterTokenInMetamask()
  const { farmsWithStakedBalance, earningsSum: farmEarningsSum } = useFarmsWithBalance()
  const numFarmsToCollect = farmsWithStakedBalance.filter((value) => value.pid !== 0).length
  const masterChefContract = useMasterchef()
  const harvestAllFarms = useCallback(async () => {
    setPendingTx(true)
    // eslint-disable-next-line no-restricted-syntax
    for (const farmWithBalance of farmsWithStakedBalance) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await harvestFarm(masterChefContract, farmWithBalance.pid)
        toastSuccess(
          `${t('Harvested')}!`,
          t('Your %symbol% earnings have been sent to your wallet!', { symbol: 'JNTo' }),
        )
      } catch (error) {
        toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
      }
    }
    setPendingTx(false)
  }, [farmsWithStakedBalance, masterChefContract, toastSuccess, toastError, t])

  return (
    <StyledFarmStakingCard>
      <StyledCardBody>
        <Heading scale="xl" mb="24px" textAlign="center">
          {t('Farms & Staking')}
        </Heading>
        <Flex style={{ verticalAlign: 'center', justifyContent: 'space-between' }}>
          <CardImage src="https://optimuswap.io/images/logo.png" alt="cake logo" width={32} height={32} />
          <Button
            variant="text"
            style={{ height: 36, backgroundColor: '#FFF', color: '#262626' }}
            onClick={() => addTokenToMetamask(tokens.jnto.address, tokens.jnto.symbol, tokens.jnto.decimals)}
          >
            +
            <img
              src="https://optimuswap.io/images/meta-mask.png"
              alt="MetaMask Logo"
              style={{ width: 16, height: 16, marginLeft: 4 }}
            />
          </Button>
        </Flex>
        <Block>
          <Label>{t('JNTo to Harvest')}</Label>
          <Flex justifyContent="space-between">
            <CakeHarvestBalance earningsSum={farmEarningsSum} />
            <Heading>~${(metaPrice * farmEarningsSum).toFixed(2)}</Heading>
          </Flex>
        </Block>
        <Block>
          <Label>{t('JNTo in Wallet')}</Label>
          <Flex justifyContent="space-between">
            <CakeWalletBalance metaBalance={metaUserBalance} />
            <Heading>~${(metaPrice * metaUserBalance).toFixed(2)}</Heading>
          </Flex>
        </Block>
        <Actions>
          {account ? (
            <Flex>
              <Button
                mr="8px"
                id="harvest-all"
                disabled={numFarmsToCollect <= 0 || pendingTx}
                onClick={harvestAllFarms}
              >
                {pendingTx ? t('Collecting JNTo') : t(`Harvest all (${numFarmsToCollect})`)}
              </Button>
              <Button target="_blank" as="a" href="/swap">
                {t('Buy JNTo')}
              </Button>
            </Flex>
          ) : (
            <UnlockButton />
          )}
        </Actions>
      </StyledCardBody>
    </StyledFarmStakingCard>
  )
}

export default FarmedStakingCard
