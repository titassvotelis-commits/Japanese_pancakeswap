import React, { useMemo } from 'react'
import styled, { useTheme } from 'styled-components'
import { Globe } from 'react-feather'
import { BaseMenu, Box, Flex, IconButton } from '@pancakeswap/uikit'
import type { Language } from '@pancakeswap/uikit'
import { languageList } from 'config/localization/languages'
import { useTranslation } from 'contexts/Localization'

const PANEL_WIDTH = 198
const PANEL_MAX_HEIGHT = 400

const MenuPanel = styled(Box)`
  width: ${PANEL_WIDTH}px;
  max-height: ${PANEL_MAX_HEIGHT}px;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.default};
  box-shadow: ${({ theme }) => theme.shadows.tooltip};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  padding: 8px 0;
`

const LangButton = styled.button<{ $active?: boolean }>`
  border: 0;
  outline: 0;
  cursor: pointer;
  background: transparent;
  padding: 10px 16px;
  width: 100%;
  font-size: 16px;
  line-height: 1.25;
  text-align: left;
  color: ${({ theme, $active }) => ($active ? theme.colors.secondary : theme.colors.text)};
  font-weight: ${({ $active }) => ($active ? 600 : 400)};

  &:hover {
    background-color: ${({ theme }) => theme.colors.tertiary};
  }
`

const LanguageNavMenu = () => {
  const theme = useTheme()
  const { t, currentLanguage, setLanguage } = useTranslation()

  const sortedLangs = useMemo(
    () => [...languageList].sort((a, b) => a.language.localeCompare(b.language, undefined, { sensitivity: 'base' })),
    [],
  )

  const onPick = (lang: Language, close: () => void) => {
    void setLanguage(lang)
    close()
  }

  return (
    <Flex alignItems="center" height="100%" mr="8px" flexShrink={0}>
      <BaseMenu
        component={
          <IconButton variant="text" scale="sm" id="nav-language-menu-button" aria-label={t('Language')}>
            <Globe size={22} strokeWidth={2} color={theme.colors.primary} aria-hidden />
          </IconButton>
        }
        options={{
          placement: 'bottom-end',
          offset: [0, 8],
          padding: { top: 8, bottom: 8, left: 16, right: 16 },
        }}
      >
        {({ close }) => (
          <MenuPanel>
            {sortedLangs.map((lang) => (
              <LangButton
                key={lang.locale}
                type="button"
                $active={lang.locale === currentLanguage.locale}
                onClick={() => onPick(lang, close)}
              >
                {lang.language}
              </LangButton>
            ))}
          </MenuPanel>
        )}
      </BaseMenu>
    </Flex>
  )
}

export default LanguageNavMenu
