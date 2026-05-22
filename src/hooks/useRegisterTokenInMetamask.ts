import { useCallback } from 'react'
import { useTranslation } from 'contexts/Localization'
import useToast from 'hooks/useToast'
import { isMetaMaskProvider } from 'utils/isMetaMaskProvider'
import { registerToken } from 'utils/wallet'

export default function useRegisterTokenInMetamask() {
  const { t } = useTranslation()
  const { toastSuccess, toastError } = useToast()

  return useCallback(
    async (tokenAddress: string, tokenSymbol: string, tokenDecimals: number) => {
      if (!isMetaMaskProvider()) {
        toastError(t('Error'), t('Add %asset% to Metamask', { asset: tokenSymbol }))
        return
      }

      const added = await registerToken(tokenAddress, tokenSymbol, tokenDecimals)
      if (added) {
        toastSuccess(t('Done!'), t('Add %asset% to Metamask', { asset: tokenSymbol }))
      } else {
        toastError(t('Error'), t('Add %asset% to Metamask', { asset: tokenSymbol }))
      }
    },
    [t, toastError, toastSuccess],
  )
}
