import React from 'react'
import { Box, SvgProps } from '@pancakeswap/uikit'

/** Phantom wallet logo (purple ghost). */
const PhantomWalletIcon: React.FC<SvgProps> = ({ width = '40px', mb }) => (
  <Box mb={mb} width={width} height={width}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
      width="100%"
      height="100%"
      aria-hidden
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="phantom-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#534BB1" />
          <stop offset="100%" stopColor="#551BF9" />
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="26" fill="url(#phantom-gradient)" />
      <path
        fill="#fff"
        d="M63.9 28c-18.2 0-33 13.5-33 30.1 0 11.8 6.4 22.2 16.4 28.2l-4.8 14.7h36.8l-4.8-14.7c10-6 16.4-16.4 16.4-28.2C95 41.5 82.1 28 63.9 28zm-8.2 38.5c-3.4 0-6.1-2.6-6.1-5.9s2.7-5.9 6.1-5.9 6.1 2.6 6.1 5.9-2.7 5.9-6.1 5.9zm16.6 0c-3.4 0-6.1-2.6-6.1-5.9s2.7-5.9 6.1-5.9 6.1 2.6 6.1 5.9-2.7 5.9-6.1 5.9z"
      />
    </svg>
  </Box>
)

export default PhantomWalletIcon
