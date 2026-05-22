import React from 'react'
import { useWeb3React } from '@web3-react/core'
import ConnectWalletButton from 'components/ConnectWalletButton'
import NavWalletPill from '../NavWalletPill'

const UserMenu = () => {
  const { account } = useWeb3React()

  if (!account) {
    return <ConnectWalletButton scale="sm" />
  }

  return <NavWalletPill account={account} />
}

export default UserMenu
