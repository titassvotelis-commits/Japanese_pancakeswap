import React from 'react'
import styled from 'styled-components'
import { Helmet } from 'react-helmet-async'
import { ChevronDownIcon } from '@pancakeswap/uikit'
import LandingHero from './components/LandingHero'
import LandingFeatures from './components/LandingFeatures'
import { useTranslation } from 'contexts/Localization'
import { NAV_BREAKPOINTS } from 'components/Menu/navHeaderTheme'

const PageWrap = styled.div`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: clip;
  box-sizing: border-box;
`

const ScrollHint = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 8px;
  margin: 0 auto 8px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSubtle};
  cursor: pointer;
  animation: landing-bounce 1.5s ease-in-out infinite;

  @media screen and (max-width: ${NAV_BREAKPOINTS.lg}px) {
    display: none;
  }

  @keyframes landing-bounce {
    0%,
    100% {
      opacity: 0.45;
      transform: translateY(0);
    }
    50% {
      opacity: 1;
      transform: translateY(8px);
    }
  }

  &:hover {
    color: ${({ theme }) => (theme.isDark ? '#c8b6ff' : theme.colors.primary)};
  }
`

const Landing: React.FC = () => {
  const { t } = useTranslation()
  const scrollToFeatures = () => {
    document.getElementById('landing-features')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <PageWrap>
      <Helmet>
        <title>{t('Optimus Swap — Trade JNTo on BNB Chain')}</title>
        <meta
          name="description"
          content={t(
            'Swap, farm, and earn with JNToken (JNTo) on Optimus Swap — the home of JNTo on BNB Smart Chain.',
          )}
        />
      </Helmet>
      <LandingHero />
      <ScrollHint type="button" onClick={scrollToFeatures} aria-label={t('Scroll to features')}>
        <ChevronDownIcon width="32px" />
      </ScrollHint>
      <LandingFeatures />
    </PageWrap>
  )
}

export default Landing
