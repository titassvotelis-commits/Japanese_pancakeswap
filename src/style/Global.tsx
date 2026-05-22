import { createGlobalStyle } from 'styled-components'
// eslint-disable-next-line import/no-unresolved
import { PancakeTheme } from '@pancakeswap/uikit/dist/theme'
import Inter from '../assets/fonts/Inter-Regular.ttf'
import { TYPE } from '../theme/typography'
import {
  NAV_BODY_OFFSET,
  NAV_BOTTOM_BAR_HEIGHT,
  NAV_BREAKPOINTS,
  NAV_HEADER_HEIGHT,
  SITE_CHROME_BG,
} from '../components/Menu/navHeaderTheme'

declare module 'styled-components' {
  /* eslint-disable @typescript-eslint/no-empty-interface */
  export interface DefaultTheme extends PancakeTheme {}
}

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Inter';
    src: url(${Inter})
  }
  html {
    font-size: 15px;
  }
  * {
    font-family: 'Inter', sans-serif;
  }
  body,
  #root {
    font-size: ${TYPE.body};
    line-height: 1.45;
  }
  body {
    background-color: ${({ theme }) => theme.colors.background};

    img:not(.metakey-logo) {
      height: auto;
      max-width: 100%;
    }
  }

  #root h1 {
    font-size: ${TYPE.headingXl};
  }
  #root h2 {
    font-size: ${TYPE.headingMd};
  }
  #root h3 {
    font-size: ${TYPE.headingLg};
  }
  #root h4,
  #root h5,
  #root h6 {
    font-size: ${TYPE.body};
  }

  #root button,
  #root input,
  #root select,
  #root textarea {
    font-size: ${TYPE.button};
  }

  #root nav a,
  #root nav button {
    font-size: ${TYPE.nav};
  }

  #root nav {
    overflow: visible;
    padding-left: 12px;
    padding-right: 12px;
    background-color: ${SITE_CHROME_BG} !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
    min-height: 56px;
  }

  #root nav > div {
    align-items: center;
    min-height: 56px;
  }

  #root nav .nav-logo-dropdown-anchor {
    position: relative;
    display: inline-flex;
    align-items: center;
    height: 100%;
    flex-shrink: 0;
  }

  #root nav .nav-logo-mk-panel {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.12s ease, visibility 0.12s ease;
  }

  @media screen and (max-width: ${NAV_BREAKPOINTS.headerFull}px) {
    #root nav .nav-logo-mk-panel {
      display: none !important;
    }
  }

  #root nav .nav-logo-dropdown-anchor:hover .nav-logo-mk-panel,
  #root nav .nav-logo-dropdown-anchor:focus-within .nav-logo-mk-panel,
  #root nav .nav-logo-dropdown-anchor.nav-logo-mk-open .nav-logo-mk-panel,
  #root nav .nav-logo-mk-panel:hover {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }

  /* After Buy JNTo / modal open — stay hidden even while pointer is still over the anchor */
  #root nav .nav-logo-dropdown-anchor.nav-logo-mk-dismissed .nav-logo-mk-panel,
  #root nav .nav-logo-dropdown-anchor.nav-logo-mk-dismissed:hover .nav-logo-mk-panel,
  #root nav .nav-logo-dropdown-anchor.nav-logo-mk-dismissed:focus-within .nav-logo-mk-panel {
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }

  /* Any uikit modal locks body scroll — keep logo dropdown hidden under modals */
  body[style*='overflow: hidden'] #root nav .nav-logo-dropdown-anchor:hover .nav-logo-mk-panel,
  body[style*='overflow: hidden'] #root nav .nav-logo-dropdown-anchor:focus-within .nav-logo-mk-panel,
  body[style*='overflow: hidden'] #root nav .nav-logo-dropdown-anchor.nav-logo-mk-open .nav-logo-mk-panel,
  body[style*='overflow: hidden'] #root nav .nav-logo-mk-panel:hover {
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }

  #root nav > div:first-child {
    flex: 1 1 auto;
    min-width: 0;
    overflow: visible;
  }

  /* Hide inline Trade/Earn/… when compact header is active (overlap zone ≤1080px) */
  @media screen and (max-width: ${NAV_BREAKPOINTS.headerFull}px) {
    #root nav > div:first-child > div:not(:first-child) {
      display: none !important;
    }

    #root nav > div:first-child {
      flex: 0 1 auto;
      max-width: none;
    }
  }

  /* Header nav: hover dropdown panels (Trade, Earn, etc.) */
  #root nav > div:first-child a,
  #root nav > div:first-child button {
    cursor: pointer;
  }

  #root nav > div:first-child [style*='popper'] {
    z-index: 1001 !important;
  }

  #root nav > div:last-child {
    flex: 0 0 auto;
    flex-shrink: 0;
    gap: 10px;
    margin-left: auto;
    overflow: visible;
    max-width: none;
    min-width: 0;
  }

  /* —— Header RWD: compact (≤1080px, logo + search only in bar) —— */
  @media screen and (max-width: ${NAV_BREAKPOINTS.headerFull}px) {
    #root nav {
      padding-left: 10px;
      padding-right: 10px;
    }

    #root nav > div:first-child {
      flex: 0 1 auto;
      min-width: 0;
      max-width: calc(100% - 200px);
    }

    #root nav > div:last-child {
      gap: 8px;
      flex-shrink: 0;
      margin-left: auto;
    }

    #nav-language-menu-button {
      display: none !important;
    }

    a[aria-label="MetakeySwap home page"] img.metakey-logo,
    a[aria-label="MetakeySwap home page"] img.desktop-icon {
      height: 36px !important;
      max-width: 120px !important;
    }
  }

  /* —— Header RWD: mobile (≤576px) —— */
  @media screen and (max-width: ${NAV_BREAKPOINTS.sm}px) {
    #root nav {
      padding-left: 10px;
      padding-right: 10px;
    }
  }

  /* —— Header RWD: tablet (577–852px) —— */
  @media screen and (min-width: ${NAV_BREAKPOINTS.sm + 1}px) and (max-width: ${NAV_BREAKPOINTS.md}px) {
    #root nav > div:last-child {
      gap: 10px;
    }

    a[aria-label="MetakeySwap home page"] img.metakey-logo,
    a[aria-label="MetakeySwap home page"] img.desktop-icon {
      height: 40px !important;
      max-width: 150px !important;
    }
  }

  /* —— Header RWD: desktop (≥853px) —— */
  @media screen and (min-width: ${NAV_BREAKPOINTS.md + 1}px) {
    #root nav > div:last-child {
      gap: 12px;
    }
  }

  #root nav > div:last-child > div {
    flex-shrink: 0;
    gap: 8px;
  }

  /* Hide legacy CakePrice skeleton (80×24) when uikit patch not applied yet */
  #root nav > div:last-child > div:has(> div[width='80'][height='24']),
  #root nav > div:last-child div[width='80'][height='24'] {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    pointer-events: none !important;
  }

  .nav-header-right {
    display: inline-flex !important;
    visibility: visible !important;
    opacity: 1 !important;
    flex-shrink: 0 !important;
    pointer-events: auto !important;
  }

  .nav-header-right > * {
    display: inline-flex !important;
    visibility: visible !important;
    opacity: 1 !important;
    flex-shrink: 0 !important;
  }

  /* Compact / mobile: keep search + settings + wallet pinned in the header bar */
  @media screen and (max-width: ${NAV_BREAKPOINTS.headerFull}px) {
    body.nav-compact-header #root > div > div:first-child {
      top: 0 !important;
    }

    #root nav {
      overflow: visible !important;
    }

    #root nav > div:last-child {
      display: flex !important;
      visibility: visible !important;
      opacity: 1 !important;
      flex: 0 0 auto !important;
      min-width: min-content !important;
      z-index: 21;
    }

    .nav-header-right {
      min-width: min-content !important;
    }
  }

  @media screen and (max-width: ${NAV_BREAKPOINTS.sm}px) {
    #root nav > div:first-child {
      max-width: calc(100% - 168px);
    }

    #root nav > div:last-child {
      min-width: 156px;
    }
  }

  body.trade-nav-header #root nav {
    background-color: ${SITE_CHROME_BG} !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
    height: ${NAV_HEADER_HEIGHT}px !important;
    min-height: ${NAV_HEADER_HEIGHT}px !important;
  }

  /* Trade routes: main column fills viewport below fixed header */
  body.trade-nav-header #root > div > div:nth-child(2) {
    min-height: calc(100vh - ${NAV_BODY_OFFSET}px) !important;
    min-height: calc(100dvh - ${NAV_BODY_OFFSET}px) !important;
  }

  body.trade-nav-header #root > div > div:nth-child(2) > div {
    min-height: inherit;
  }

  a[aria-label="MetakeySwap home page"] img.mobile-icon,
  a[aria-label="MetakeySwap home page"] img.metakey-logo-icon {
    display: none !important;
  }

  a[aria-label="MetakeySwap home page"] img.metakey-logo,
  a[aria-label="MetakeySwap home page"] img.desktop-icon {
    height: 47px !important;
    width: auto !important;
    max-width: 180px !important;
    object-fit: contain;
    display: block !important;
    flex-shrink: 1;
  }

  @media screen and (min-width: ${NAV_BREAKPOINTS.lg}px) and (max-width: ${NAV_BREAKPOINTS.headerFull}px) {
    #root nav {
      padding-left: 12px;
      padding-right: 12px;
    }
  }

  @media screen and (min-width: ${NAV_BREAKPOINTS.headerFull + 1}px) {
    #root nav {
      padding-left: 16px;
      padding-right: 16px;
    }
  }

  /* Reserve space for fixed bottom nav (compact bar + safe area) */
  @media screen and (max-width: ${NAV_BREAKPOINTS.headerFull}px) {
    #root > div > div:nth-child(2) {
      padding-bottom: calc(${NAV_BOTTOM_BAR_HEIGHT}px + env(safe-area-inset-bottom, 0px));
    }
  }

  /* Prevent flex/grid children from forcing horizontal page scroll on mobile */
  #root > div > div:nth-child(2),
  #root > div > div:nth-child(2) > div {
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
  }

  html,
  body {
    overflow-x: clip;
    max-width: 100%;
  }

  /* Header dropdowns (wallet menu) sit above nav chrome, below modals */
  .nav-header-right {
    position: relative;
    z-index: 30;
  }

`

export default GlobalStyle
