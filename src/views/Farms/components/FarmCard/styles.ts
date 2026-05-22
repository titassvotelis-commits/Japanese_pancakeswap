import styled from 'styled-components'
import { Flex } from '@pancakeswap/uikit'

export const Action = styled.div`
  padding-top: 16px;
`

export const ActionBlock = styled.div`
  &:not(:first-child) {
    margin-top: 12px;
  }
`

export const ActionTitles = styled(Flex)`
  flex-wrap: wrap;
  margin-bottom: 4px;
  gap: 4px;
`

export const ActionContent = styled(Flex)`
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 8px;
`

export const ValueColumn = styled(Flex)`
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
`

export const ButtonColumn = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
`

export const IconButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    width: 20px;
  }
`
