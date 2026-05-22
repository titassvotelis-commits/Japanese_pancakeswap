import React, { useState } from 'react'
import styled from 'styled-components'
import { Text, Button, Input, Flex, Box } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { useUserSlippageTolerance, useUserTransactionTTL } from 'state/user/hooks'
import QuestionHelper from '../../QuestionHelper'

const SlippageRow = styled(Flex)`
  width: 100%;
  flex-wrap: nowrap;
  align-items: center;
  gap: 4px;

  > button {
    flex: 1 1 0;
    min-width: 0;
    margin: 0 !important;
    white-space: nowrap;
    font-size: 12px;
    padding-left: 4px;
    padding-right: 4px;
  }
`

const CustomSlippageWrap = styled(Flex)`
  flex: 0 0 84px;
  align-items: center;
  gap: 2px;
  min-width: 0;
`

const DeadlineRow = styled(Flex)`
  width: 100%;
  flex-wrap: nowrap;
  align-items: center;
  gap: 4px;

  > button {
    flex: 1 1 0;
    min-width: 0;
    margin: 0 !important;
    white-space: nowrap;
    font-size: 12px;
    padding-left: 4px;
    padding-right: 4px;
  }
`

const CustomDeadlineWrap = styled(Flex)`
  flex: 0 0 88px;
  align-items: center;
  gap: 4px;
  min-width: 0;
`

const DEADLINE_PRESETS = [
  { minutes: 10, seconds: 10 * 60 },
  { minutes: 20, seconds: 20 * 60 },
  { minutes: 30, seconds: 30 * 60 },
] as const

enum SlippageError {
  InvalidInput = 'InvalidInput',
  RiskyLow = 'RiskyLow',
  RiskyHigh = 'RiskyHigh',
}

enum DeadlineError {
  InvalidInput = 'InvalidInput',
}

const SlippageTabs = () => {
  const [userSlippageTolerance, setUserSlippageTolerance] = useUserSlippageTolerance()
  const [ttl, setTtl] = useUserTransactionTTL()
  const [slippageInput, setSlippageInput] = useState('')
  const [deadlineInput, setDeadlineInput] = useState('')

  const { t } = useTranslation()

  const slippageInputIsValid =
    slippageInput === '' || (userSlippageTolerance / 100).toFixed(2) === Number.parseFloat(slippageInput).toFixed(2)
  const deadlineInputIsValid = deadlineInput === '' || (ttl / 60).toString() === deadlineInput

  let slippageError: SlippageError | undefined
  if (slippageInput !== '' && !slippageInputIsValid) {
    slippageError = SlippageError.InvalidInput
  } else if (slippageInputIsValid && userSlippageTolerance < 50) {
    slippageError = SlippageError.RiskyLow
  } else if (slippageInputIsValid && userSlippageTolerance > 500) {
    slippageError = SlippageError.RiskyHigh
  } else {
    slippageError = undefined
  }

  let deadlineError: DeadlineError | undefined
  if (deadlineInput !== '' && !deadlineInputIsValid) {
    deadlineError = DeadlineError.InvalidInput
  } else {
    deadlineError = undefined
  }

  const parseCustomSlippage = (value: string) => {
    setSlippageInput(value)

    try {
      const valueAsIntFromRoundedFloat = Number.parseInt((Number.parseFloat(value) * 100).toString())
      if (!Number.isNaN(valueAsIntFromRoundedFloat) && valueAsIntFromRoundedFloat < 5000) {
        setUserSlippageTolerance(valueAsIntFromRoundedFloat)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const parseCustomDeadline = (value: string) => {
    setDeadlineInput(value)

    try {
      const valueAsInt: number = Number.parseInt(value) * 60
      if (!Number.isNaN(valueAsInt) && valueAsInt > 0) {
        setTtl(valueAsInt)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Flex flexDirection="column">
      <Flex flexDirection="column" mb="24px">
        <Flex mb="12px">
          <Text>{t('Slippage Tolerance')}</Text>
          <QuestionHelper
            text={t(
              'Setting a high slippage tolerance can help transactions succeed, but you may not get such a good price. Use with caution.',
            )}
            placement="top-start"
            ml="4px"
          />
        </Flex>
        <SlippageRow>
          <Button
            scale="sm"
            onClick={() => {
              setSlippageInput('')
              setUserSlippageTolerance(10)
            }}
            variant={userSlippageTolerance === 10 ? 'secondary' : 'tertiary'}
          >
            0.1%
          </Button>
          <Button
            scale="sm"
            onClick={() => {
              setSlippageInput('')
              setUserSlippageTolerance(50)
            }}
            variant={userSlippageTolerance === 50 ? 'secondary' : 'tertiary'}
          >
            0.5%
          </Button>
          <Button
            scale="sm"
            onClick={() => {
              setSlippageInput('')
              setUserSlippageTolerance(100)
            }}
            variant={userSlippageTolerance === 100 ? 'secondary' : 'tertiary'}
          >
            1.0%
          </Button>
          <CustomSlippageWrap>
            <Box width="100%">
              <Input
                scale="sm"
                placeholder={(userSlippageTolerance / 100).toFixed(2)}
                value={slippageInput}
                onBlur={() => {
                  parseCustomSlippage((userSlippageTolerance / 100).toFixed(2))
                }}
                onChange={(e) => parseCustomSlippage(e.target.value)}
                isWarning={!slippageInputIsValid}
                isSuccess={![10, 50, 100].includes(userSlippageTolerance)}
              />
            </Box>
            <Text color="secondary" bold fontSize="12px">
              %
            </Text>
          </CustomSlippageWrap>
        </SlippageRow>
        {!!slippageError && (
          <Text fontSize="14px" color={slippageError === SlippageError.InvalidInput ? 'red' : '#F3841E'} mt="8px">
            {slippageError === SlippageError.InvalidInput
              ? t('Enter a valid slippage percentage')
              : slippageError === SlippageError.RiskyLow
              ? t('Your transaction may fail')
              : t('Your transaction may be frontrun')}
          </Text>
        )}
      </Flex>
      <Flex flexDirection="column" mb="24px">
        <Flex mb="12px" alignItems="center">
          <Text>{t('Tx deadline (mins)')}</Text>
          <QuestionHelper
            text={t('Your transaction will revert if it is left confirming for longer than this time.')}
            placement="top-start"
            ml="4px"
          />
        </Flex>
        <DeadlineRow>
          {DEADLINE_PRESETS.map(({ minutes, seconds }) => (
            <Button
              key={seconds}
              scale="sm"
              onClick={() => {
                setDeadlineInput('')
                setTtl(seconds)
              }}
              variant={ttl === seconds ? 'secondary' : 'tertiary'}
            >
              {minutes}
            </Button>
          ))}
          <CustomDeadlineWrap>
            <Box width="100%">
              <Input
                scale="sm"
                inputMode="numeric"
                color={deadlineError ? 'red' : undefined}
                onBlur={() => {
                  parseCustomDeadline((ttl / 60).toString())
                }}
                placeholder={(ttl / 60).toString()}
                value={deadlineInput}
                onChange={(e) => parseCustomDeadline(e.target.value)}
                isSuccess={!DEADLINE_PRESETS.some((p) => p.seconds === ttl)}
              />
            </Box>
            <Text color="secondary" bold fontSize="12px">
              min
            </Text>
          </CustomDeadlineWrap>
        </DeadlineRow>
      </Flex>
    </Flex>
  )
}

export default SlippageTabs
