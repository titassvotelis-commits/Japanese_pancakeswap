import React, { useState } from 'react'
import styled from 'styled-components'
import {
  BinanceChainIcon,
  Box,
  Button,
  ConnectorNames,
  Grid,
  Heading,
  InjectedModalProps,
  MetamaskIcon,
  ModalCloseButton,
  ModalTitle,
  SvgProps,
  Text,
  TrustWalletIcon,
  connectorLocalStorageKey,
} from '@pancakeswap/uikit'
import { AppModalBody, AppModalContainer, AppModalHeader } from 'components/Modal/AppModalStyles'
import { BINANCE_WALLET_INSTALL_URL, WALLET_INSTALL_URLS } from 'config/walletInstallUrls'
import useTheme from 'hooks/useTheme'
import { isBinanceChainInstalled, isWalletInstalled, setStoredWalletKey, WalletKey } from 'utils/walletProviders'

const WalletButton = styled(Button).attrs({ width: '100%', variant: 'text', py: '16px' })`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: auto;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
`

const WalletWrapper = styled(Box)`
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
`

const InstallPanel = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 8px 16px 16px;
  text-align: center;
`

type BscWalletOption = {
  title: string
  icon: React.FC<SvgProps>
  connectorId: ConnectorNames
  walletKey?: WalletKey
}

/** BSC-compatible wallets only — each opens its own provider. */
const BSC_WALLETS: BscWalletOption[] = [
  {
    title: 'Metamask',
    icon: MetamaskIcon,
    connectorId: ConnectorNames.Injected,
    walletKey: WalletKey.MetaMask,
  },
  {
    title: 'Trust Wallet',
    icon: TrustWalletIcon,
    connectorId: ConnectorNames.Injected,
    walletKey: WalletKey.Trust,
  },
  {
    title: 'Binance Chain',
    icon: BinanceChainIcon,
    connectorId: ConnectorNames.BSC,
  },
]

function isWalletReady(wallet: BscWalletOption): boolean {
  if (wallet.walletKey) {
    return isWalletInstalled(wallet.walletKey)
  }
  if (wallet.connectorId === ConnectorNames.BSC) {
    return isBinanceChainInstalled()
  }
  return true
}

interface ConnectWalletModalProps extends InjectedModalProps {
  login: (connectorId: ConnectorNames, walletKey?: WalletKey) => void
  t: (key: string) => string
}

const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ login, onDismiss = () => null, t }) => {
  const { theme } = useTheme()
  const [installPrompt, setInstallPrompt] = useState<{
    walletKey?: WalletKey
    title: string
    icon: React.FC<SvgProps>
    installUrl: string
  } | null>(null)

  const handleWalletClick = (wallet: BscWalletOption) => {
    if (!isWalletReady(wallet)) {
      const installUrl =
        wallet.walletKey && WALLET_INSTALL_URLS[wallet.walletKey]
          ? WALLET_INSTALL_URLS[wallet.walletKey]
          : wallet.connectorId === ConnectorNames.BSC
            ? BINANCE_WALLET_INSTALL_URL
            : undefined
      if (installUrl) {
        setInstallPrompt({
          walletKey: wallet.walletKey,
          title: wallet.title,
          icon: wallet.icon,
          installUrl,
        })
      }
      return
    }

    setInstallPrompt(null)
    if (wallet.walletKey) {
      setStoredWalletKey(wallet.walletKey)
    }
    window.localStorage.setItem(connectorLocalStorageKey, wallet.connectorId)
    const connectorId = wallet.connectorId
    const walletKey = wallet.walletKey
    onDismiss()
    window.setTimeout(() => {
      login(connectorId, walletKey)
    }, 200)
  }

  const installLabel =
    installPrompt?.walletKey === WalletKey.MetaMask
      ? t('Install MetaMask')
      : t('Install %wallet%').replace('%wallet%', installPrompt?.title ?? '')

  return (
    <AppModalContainer minWidth="320px">
      <AppModalHeader background={theme.colors.gradients.bubblegum}>
        <ModalTitle>
          <Heading>{installPrompt ? installLabel : t('Connect Wallet')}</Heading>
        </ModalTitle>
        <ModalCloseButton onDismiss={onDismiss} />
      </AppModalHeader>
      <AppModalBody>
        {installPrompt ? (
          <InstallPanel>
            <installPrompt.icon width="56px" mb="8px" />
            <Text color="textSubtle" fontSize="14px">
              {t('%wallet% extension is not installed in this browser.').replace(
                '%wallet%',
                installPrompt.title,
              )}
            </Text>
            <Button
              as="a"
              href={installPrompt.installUrl}
              target="_blank"
              rel="noopener noreferrer"
              width="100%"
            >
              {installLabel}
            </Button>
            <Button variant="text" width="100%" onClick={() => setInstallPrompt(null)}>
              {t('Back')}
            </Button>
          </InstallPanel>
        ) : (
          <WalletWrapper py="24px" maxHeight="453px" overflowY="auto">
            <Grid gridTemplateColumns="repeat(2, 1fr)" gridGap="8px">
              {BSC_WALLETS.map((wallet) => {
                const Icon = wallet.icon
                return (
                  <Box key={wallet.title}>
                    <WalletButton
                      variant="tertiary"
                      onClick={() => handleWalletClick(wallet)}
                      id={`wallet-connect-${wallet.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Icon width="40px" mb="8px" />
                      <Text fontSize="14px">{wallet.title}</Text>
                    </WalletButton>
                  </Box>
                )
              })}
            </Grid>
          </WalletWrapper>
        )}
        {!installPrompt && (
          <Box p="24px">
            <Text textAlign="center" color="textSubtle" as="p" fontSize="12px">
              {t('Connect a wallet that supports BNB Smart Chain (BSC)')}
            </Text>
          </Box>
        )}
      </AppModalBody>
    </AppModalContainer>
  )
}

export default ConnectWalletModal
