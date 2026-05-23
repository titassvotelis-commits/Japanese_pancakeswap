import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'
import { useTranslation } from 'contexts/Localization'
import MkPriceBuyActions from './MkPriceBuyActions'
import {
  clearNavLogoMkDismissed,
  closeNavLogoMkDropdown,
  NAV_LOGO_MK_DISMISSED_CLASS,
  NAV_LOGO_MK_OPEN_CLASS,
} from './closeNavLogoMkDropdown'
import { SITE_CHROME_BG } from './navHeaderTheme'

const Panel = styled.div.attrs({ className: 'nav-logo-mk-panel' })`
  position: absolute;
  top: 100%;
  left: 0;
  /* No margin-top: a gap breaks :hover before the pointer reaches the panel. */
  padding: 20px 18px 14px;
  z-index: 20;
  background: ${SITE_CHROME_BG};
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);

  /* Invisible bridge from logo into panel so hover is not lost while moving down. */
  &::before {
    content: '';
    position: absolute;
    top: -12px;
    left: -8px;
    right: -8px;
    height: 12px;
  }
`

const LOGO_HOME = 'a[aria-label="MetakeySwap home page"]'

/** Remove duplicate nested wrappers left by older attach logic. */
function flattenLogoAnchorWrappers(link: HTMLAnchorElement): HTMLElement {
  while (
    link.parentElement?.classList.contains('nav-logo-dropdown-anchor') &&
    link.parentElement.parentElement?.classList.contains('nav-logo-dropdown-anchor')
  ) {
    const inner = link.parentElement
    const outer = inner.parentElement as HTMLElement
    outer.insertBefore(link, inner)
    inner.remove()
  }

  const parent = link.parentElement
  if (parent?.classList.contains('nav-logo-dropdown-anchor')) {
    return parent
  }

  const container = parent as HTMLElement
  const wrap = document.createElement('div')
  wrap.className = 'nav-logo-dropdown-anchor'
  container.insertBefore(wrap, link)
  wrap.appendChild(link)
  return wrap
}

/** Hover dropdown under header logo with JNTo price + Buy JNTo (same as footer). */
const NavLogoMkDropdown: React.FC = () => {
  const { t } = useTranslation()
  const anchorRef = useRef<HTMLElement | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    let attempts = 0

    const attach = () => {
      if (cancelled) {
        return
      }
      const link = document.querySelector(LOGO_HOME) as HTMLAnchorElement | null
      if (!link?.parentElement) {
        attempts += 1
        if (attempts < 60) {
          requestAnimationFrame(attach)
        }
        return
      }

      const wrap = flattenLogoAnchorWrappers(link)
      anchorRef.current = wrap
      setReady(true)
    }

    attach()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const wrap = anchorRef.current
    if (!ready || !wrap) {
      return undefined
    }

    let hideTimer: ReturnType<typeof setTimeout> | undefined

    const show = () => {
      if (hideTimer) {
        clearTimeout(hideTimer)
        hideTimer = undefined
      }
      wrap.classList.remove(NAV_LOGO_MK_DISMISSED_CLASS)
      wrap.classList.add(NAV_LOGO_MK_OPEN_CLASS)
    }

    const hide = () => {
      hideTimer = setTimeout(() => {
        wrap.classList.remove(NAV_LOGO_MK_OPEN_CLASS)
        wrap.classList.remove(NAV_LOGO_MK_DISMISSED_CLASS)
        clearNavLogoMkDismissed()
      }, 120)
    }

    wrap.addEventListener('mouseenter', show)
    wrap.addEventListener('mouseleave', hide)

    return () => {
      wrap.removeEventListener('mouseenter', show)
      wrap.removeEventListener('mouseleave', hide)
      if (hideTimer) {
        clearTimeout(hideTimer)
      }
      wrap.classList.remove(NAV_LOGO_MK_OPEN_CLASS)
      wrap.classList.remove(NAV_LOGO_MK_DISMISSED_CLASS)
    }
  }, [ready])

  useEffect(() => {
    if (!ready) {
      return undefined
    }

    const observer = new MutationObserver(() => {
      if (document.body.style.overflow === 'hidden') {
        closeNavLogoMkDropdown()
      }
    })

    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] })
    return () => observer.disconnect()
  }, [ready])

  if (!ready || !anchorRef.current) {
    return null
  }

  return createPortal(
    <Panel role="region" aria-label={t('JNTo price and buy')}>
      <MkPriceBuyActions onBuyMkClick={closeNavLogoMkDropdown} />
    </Panel>,
    anchorRef.current,
  )
}

export default NavLogoMkDropdown
