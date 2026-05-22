import { createGlobalStyle } from 'styled-components'

/** Bold + accent color for the top nav link that matches the current route. */
const NavMenuActiveStyle = createGlobalStyle<{ $activeHref?: string }>`
  ${({ $activeHref, theme }) =>
    $activeHref
      ? `
    #root nav > div:first-child a[href="${$activeHref}"] {
      font-weight: 700 !important;
      color: ${theme.colors.secondary} !important;
    }
  `
      : ''}
`

export default NavMenuActiveStyle
