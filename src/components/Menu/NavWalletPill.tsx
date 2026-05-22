import React, { useRef, useState } from 'react'
import styled from 'styled-components'
import { parseUnits } from 'ethers/lib/utils'
import { Button, ChevronDownIcon, Skeleton, Text, useModal } from '@pancakeswap/uikit'
import MetaMaskFoxIcon from 'components/MetaMaskFoxIcon'
import { useTranslation } from 'contexts/Localization'
import useAuth from 'hooks/useAuth'
import { FetchStatus, useGetBnbBalance } from 'hooks/useTokenBalance'
import { useWalletHeaderBalances } from 'hooks/useWalletHeaderBalances'
import WalletModal, { WalletView } from './UserMenu/WalletModal'
import { NAV_HEADER } from './navHeaderTheme'

const LOW_BNB_BALANCE = parseUnits('2', 'gwei')

const Wrap = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 100%;
  flex-shrink: 0;
`

const BalanceStack = styled.span`
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  max-width: ${({ $compact }: { $compact?: boolean }) => ($compact ? '7rem' : '14rem')};
  min-width: 4.25rem;
  text-align: left;
`

const BalanceAmount = styled.span`
  display: inline-block;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
`

const TokenSummary = styled.span`
  display: block;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
  color: ${({ theme }) => theme.colors.textSubtle};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`

const MenuBalances = styled.div`
  padding: 8px 12px 4px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  margin-bottom: 4px;
`

const MenuBalanceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 6px 0;
  font-size: 13px;
`

const MenuBalanceRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  min-width: 5.5rem;
`

const MenuBalanceValue = styled.span<{ $muted?: boolean }>`
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  text-align: right;
  color: ${({ theme, $muted }) => ($muted ? theme.colors.textSubtle : theme.colors.text)};
`

const MenuBalanceAmount = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSubtle};
  font-variant-numeric: tabular-nums;
  text-align: right;
`

const ChevronSlot = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
`

const Trigger = styled.button<{ $compact?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ $compact }) => ($compact ? 6 : 8)}px;
  height: ${NAV_HEADER.pillHeight}px;
  padding: ${({ $compact }) => ($compact ? '0 10px' : '0 14px 0 10px')};
  border-radius: ${NAV_HEADER.pillRadius}px;
  border: 1px solid
    ${({ theme }) => (theme.isDark ? NAV_HEADER.borderDark : theme.colors.cardBorder)};
  background: ${({ theme }) => (theme.isDark ? NAV_HEADER.walletBgDark : NAV_HEADER.walletBgLight)};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  flex-shrink: 0;
  white-space: nowrap;
  box-shadow: ${({ theme }) =>
    theme.isDark ? 'inset 0 1px 0 rgba(255, 255, 255, 0.05)' : 'none'};

  &:hover {
    border-color: ${({ theme }) => (theme.isDark ? 'rgba(255, 255, 255, 0.14)' : theme.colors.primary)};
    background: ${({ theme }) =>
      theme.isDark ? 'rgba(68, 62, 84, 0.95)' : theme.colors.dropdown};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`

const MenuPanel = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0;
  transform: translateY(-10px);
  min-width: 200px;
  padding: 8px;
  z-index: 1101;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.default};
  box-shadow: ${({ theme }) => theme.shadows.tooltip};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
`

interface NavWalletPillProps {
  account: string
  compact?: boolean
  showBalance?: boolean
  useTouchMenu?: boolean
}

const NavWalletPill: React.FC<NavWalletPillProps> = ({
  compact = false,
  showBalance = true,
  useTouchMenu = false,
}) => {
  const { t } = useTranslation()
  const { logout, changeAccount } = useAuth()
  const { usdLabel, summaryLabel, lines, pending } = useWalletHeaderBalances()
  const { balance, fetchStatus } = useGetBnbBalance()
  const hasLowBnbBalance = fetchStatus === FetchStatus.SUCCESS && balance.lte(LOW_BNB_BALANCE)
  const [onPresentWalletModal] = useModal(<WalletModal />, true, false, 'nav-wallet-modal')
  const [onPresentTransactions] = useModal(
    <WalletModal initialView={WalletView.TRANSACTIONS} />,
    true,
    false,
    'nav-wallet-tx-modal',
  )
  const [menuOpen, setMenuOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const handleMouseLeave = (event: React.MouseEvent) => {
    const next = event.nativeEvent.relatedTarget
    if (next instanceof Node && wrapRef.current?.contains(next)) {
      return
    }
    setMenuOpen(false)
  }

  const openWallet = () => {
    setMenuOpen(false)
    onPresentWalletModal()
  }

  const toggleMenu = () => {
    setMenuOpen((open) => !open)
  }

  return (
    <Wrap
      ref={wrapRef}
      onMouseEnter={useTouchMenu ? undefined : () => setMenuOpen(true)}
      onMouseLeave={useTouchMenu ? undefined : handleMouseLeave}
    >
      <Trigger
        type="button"
        $compact={compact}
        aria-label={t('Wallet menu')}
        aria-expanded={menuOpen}
        onClick={useTouchMenu ? toggleMenu : undefined}
      >
        <MetaMaskFoxIcon size={compact ? 22 : 24} />
        {showBalance &&
          (pending ? (
            <Skeleton width={compact ? 68 : 120} height={compact ? 18 : 32} />
          ) : (
            <BalanceStack $compact={compact} as="span">
              <Text bold fontSize="15px" color="text" lineHeight="1" as="span">
                <BalanceAmount>{usdLabel}</BalanceAmount>
              </Text>
              {!compact && summaryLabel ? (
                <TokenSummary title={summaryLabel}>{summaryLabel}</TokenSummary>
              ) : null}
            </BalanceStack>
          ))}
        <ChevronSlot aria-hidden>
          <ChevronDownIcon width="18px" color="text" />
        </ChevronSlot>
      </Trigger>

      {menuOpen && (
        <MenuPanel>
          <MenuBalances>
            <MenuBalanceRow>
              <Text fontSize="12px" color="textSubtle">
                {t('Total')}
              </Text>
              <MenuBalanceValue>{pending ? '…' : usdLabel}</MenuBalanceValue>
            </MenuBalanceRow>
            {lines.map((line) => (
              <MenuBalanceRow key={line.symbol}>
                <Text fontSize="12px" color="text" bold>
                  {line.symbol}
                </Text>
                <MenuBalanceRight>
                  <MenuBalanceValue $muted={line.usdLabel === '-'}>{line.usdLabel}</MenuBalanceValue>
                  <MenuBalanceAmount>
                    {line.value} {line.symbol}
                  </MenuBalanceAmount>
                </MenuBalanceRight>
              </MenuBalanceRow>
            ))}
          </MenuBalances>
          <Button variant="text" width="100%" onClick={openWallet}>
            {t('Wallet')}
            {hasLowBnbBalance ? ' ⚠' : ''}
          </Button>
          <Button
            variant="text"
            width="100%"
            onClick={() => {
              setMenuOpen(false)
              onPresentTransactions()
            }}
          >
            {t('Transactions')}
          </Button>
          <Button
            variant="text"
            width="100%"
            onClick={() => {
              setMenuOpen(false)
              changeAccount()
            }}
          >
            {t('Change Account')}
          </Button>
          <Button
            variant="text"
            width="100%"
            onClick={() => {
              setMenuOpen(false)
              logout()
            }}
          >
            {t('Disconnect')}
          </Button>
        </MenuPanel>
      )}
    </Wrap>
  )
}

export default NavWalletPill
