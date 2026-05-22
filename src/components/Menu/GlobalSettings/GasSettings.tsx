import React, { useMemo } from 'react'
import styled from 'styled-components'
import { Flex, ButtonMenu, ButtonMenuItem, Text } from '@pancakeswap/uikit'
import QuestionHelper from 'components/QuestionHelper'
import { useTranslation } from 'contexts/Localization'
import { GAS_PRICE_GWEI, GAS_PRICE } from 'state/user/hooks/helpers'
import { useGasPriceManager } from 'state/user/hooks'

const GasMenuWrap = styled.div`
  width: 100%;

  & > div {
    width: 100%;
    flex-wrap: nowrap;
  }

  button {
    flex: 1 1 0;
    min-width: 0;
    white-space: nowrap;
    font-size: 12px;
    padding-left: 6px;
    padding-right: 6px;
  }
`

const GAS_OPTIONS = [
  { gwei: GAS_PRICE_GWEI.default, labelKey: 'Standard (%gasPrice%)', price: GAS_PRICE.default },
  { gwei: GAS_PRICE_GWEI.fast, labelKey: 'Fast (%gasPrice%)', price: GAS_PRICE.fast },
  { gwei: GAS_PRICE_GWEI.instant, labelKey: 'Instant (%gasPrice%)', price: GAS_PRICE.instant },
] as const

const GasSettings = () => {
  const { t } = useTranslation()
  const [gasPrice, setGasPrice] = useGasPriceManager()

  const activeIndex = useMemo(() => {
    const idx = GAS_OPTIONS.findIndex((opt) => opt.gwei === gasPrice)
    return idx >= 0 ? idx : 0
  }, [gasPrice])

  const handleItemClick = (index: number) => {
    const option = GAS_OPTIONS[index]
    if (option) {
      setGasPrice(option.gwei)
    }
  }

  return (
    <Flex flexDirection="column">
      <Flex mb="12px" alignItems="center">
        <Text>{t('Default Transaction Speed (GWEI)')}</Text>
        <QuestionHelper
          text={t(
            'Adjusts the gas price (transaction fee) for your transaction. Higher GWEI = higher speed = higher fees',
          )}
          placement="top-start"
          ml="4px"
        />
      </Flex>
      <GasMenuWrap>
        <ButtonMenu
          scale="sm"
          variant="subtle"
          fullWidth
          activeIndex={activeIndex}
          onItemClick={handleItemClick}
        >
          {GAS_OPTIONS.map(({ labelKey, price, gwei }) => (
            <ButtonMenuItem key={gwei}>{t(labelKey, { gasPrice: price })}</ButtonMenuItem>
          ))}
        </ButtonMenu>
      </GasMenuWrap>
    </Flex>
  )
}

export default GasSettings
