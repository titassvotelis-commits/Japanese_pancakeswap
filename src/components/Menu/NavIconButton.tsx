import styled from 'styled-components'
import { IconButton } from '@pancakeswap/uikit'

/** Consistent nav icon control (language, settings). */
const NavIconButton = styled(IconButton)`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  transition: background-color 0.15s ease;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.tertiary};
  }
`

export default NavIconButton
