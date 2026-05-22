import React from 'react'
import styled from 'styled-components'
import { NAV_BODY_OFFSET, NAV_BREAKPOINTS } from 'components/Menu/navHeaderTheme'
import LandingTokenMarks from './LandingTokenMarks'
import LandingSwapCard from './LandingSwapCard'

const Page = styled.div`
  min-height: calc(100vh - ${NAV_BODY_OFFSET}px);
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  background: ${({ theme }) =>
    theme.isDark
      ? 'linear-gradient(165deg, #1a1528 0%, #1c1633 35%, #16141f 100%)'
      : 'linear-gradient(165deg, #f8f6ff 0%, #eef3fc 42%, #e4edf8 100%)'};

  @media screen and (max-width: ${NAV_BREAKPOINTS.lg}px) {
    min-height: auto;
  }
`

const Hero = styled.section`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 48px 24px 40px;

  @media screen and (max-width: ${NAV_BREAKPOINTS.lg}px) {
    align-items: flex-start;
    padding: 20px 16px 28px;
    padding-top: max(20px, env(safe-area-inset-top));
  }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 56px;
  width: 100%;
  max-width: 1280px;
  min-width: 0;
  box-sizing: border-box;

  @media screen and (max-width: ${NAV_BREAKPOINTS.lg}px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
    text-align: center;
  }
`

const CopyCol = styled.div`
  max-width: 640px;
  min-width: 0;

  @media screen and (max-width: ${NAV_BREAKPOINTS.lg}px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 100%;
    width: 100%;
    min-width: 0;
  }
`

const Headline = styled.h1`
  margin: 0;
  font-size: clamp(3rem, 7vw, 5rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.04em;

  @media screen and (max-width: ${NAV_BREAKPOINTS.lg}px) {
    font-size: clamp(2rem, 9vw, 3.25rem);
    line-height: 1.06;
    max-width: 100%;
  }
`

const HeadlineLight = styled.span`
  display: block;
  color: ${({ theme }) => theme.colors.text};
`

const HeadlineAccent = styled.span`
  display: block;
  color: ${({ theme }) => (theme.isDark ? '#c8b6ff' : '#7c5ce0')};
`

const Subhead = styled.p`
  margin: 28px 0 0;
  font-size: clamp(1.35rem, 3vw, 1.85rem);
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.3;
  letter-spacing: -0.02em;

  @media screen and (max-width: ${NAV_BREAKPOINTS.lg}px) {
    margin-top: 12px;
    font-size: clamp(1.05rem, 4.2vw, 1.35rem);
    line-height: 1.35;
    max-width: 100%;
    padding: 0 4px;
  }
`

const WidgetCol = styled.div`
  display: flex;
  justify-content: center;
  min-width: 0;

  @media screen and (max-width: ${NAV_BREAKPOINTS.lg}px) {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    padding: 0;
    box-sizing: border-box;
  }
`

const LandingHero: React.FC = () => (
  <Page>
    <Hero>
      <Grid>
        <CopyCol>
          <Headline>
            <HeadlineLight>Everyone&apos;s</HeadlineLight>
            <HeadlineAccent>Favorite JNTo DEX</HeadlineAccent>
          </Headline>
          <Subhead>Trade JNToken Instantly on BNB Chain</Subhead>
          <LandingTokenMarks />
        </CopyCol>
        <WidgetCol>
          <LandingSwapCard />
        </WidgetCol>
      </Grid>
    </Hero>
  </Page>
)

export default LandingHero
