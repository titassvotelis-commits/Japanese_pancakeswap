import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styled, { css, keyframes } from 'styled-components'
import { CloseIcon, IconButton } from '@pancakeswap/uikit'
import { NAV_BREAKPOINTS } from 'components/Menu/navHeaderTheme'

const DISMISS_DRAG_PX = 100
const DISMISS_VELOCITY = 0.45
const CLOSE_ANIM_MS = 260

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`

const Overlay = styled.div<{ $dimmed: number }>`
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(4px);
  opacity: ${({ $dimmed }) => $dimmed};
  animation: ${fadeIn} 0.2s ease-out;
  transition: opacity 0.2s ease-out;
  cursor: pointer;
`

const Sheet = styled.div<{ $dragY: number; $dragging: boolean; $exiting: boolean }>`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1101;
  display: flex;
  flex-direction: column;
  max-height: min(94dvh, 920px);
  height: min(94dvh, 920px);
  background: #1a1b1f;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.55);
  overflow: hidden;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  transform: translateY(${({ $dragY }) => $dragY}px);
  transition: ${({ $dragging }) => ($dragging ? 'none' : 'transform 0.26s cubic-bezier(0.32, 0.72, 0, 1)')};
  animation: ${({ $dragging, $exiting, $dragY }) =>
    $dragging || $exiting || $dragY > 0
      ? 'none'
      : css`
          ${slideUp} 0.28s cubic-bezier(0.32, 0.72, 0, 1)
        `};

  @media screen and (max-width: ${NAV_BREAKPOINTS.sm}px) {
    max-height: 96dvh;
    height: 96dvh;
    border-radius: 20px 20px 0 0;
  }
`

const SheetTop = styled.div<{ $dragging: boolean }>`
  position: relative;
  flex-shrink: 0;
  padding: 10px 52px 6px 16px;
  touch-action: none;
  user-select: none;
  cursor: ${({ $dragging }) => ($dragging ? 'grabbing' : 'grab')};
`

const DragHandle = styled.div`
  width: 40px;
  height: 4px;
  margin: 0 auto 10px;
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.22);
  pointer-events: none;
`

const CloseWrap = styled.div`
  position: absolute;
  top: 2px;
  right: 4px;
`

const CloseBtn = styled(IconButton)`
  min-width: 44px;
  min-height: 44px;
`

const SheetBody = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

type SwapMobileChartSheetProps = {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

const SwapMobileChartSheet: React.FC<SwapMobileChartSheetProps> = ({ isOpen, onClose, children }) => {
  const sheetRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({
    active: false,
    startY: 0,
    startTime: 0,
    pointerId: -1,
  })

  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [overlayOpacity, setOverlayOpacity] = useState(1)

  const resetDrag = useCallback(() => {
    dragRef.current.active = false
    setDragging(false)
    setDragY(0)
    setOverlayOpacity(1)
  }, [])

  const getSheetHeight = useCallback(() => sheetRef.current?.offsetHeight ?? window.innerHeight * 0.94, [])

  const updateDragVisuals = useCallback(
    (offset: number) => {
      const height = getSheetHeight()
      setDragY(offset)
      setOverlayOpacity(Math.max(0.35, 1 - (offset / height) * 0.65))
    },
    [getSheetHeight],
  )

  const animateClose = useCallback(() => {
    if (exiting) {
      return
    }
    setExiting(true)
    setDragging(false)
    dragRef.current.active = false
    const height = getSheetHeight()
    setDragY(height)
    setOverlayOpacity(0)
    window.setTimeout(() => {
      setExiting(false)
      resetDrag()
      onClose()
    }, CLOSE_ANIM_MS)
  }, [exiting, getSheetHeight, onClose, resetDrag])

  const finishDrag = useCallback(
    (clientY: number) => {
      const { startY, startTime, active } = dragRef.current
      if (!active) {
        return
      }
      dragRef.current.active = false
      setDragging(false)

      const offset = Math.max(0, clientY - startY)
      const elapsed = Math.max(Date.now() - startTime, 1)
      const velocity = offset / elapsed

      if (offset > DISMISS_DRAG_PX || velocity > DISMISS_VELOCITY) {
        animateClose()
        return
      }

      setDragY(0)
      setOverlayOpacity(1)
    },
    [animateClose],
  )

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) {
      return
    }
    if ((e.target as HTMLElement).closest('button')) {
      return
    }

    dragRef.current = {
      active: true,
      startY: e.clientY,
      startTime: Date.now(),
      pointerId: e.pointerId,
    }
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || e.pointerId !== dragRef.current.pointerId) {
      return
    }
    const offset = Math.max(0, e.clientY - dragRef.current.startY)
    updateDragVisuals(offset)
  }, [updateDragVisuals])

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerId !== dragRef.current.pointerId) {
        return
      }
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        /* capture may already be released */
      }
      finishDrag(e.clientY)
    },
    [finishDrag],
  )

  const handlePointerCancel = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerId !== dragRef.current.pointerId) {
        return
      }
      finishDrag(e.clientY)
    },
    [finishDrag],
  )

  useEffect(() => {
    if (!isOpen) {
      resetDrag()
      setExiting(false)
      return undefined
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen, resetDrag])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        animateClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, animateClose])

  if (!isOpen || typeof document === 'undefined') {
    return null
  }

  const portalTarget = document.getElementById('portal-root') ?? document.body

  return createPortal(
    <>
      <Overlay role="presentation" $dimmed={overlayOpacity} onClick={animateClose} />
      <Sheet
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Price chart"
        $dragY={dragY}
        $dragging={dragging}
        $exiting={exiting}
        onClick={(e) => e.stopPropagation()}
      >
        <SheetTop
          $dragging={dragging}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          <DragHandle />
          <CloseWrap>
            <CloseBtn variant="text" onClick={animateClose} aria-label="Close chart">
              <CloseIcon color="textSubtle" />
            </CloseBtn>
          </CloseWrap>
        </SheetTop>
        <SheetBody>{children}</SheetBody>
      </Sheet>
    </>,
    portalTarget,
  )
}

export default SwapMobileChartSheet
