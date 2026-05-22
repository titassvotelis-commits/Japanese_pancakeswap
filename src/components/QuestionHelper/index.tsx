import React from 'react'
import { HelpIcon, useTooltip, Placement } from '@pancakeswap/uikit'
import styled from 'styled-components'

interface Props {
  text: string | React.ReactNode
  placement?: Placement
  ml?: string
  mr?: string
}

const QuestionWrapper = styled.span<{ $ml?: string; $mr?: string }>`
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  cursor: help;
  margin-left: ${({ $ml }) => $ml || '0'};
  margin-right: ${({ $mr }) => $mr || '0'};

  :hover,
  :focus {
    opacity: 0.7;
  }
`

const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0)

const QuestionHelper: React.FC<Props> = ({ text, placement = 'top-start', ml, mr }) => {
  const { targetRef, tooltip, tooltipVisible } = useTooltip(text, {
    placement,
    // Hover + touchstart preventDefault in uikit causes scroll warnings on mobile; use click instead.
    trigger: isTouchDevice() ? 'click' : 'hover',
    tooltipOffset: [0, 8],
  })

  return (
    <>
      {tooltipVisible && tooltip}
      <QuestionWrapper ref={targetRef} tabIndex={0} $ml={ml} $mr={mr}>
        <HelpIcon color="textSubtle" width="16px" />
      </QuestionWrapper>
    </>
  )
}

export default QuestionHelper
