import React, { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { ChevronDownIcon } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'

const bounceBlink = keyframes`
  0%,
  100% {
    opacity: 0.4;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(8px);
  }
`

const HintButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 20px auto 4px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};
  animation: ${bounceBlink} 1.5s ease-in-out infinite;

  &:hover {
    opacity: 1;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 4px;
    border-radius: 8px;
  }
`

const SITE_FOOTER_ID = 'site-footer'

const ScrollDownHint: React.FC = () => {
  const { t } = useTranslation()
  const [showHint, setShowHint] = useState(true)

  useEffect(() => {
    const footer = document.getElementById(SITE_FOOTER_ID)
    if (!footer) {
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowHint(!entry.isIntersecting)
      },
      { root: null, threshold: 0.08 },
    )

    observer.observe(footer)
    return () => observer.disconnect()
  }, [])

  const scrollToFooter = () => {
    document.getElementById(SITE_FOOTER_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (!showHint) {
    return null
  }

  return (
    <HintButton type="button" onClick={scrollToFooter} aria-label={t('Scroll to footer')}>
      <ChevronDownIcon width="32px" />
    </HintButton>
  )
}

export default ScrollDownHint
