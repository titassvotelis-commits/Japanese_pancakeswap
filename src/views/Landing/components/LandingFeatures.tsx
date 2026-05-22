import React from 'react'
import styled from 'styled-components'
import { Text } from '@pancakeswap/uikit'
import history from 'routerHistory'
import tokens from 'config/constants/tokens'
import { JNTO_STAKE, JNTO_SWAP_GET } from 'config/constants/promoAds'
import { isAddress } from 'utils'
import { NAV_BREAKPOINTS } from 'components/Menu/navHeaderTheme'

const Section = styled.section`
  padding: 48px 24px 80px;
  max-width: 1100px;
  margin: 0 auto;

  @media screen and (max-width: ${NAV_BREAKPOINTS.lg}px) {
    padding: 32px 16px 64px;
    padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px));
  }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media screen and (max-width: ${NAV_BREAKPOINTS.md}px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`

const FeatureCard = styled.button`
  text-align: left;
  padding: 24px;
  border-radius: 20px;
  width: 100%;

  @media screen and (max-width: ${NAV_BREAKPOINTS.lg}px) {
    padding: 20px 18px;
    border-radius: 16px;
    min-height: 88px;
  }
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => (theme.isDark ? 'rgba(36, 34, 48, 0.6)' : theme.colors.backgroundAlt)};
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease, background 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => (theme.isDark ? 'rgba(200, 182, 255, 0.35)' : theme.colors.primary)};
    background: ${({ theme }) => (theme.isDark ? 'rgba(48, 44, 62, 0.85)' : theme.colors.backgroundAlt2)};
    transform: translateY(-2px);
  }
`

const FeatureTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`

const FeatureDesc = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSubtle};
`

const jntoAddress = isAddress(tokens.jnto.address) || tokens.jnto.address

const FEATURES = [
  {
    title: 'Swap JNTo',
    desc: 'Trade BNB, stablecoins, and more into JNToken with optimized routing.',
    href: JNTO_SWAP_GET,
  },
  {
    title: 'Farm & Earn',
    desc: 'Stake LP tokens and harvest JNTo rewards across Optimus farms.',
    href: JNTO_STAKE,
  },
  {
    title: 'Add Liquidity',
    desc: 'Provide BNB–JNTo liquidity and earn fees from every swap.',
    href: `/add/BNB/${jntoAddress}`,
  },
]

const LandingFeatures: React.FC = () => (
  <Section id="landing-features">
    <Text fontSize="13px" fontWeight={700} color="textSubtle" textTransform="uppercase" mb="16px">
      Explore Optimus
    </Text>
    <Grid>
      {FEATURES.map((f) => (
        <FeatureCard key={f.title} type="button" onClick={() => history.push(f.href)}>
          <FeatureTitle>{f.title}</FeatureTitle>
          <FeatureDesc>{f.desc}</FeatureDesc>
        </FeatureCard>
      ))}
    </Grid>
  </Section>
)

export default LandingFeatures
