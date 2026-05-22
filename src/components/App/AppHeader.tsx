import React from 'react'
import styled from 'styled-components'
import { Text, Flex, Heading, IconButton, ArrowBackIcon, NotificationDot, ChartIcon } from '@pancakeswap/uikit'
import { Link } from 'react-router-dom'
import { useExpertModeManager } from 'state/user/hooks'
import GlobalSettings from 'components/Menu/GlobalSettings'
import Transactions from './Transactions'
import QuestionHelper from '../QuestionHelper'
import { NAV_BREAKPOINTS } from '../Menu/navHeaderTheme'

interface Props {
  title: string
  subtitle: string
  helper?: string
  backTo?: string
  noConfig?: boolean
  chartToggle?: {
    isOpen: boolean
    onToggle: () => void
  }
}

const AppHeaderContainer = styled(Flex)`
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  width: 100%;
  flex-shrink: 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  gap: 8px;

  @media screen and (max-width: ${NAV_BREAKPOINTS.md}px) {
    padding: 16px;
    flex-wrap: wrap;
  }

  @media screen and (max-width: ${NAV_BREAKPOINTS.sm}px) {
    padding: 14px 12px;

    h2 {
      font-size: 20px !important;
    }
  }
`

const AppHeader: React.FC<Props> = ({ title, subtitle, helper, backTo, noConfig = false, chartToggle }) => {
  const [expertMode] = useExpertModeManager()

  return (
    <AppHeaderContainer>
      <Flex alignItems="center" mr={noConfig ? 0 : '16px'}>
        {backTo && (
          <IconButton as={Link} to={backTo}>
            <ArrowBackIcon width="32px" />
          </IconButton>
        )}
        <Flex flexDirection="column">
          <Heading as="h2" mb="8px">
            {title}
          </Heading>
          <Flex alignItems="center">
            {helper && <QuestionHelper text={helper} mr="4px" placement="top-start" />}
            <Text color="textSubtle" fontSize="14px">
              {subtitle}
            </Text>
          </Flex>
        </Flex>
      </Flex>
      {!noConfig && (
        <Flex alignItems="center">
          {chartToggle && (
            <IconButton
              variant="text"
              onClick={chartToggle.onToggle}
              aria-label={chartToggle.isOpen ? 'Hide chart' : 'Show chart'}
              mr="8px"
            >
              <ChartIcon color={chartToggle.isOpen ? 'primary' : 'textSubtle'} />
            </IconButton>
          )}
          <NotificationDot show={expertMode}>
            <GlobalSettings />
          </NotificationDot>
          <Transactions />
        </Flex>
      )}
    </AppHeaderContainer>
  )
}

export default AppHeader
