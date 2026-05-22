import React from 'react'
import styled from 'styled-components'
import useLastTruthy from 'hooks/useLast'
import { AdvancedSwapDetails, AdvancedSwapDetailsProps } from './AdvancedSwapDetails'

const DetailsCenter = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 16px;
`

const AdvancedDetailsFooter = styled.div`
  padding: 16px 0;
  width: 100%;
  max-width: 400px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.invertedContrast};
`

export default function AdvancedSwapDetailsDropdown({ trade, ...rest }: AdvancedSwapDetailsProps) {
  const lastTrade = useLastTruthy(trade)
  const activeTrade = trade ?? lastTrade

  if (!activeTrade) {
    return null
  }

  return (
    <DetailsCenter>
      <AdvancedDetailsFooter>
        <AdvancedSwapDetails {...rest} trade={activeTrade} />
      </AdvancedDetailsFooter>
    </DetailsCenter>
  )
}
