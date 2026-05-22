import styled, { css } from 'styled-components'
import { ModalBody, ModalContainer, ModalHeader } from '@pancakeswap/uikit'
import { APP_UIKIT_MODAL_CLASS } from './AppModalGlobalStyle'

/** Beat uikit ModalContainer `width: auto` at xs breakpoint. */
const dialogShell = css`
  && {
    width: min(420px, calc(100vw - 32px)) !important;
    min-width: 320px !important;
    max-width: calc(100vw - 32px) !important;
    max-height: min(90vh, 800px) !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
  }
`

/** Shared dialog shell for app-owned modals. */
export const AppModalContainer = styled(ModalContainer).attrs({
  className: APP_UIKIT_MODAL_CLASS,
})`
  ${dialogShell}
`

export const AppModalHeader = styled(ModalHeader)`
  flex-shrink: 0;
  width: 100%;
`

export const AppModalBody = styled(ModalBody)`
  && {
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    padding: 24px !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  &&::-webkit-scrollbar {
    display: none;
  }
`
