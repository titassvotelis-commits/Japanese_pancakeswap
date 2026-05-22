require('@nomicfoundation/hardhat-toolbox')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const PRIVATE_KEY = process.env.PRIVATE_KEY
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      { version: '0.5.16' },
      {
        version: '0.6.6',
        settings: {
          optimizer: { enabled: true, runs: 999999 },
        },
      },
      {
        version: '0.6.12',
        settings: {
          optimizer: { enabled: true, runs: 999999 },
        },
      },
    ],
  },
  paths: {
    sources: './deploy',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  networks: {
    bsc: {
      url: process.env.BSC_RPC_URL || 'https://bsc-dataseed1.binance.org',
      chainId: 56,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}`] : [],
    },
  },
  etherscan: {
    apiKey: BSCSCAN_API_KEY || '',
  },
}
