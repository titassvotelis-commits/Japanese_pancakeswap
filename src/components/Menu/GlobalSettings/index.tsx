import React from 'react'
import styled, { useTheme } from 'styled-components'
import { Flex, IconButton, CogIcon, useModal } from '@pancakeswap/uikit'
import SettingsModal from './SettingsModal'
import { closeNavLogoMkDropdown } from '../closeNavLogoMkDropdown'
import { NAV_HEADER } from '../navHeaderTheme'

const SettingsWrap = styled(Flex)`
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const GlobalSettings = () => {
  const theme = useTheme()
  const [onPresentSettingsModal] = useModal(<SettingsModal />, true, false, 'nav-settings-modal')

  return (
    <SettingsWrap>
      <IconButton
        onClick={() => {
          closeNavLogoMkDropdown()
          onPresentSettingsModal()
        }}
        variant="text"
        scale="sm"
        id="open-settings-dialog-button"
      >
        <CogIcon
          height={20}
          width={20}
          color={theme.isDark ? NAV_HEADER.settingsIconDark : 'secondary'}
        />
      </IconButton>
    </SettingsWrap>
  )
}

export default GlobalSettings
