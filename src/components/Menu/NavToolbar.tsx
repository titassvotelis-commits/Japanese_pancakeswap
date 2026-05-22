import React from 'react'
import styled from 'styled-components'
import { Flex } from '@pancakeswap/uikit'
import GlobalSettings from './GlobalSettings'

const Toolbar = styled(Flex)`
  align-items: center;
  height: 100%;
  flex-shrink: 0;
`

const NavToolbar = () => (
  <Toolbar>
    <GlobalSettings />
  </Toolbar>
)

export default NavToolbar
