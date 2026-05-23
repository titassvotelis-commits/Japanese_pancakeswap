import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styled, { keyframes } from 'styled-components'
import { OpenNewIcon } from '@pancakeswap/uikit'
import history from 'routerHistory'
import {
  PROMO_AD_ROTATE_MS,
  PROMO_AD_SLIDES,
  PROMO_SWIPE_THRESHOLD_PX,
  PROMO_SWIPE_VELOCITY,
  PromoArtTheme,
} from 'config/constants/promoAds'
import { useTranslation } from 'contexts/Localization'
import { NAV_BREAKPOINTS } from 'components/Menu/navHeaderTheme'
import PromoSlideArt from './PromoSlideArt'

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`

const cardBg: Record<PromoArtTheme, string> = {
  'jnto-hero':
    'linear-gradient(135deg, rgba(58, 38, 8, 0.97) 0%, rgba(32, 24, 36, 0.98) 50%, rgba(18, 16, 22, 0.99) 100%)',
  'jnto-swap':
    'linear-gradient(135deg, rgba(48, 28, 72, 0.97) 0%, rgba(28, 24, 36, 0.98) 55%, rgba(18, 16, 24, 0.99) 100%)',
  'jnto-earn':
    'linear-gradient(135deg, rgba(22, 48, 36, 0.97) 0%, rgba(24, 28, 32, 0.98) 55%, rgba(16, 20, 22, 0.99) 100%)',
}

const Root = styled.div`
  position: fixed;
  right: 16px;
  bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  z-index: 1050;
  width: min(380px, calc(100vw - 32px));
  animation: ${slideIn} 0.42s cubic-bezier(0.32, 0.72, 0, 1);

  @media screen and (max-width: ${NAV_BREAKPOINTS.sm}px) {
    right: 12px;
    bottom: calc(12px + env(safe-area-inset-bottom, 0px));
    width: min(340px, calc(100vw - 24px));
  }
`

const Card = styled.div<{ $theme: PromoArtTheme }>`
  position: relative;
  min-height: 140px;
  border-radius: 24px;
  background: ${({ $theme }) => cardBg[$theme]};
  border: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow: 0 14px 44px rgba(0, 0, 0, 0.48);
  overflow: hidden;
  transition: background 0.45s ease;
  touch-action: pan-y;

  @media screen and (max-width: ${NAV_BREAKPOINTS.sm}px) {
    min-height: 128px;
    border-radius: 20px;
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 6;
  width: 30px;
  height: 30px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
  background: rgba(12, 11, 16, 0.72);
  backdrop-filter: blur(10px);
  color: rgba(255, 255, 255, 0.88);
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease, color 0.18s ease;

  svg {
    width: 14px;
    height: 14px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.28);
    color: #fff;
    transform: scale(1.04);
  }

  &:active {
    transform: scale(0.96);
  }

  &:focus-visible {
    outline: 2px solid #c8b6ff;
    outline-offset: 2px;
  }
`

const SwipeViewport = styled.div<{ $dragging: boolean }>`
  position: relative;
  overflow: hidden;
  cursor: ${({ $dragging }) => ($dragging ? 'grabbing' : 'grab')};
  user-select: none;
`

const Track = styled.div<{ $offsetPct: number; $dragging: boolean }>`
  display: flex;
  width: 100%;
  transform: translateX(${({ $offsetPct }) => $offsetPct}%);
  transition: ${({ $dragging }) => ($dragging ? 'none' : 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)')};
`

const SlidePanel = styled.div`
  flex: 0 0 100%;
  display: grid;
  grid-template-columns: 1fr 128px;
  align-items: stretch;
  min-width: 0;

  @media screen and (max-width: ${NAV_BREAKPOINTS.sm}px) {
    grid-template-columns: 1fr 108px;
  }
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: 38px 12px 30px 18px;
  min-width: 0;
  position: relative;
  z-index: 6;
  pointer-events: auto;
`

const Badge = styled.span`
  display: inline-flex;
  align-self: flex-start;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(255, 229, 102, 0.18);
  border: 1px solid rgba(255, 229, 102, 0.35);
  color: #ffe566;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

const Title = styled.p`
  margin: 0;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: -0.01em;
`

const Subtitle = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
`

const CtaLink = styled.a`
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 4px;
  padding: 8px 16px;
  border-radius: 999px;
  background: linear-gradient(180deg, #ffe566 0%, #e8b84a 100%);
  color: #2a2008;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  transition: filter 0.15s ease, transform 0.15s ease;
  cursor: pointer;

  &:hover {
    filter: brightness(1.06);
    transform: translateY(-1px);
    color: #2a2008;
  }
`

const CtaButton = styled.button`
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 4px;
  padding: 8px 16px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(180deg, #ffe566 0%, #e8b84a 100%);
  color: #2a2008;
  font-size: 13px;
  font-weight: 700;
  font-family: inherit;
  white-space: nowrap;
  transition: filter 0.15s ease, transform 0.15s ease;
  cursor: pointer;

  &:hover {
    filter: brightness(1.06);
    transform: translateY(-1px);
    color: #2a2008;
  }

  &:active {
    transform: translateY(0);
  }
`

const ArtPanel = styled.div`
  position: relative;
  min-height: 140px;
  overflow: hidden;

  @media screen and (max-width: ${NAV_BREAKPOINTS.sm}px) {
    min-height: 128px;
  }
`

const Dots = styled.div`
  position: absolute;
  left: 18px;
  bottom: 12px;
  display: flex;
  gap: 5px;
  z-index: 5;
  pointer-events: auto;
`

const Dot = styled.button<{ $active: boolean }>`
  width: ${({ $active }) => ($active ? '18px' : '8px')};
  height: 4px;
  padding: 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: ${({ $active }) => ($active ? '#ffe566' : 'rgba(255, 255, 255, 0.22)')};
  transition: width 0.2s ease, background 0.2s ease;
`

const CloseIconSvg = () => (
  <svg viewBox="0 0 14 14" aria-hidden>
    <path d="M2 2l10 10M12 2L2 12" strokeLinecap="round" />
  </svg>
)

const BottomPromoToast: React.FC = () => {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const [dragPx, setDragPx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [viewportWidth, setViewportWidth] = useState(0)

  const viewportRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({
    active: false,
    startX: 0,
    startTime: 0,
    pointerId: -1,
    didDrag: false,
  })
  const pauseAutoRef = useRef(false)

  const slideCount = PROMO_AD_SLIDES.length
  const slide = PROMO_AD_SLIDES[activeIndex]

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(((index % slideCount) + slideCount) % slideCount)
      setDragPx(0)
    },
    [slideCount],
  )

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])

  const dismiss = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    setVisible(false)
  }, [])

  const navigatePromo = useCallback(
    (href: string, external?: boolean) => {
      setVisible(false)
      if (external || href.startsWith('http')) {
        window.open(href, '_blank', 'noopener,noreferrer')
        return
      }
      history.push(href)
    },
    [],
  )

  const measureViewport = useCallback(() => {
    if (viewportRef.current) {
      setViewportWidth(viewportRef.current.offsetWidth)
    }
  }, [])

  useEffect(() => {
    measureViewport()
    window.addEventListener('resize', measureViewport)
    return () => window.removeEventListener('resize', measureViewport)
  }, [measureViewport, visible])

  const finishDrag = useCallback(
    (clientX: number) => {
      const { active, startX, startTime, didDrag } = dragRef.current
      if (!active) {
        return
      }
      dragRef.current.active = false
      setDragging(false)
      pauseAutoRef.current = false

      const delta = clientX - startX
      const elapsed = Math.max(Date.now() - startTime, 1)
      const velocity = Math.abs(delta) / elapsed

      if (didDrag && (delta < -PROMO_SWIPE_THRESHOLD_PX || (delta < 0 && velocity > PROMO_SWIPE_VELOCITY))) {
        goNext()
        return
      }
      if (didDrag && (delta > PROMO_SWIPE_THRESHOLD_PX || (delta > 0 && velocity > PROMO_SWIPE_VELOCITY))) {
        goPrev()
        return
      }
      setDragPx(0)
    },
    [goNext, goPrev],
  )

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) {
      return
    }
    const target = e.target as HTMLElement
    if (target.closest('button, a, [data-no-swipe]')) {
      return
    }

    dragRef.current = {
      active: true,
      startX: e.clientX,
      startTime: Date.now(),
      pointerId: e.pointerId,
      didDrag: false,
    }
    setDragging(true)
    pauseAutoRef.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current.active || e.pointerId !== dragRef.current.pointerId) {
        return
      }
      const delta = e.clientX - dragRef.current.startX
      if (Math.abs(delta) > 6) {
        dragRef.current.didDrag = true
      }
      const maxDrag = viewportWidth * 0.45
      const clamped = Math.max(-maxDrag, Math.min(maxDrag, delta))
      setDragPx(clamped)
    },
    [viewportWidth],
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerId !== dragRef.current.pointerId) {
        return
      }
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        /* already released */
      }
      finishDrag(e.clientX)
    },
    [finishDrag],
  )

  const handlePointerCancel = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerId !== dragRef.current.pointerId) {
        return
      }
      finishDrag(e.clientX)
    },
    [finishDrag],
  )

  const handleViewportClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (dragRef.current.didDrag) {
        return
      }
      const target = e.target as HTMLElement
      if (target.closest('button, a, [data-no-swipe]')) {
        return
      }
      const rect = e.currentTarget.getBoundingClientRect()
      const ratio = (e.clientX - rect.left) / rect.width
      if (ratio < 0.22) {
        goPrev()
      } else if (ratio > 0.78) {
        goNext()
      }
    },
    [goNext, goPrev],
  )

  useEffect(() => {
    if (!visible || slideCount <= 1) {
      return undefined
    }
    const timer = window.setInterval(() => {
      if (!pauseAutoRef.current && !dragRef.current.active) {
        setActiveIndex((prev) => (prev + 1) % slideCount)
        setDragPx(0)
      }
    }, PROMO_AD_ROTATE_MS)
    return () => window.clearInterval(timer)
  }, [visible, slideCount])

  if (!visible || typeof document === 'undefined') {
    return null
  }

  const dragOffsetPct = viewportWidth > 0 ? (dragPx / viewportWidth) * 100 : 0
  const trackOffsetPct = -activeIndex * 100 + dragOffsetPct

  const portalTarget = document.getElementById('portal-root') ?? document.body

  return createPortal(
    <Root role="complementary" aria-label={t('JNTo promotion')}>
      <Card $theme={slide.artTheme}>
        <CloseButton type="button" onClick={dismiss} aria-label={t('Dismiss promotion')} data-no-swipe>
          <CloseIconSvg />
        </CloseButton>

        <SwipeViewport
          ref={viewportRef}
          $dragging={dragging}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onClick={handleViewportClick}
        >
          <Track $offsetPct={trackOffsetPct} $dragging={dragging}>
            {PROMO_AD_SLIDES.map((s) => {
              const cta =
                s.ctaExternal || s.ctaHref.startsWith('http') ? (
                  <CtaLink
                    href={s.ctaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigatePromo(s.ctaHref, true)
                    }}
                    data-no-swipe
                  >
                    {t(s.ctaLabelKey)}
                    <OpenNewIcon color="#2a2008" width="14px" />
                  </CtaLink>
                ) : (
                  <CtaButton
                    type="button"
                    data-no-swipe
                    onClick={(e) => {
                      e.stopPropagation()
                      navigatePromo(s.ctaHref)
                    }}
                  >
                    {t(s.ctaLabelKey)}
                  </CtaButton>
                )

              return (
                <SlidePanel key={s.id}>
                  <Content data-no-swipe>
                    {s.badgeKey ? <Badge>{t(s.badgeKey)}</Badge> : null}
                    <Title>{t(s.titleKey)}</Title>
                    {s.subtitleKey ? <Subtitle>{t(s.subtitleKey)}</Subtitle> : null}
                    {cta}
                  </Content>
                  <ArtPanel>
                    <PromoSlideArt theme={s.artTheme} />
                  </ArtPanel>
                </SlidePanel>
              )
            })}
          </Track>
        </SwipeViewport>

        <Dots>
          {PROMO_AD_SLIDES.map((s, index) => (
            <Dot
              key={s.id}
              type="button"
              $active={index === activeIndex}
              aria-label={t('Show promotion %index%', { index: index + 1 })}
              onClick={() => goTo(index)}
              data-no-swipe
            />
          ))}
        </Dots>
      </Card>
    </Root>,
    portalTarget,
  )
}

export default BottomPromoToast
