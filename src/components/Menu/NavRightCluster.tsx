import React from 'react'
import styled from 'styled-components'
import { useWeb3React } from '@web3-react/core'
import GlobalSettings from './GlobalSettings'
import NavConnectWallet from './NavConnectWallet'
import NavTokenSearch, { NavSearchMode } from './NavTokenSearch'
import NavWalletPill from './NavWalletPill'
import type { NavHeaderRwd } from './useNavHeaderRwd'

const Cluster = styled.div<{ $gap: number; $compact?: boolean }>`
  display: inline-flex !important;
  align-items: center;
  height: 100%;
  flex-shrink: 0;
  gap: ${({ $gap }) => $gap}px;
  min-width: ${({ $compact }) => ($compact ? 'min-content' : '0')};
  position: relative;
  z-index: 22;
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: auto !important;
`

function searchModeFromRwd(rwd: NavHeaderRwd): NavSearchMode {
  if (rwd.compactSearch) return 'compact'
  if (rwd.slimSearch) return 'slim'
  return 'full'
}

interface NavRightClusterProps {
  rwd: NavHeaderRwd
}

const NavRightCluster: React.FC<NavRightClusterProps> = ({ rwd }) => {
  const { account } = useWeb3React()
  const searchMode = searchModeFromRwd(rwd)

  return (
    <Cluster
      className="nav-header-right"
      $gap={rwd.clusterGap}
      $compact={rwd.compactSearch}
    >
      <NavTokenSearch mode={searchMode} />
      <GlobalSettings />
      {account ? (
        <NavWalletPill
          account={account}
          compact={rwd.compactWallet}
          showBalance={rwd.showWalletBalance}
          useTouchMenu={rwd.useTouchWalletMenu}
        />
      ) : (
        <NavConnectWallet compact={rwd.compactWallet} />
      )}
    </Cluster>
  )
}

export default NavRightCluster
