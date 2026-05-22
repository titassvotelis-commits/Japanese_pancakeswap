import React from 'react'
import styled from 'styled-components'
import { Text, Button, Input, InputProps, Flex, Link } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { parseUnits } from 'ethers/lib/utils'
import { formatBigNumberToFixed } from 'utils/formatBalance'

interface ModalInputProps {
  max: string
  symbol: string
  onSelectMax?: () => void
  onChange: (e: React.FormEvent<HTMLInputElement>) => void
  placeholder?: string
  value: string
  addLiquidityUrl?: string
  inputTitle?: string
  decimals?: number
}

const getBoxShadow = ({ isWarning = false, theme }) => {
  if (isWarning) {
    return theme.shadows.warning
  }

  return theme.shadows.inset
}

const StyledTokenInput = styled.div<InputProps>`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.input};
  border-radius: 16px;
  box-shadow: ${getBoxShadow};
  color: ${({ theme }) => theme.colors.text};
  padding: 8px 16px;
  width: 100%;
`

const HeaderRow = styled(Flex)`
  align-items: center;

  & > * + * {
    margin-left: 8px;
  }
`

const InputRow = styled(Flex)`
  margin-top: 8px;
  min-width: 0;
  align-items: center;

  & > * + * {
    margin-left: 8px;
  }
`

const TitleText = styled(Text)`
  flex-shrink: 0;
`

const MaxButton = styled(Button)`
  flex-shrink: 0;
`

const StyledInput = styled(Input)`
  box-shadow: none;
  flex: 1;
  min-width: 0;
  width: 100%;
  margin: 0;
  padding: 0 8px;
  border: none;
`

const SymbolText = styled(Text)`
  flex-shrink: 0;
  white-space: nowrap;
  max-width: 42%;
  overflow: hidden;
  text-overflow: ellipsis;
`

const BalanceText = styled(Text)`
  flex-shrink: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
  max-width: 65%;
`

const StyledErrorMessage = styled(Text)`
  position: absolute;
  bottom: -22px;
  a {
    display: inline;
  }
`

const ModalInput: React.FC<ModalInputProps> = ({
  max,
  symbol,
  onChange,
  onSelectMax,
  value,
  addLiquidityUrl,
  inputTitle,
  decimals = 18,
}) => {
  const { t } = useTranslation()
  const isBalanceZero = max === '0' || !max

  const displayBalance = (balance: string) => {
    if (isBalanceZero) {
      return '0'
    }

    const balanceUnits = parseUnits(balance, decimals)
    return formatBigNumberToFixed(balanceUnits, 6, decimals)
  }

  return (
    <div style={{ position: 'relative' }}>
      <StyledTokenInput isWarning={isBalanceZero}>
        <HeaderRow justifyContent="space-between">
          <TitleText fontSize="14px">{inputTitle}</TitleText>
          <BalanceText fontSize="14px" color="textSubtle">
            {t('Balance: %balance%', { balance: displayBalance(max) })}
          </BalanceText>
        </HeaderRow>
        <InputRow>
          <StyledInput
            pattern={`^[0-9]*[.,]?[0-9]{0,${decimals}}$`}
            inputMode="decimal"
            step="any"
            min="0"
            onChange={onChange}
            placeholder="0"
            value={value}
          />
          <MaxButton scale="sm" onClick={onSelectMax}>
            {t('Max')}
          </MaxButton>
          <SymbolText fontSize="14px" title={symbol}>
            {symbol}
          </SymbolText>
        </InputRow>
      </StyledTokenInput>
      {isBalanceZero && (
        <StyledErrorMessage fontSize="14px" color="failure">
          {t('No tokens to stake')}:{' '}
          <Link fontSize="14px" bold={false} href={addLiquidityUrl} external color="failure">
            {t('Get %symbol%', { symbol })}
          </Link>
        </StyledErrorMessage>
      )}
    </div>
  )
}

export default ModalInput
