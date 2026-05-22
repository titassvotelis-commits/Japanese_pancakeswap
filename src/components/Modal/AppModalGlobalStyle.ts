import { createGlobalStyle } from 'styled-components'

/** Class applied via AppModalContainer / ConnectWalletModal — avoid brittle :has() selectors. */
export const APP_UIKIT_MODAL_CLASS = 'app-uikit-modal'

const AppModalGlobalStyle = createGlobalStyle`
  #portal-root .${APP_UIKIT_MODAL_CLASS},
  #root .${APP_UIKIT_MODAL_CLASS} {
    width: min(420px, calc(100vw - 32px)) !important;
    min-width: min(280px, calc(100vw - 32px)) !important;
    max-width: calc(100vw - 32px) !important;
    max-height: min(90vh, 800px) !important;
    height: auto !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
    flex: 0 0 auto !important;
  }

  #portal-root .${APP_UIKIT_MODAL_CLASS} > *:first-child,
  #root .${APP_UIKIT_MODAL_CLASS} > *:first-child {
    flex-shrink: 0 !important;
    width: 100% !important;
  }

  #portal-root .${APP_UIKIT_MODAL_CLASS} > *:last-child,
  #root .${APP_UIKIT_MODAL_CLASS} > *:last-child {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
    max-height: calc(min(90vh, 800px) - 72px) !important;
  }

  /* ModalProvider portals ModalWrapper (overlay + dialog) into #portal-root */
  #portal-root > div:has(> [role='presentation']) {
    padding: 16px !important;
    box-sizing: border-box !important;
  }

  #portal-root div[data-popper-placement],
  body > div[data-popper-placement] {
    z-index: 1300 !important;
  }
`

export default AppModalGlobalStyle
