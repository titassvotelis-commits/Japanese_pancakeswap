import { useContext } from 'react'
import { ThemeContext as StyledThemeContext } from 'styled-components'
import { useThemeManager } from 'state/user/hooks'

const useTheme = () => {
  const [isDark, toggleTheme, setTheme] = useThemeManager()
  const theme = useContext(StyledThemeContext)
  return { isDark, theme, toggleTheme, setTheme }
}

export default useTheme
