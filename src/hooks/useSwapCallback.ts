import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { Web3Provider } from '@ethersproject/providers'
import { ETHER, TokenAmount, Trade } from '@pancakeswap/sdk'
import { abi as IERC20ABI } from '@uniswap/v2-core/build/IERC20.json'
import { useMemo } from 'react'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useGasPrice } from 'state/user/hooks'
import { INITIAL_ALLOWED_SLIPPAGE } from '../config/constants'
import { useTransactionAdder } from '../state/transactions/hooks'
import { getSigner } from '../utils'
import { buildExecutionPlan, getApprovalRouterAddress } from '../utils/swap/routeComposer'
import {
  canExecuteHybridSingleTx,
  executeHybridSwapSingleTx,
  getHybridStepOrder,
} from '../utils/swap/hybridSwap'
import { parseSwapError } from '../utils/swap/parseSwapError'
import { executeSwapStep } from '../utils/swap/swapExecutor'
import { SwapStep } from '../utils/swap/types'
import useTransactionDeadline from './useTransactionDeadline'
import useENS from './ENS/useENS'
import { useSwapExecutionPlan } from './useSwapExecutionPlan'

export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID,
}

async function assertRouterAllowance(
  trade: Trade,
  routerAddress: string,
  account: string,
  library: Web3Provider,
): Promise<void> {
  if (trade.inputAmount.currency === ETHER) return
  if (!(trade.inputAmount instanceof TokenAmount)) return

  const tokenContract = new Contract(trade.inputAmount.token.address, IERC20ABI, getSigner(library, account))
  const allowance = await tokenContract.allowance(account, routerAddress)
  if (BigNumber.from(allowance).lt(BigNumber.from(trade.inputAmount.raw.toString()))) {
    throw new Error(
      `Please enable ${trade.inputAmount.currency.symbol} first using the Approve button, then confirm the swap.`,
    )
  }
}

/** Legacy two-tx hybrid (used when the router has not been redeployed with swapExactTokensForTokensHybrid). */
async function executeHybridSwapSteps(
  steps: SwapStep[],
  account: string,
  recipient: string,
  library: Web3Provider,
  gasPrice: string | undefined,
  allowedSlippage: number,
  deadlineNum: number,
  addTransaction: ReturnType<typeof useTransactionAdder>,
): Promise<string> {
  let lastHash = ''
  for (let i = 0; i < steps.length; i += 1) {
    const step = steps[i]
    const stepRecipient = i < steps.length - 1 ? account : recipient

    // eslint-disable-next-line no-await-in-loop
    await assertRouterAllowance(step.trade, step.routerAddress, account, library)

    // eslint-disable-next-line no-await-in-loop
    const tx = await executeSwapStep({
      step,
      library,
      account,
      recipient: stepRecipient,
      allowedSlippage,
      deadline: deadlineNum,
      gasPrice,
    })
    lastHash = tx.hash

    addTransaction(tx, {
      summary: `Swap ${step.trade.inputAmount.toSignificant(3)} ${step.trade.inputAmount.currency.symbol} for ${step.trade.outputAmount.toSignificant(3)} ${step.trade.outputAmount.currency.symbol} (step ${i + 1}/${steps.length})`,
    })

    if (i < steps.length - 1) {
      // eslint-disable-next-line no-await-in-loop
      await library.waitForTransaction(tx.hash)
    }
  }
  return lastHash
}

export function useSwapCallback(
  trade: Trade | undefined,
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE,
  recipientAddressOrName: string | null,
): { state: SwapCallbackState; callback: null | (() => Promise<string>); error: string | null } {
  const { account, chainId, library } = useActiveWeb3React()
  const gasPrice = useGasPrice()
  const plan = useSwapExecutionPlan(trade)
  const addTransaction = useTransactionAdder()
  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress
  const deadline = useTransactionDeadline()

  return useMemo(() => {
    if (!trade || !library || !account || !chainId) {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Missing dependencies' }
    }
    if (!recipient) {
      if (recipientAddressOrName !== null) {
        return { state: SwapCallbackState.INVALID, callback: null, error: 'Invalid recipient' }
      }
      return { state: SwapCallbackState.LOADING, callback: null, error: null }
    }
    if (!deadline) {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Transaction deadline unavailable' }
    }

    const executionPlan = plan ?? buildExecutionPlan(trade)

    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        const deadlineNum = deadline.toNumber()

        if (executionPlan.kind === 'hybrid' && executionPlan.steps.length > 1) {
          if (canExecuteHybridSingleTx(executionPlan)) {
            try {
              await assertRouterAllowance(
                executionPlan.steps[0].trade,
                getApprovalRouterAddress(executionPlan),
                account,
                library,
              )
              const tx = await executeHybridSwapSingleTx(
                executionPlan,
                library,
                account,
                recipient,
                allowedSlippage,
                deadlineNum,
                gasPrice,
              )
              const base = `Swap ${trade.inputAmount.toSignificant(3)} ${trade.inputAmount.currency.symbol} for ${trade.outputAmount.toSignificant(3)} ${trade.outputAmount.currency.symbol}`
              addTransaction(tx, { summary: base })
              return tx.hash
            } catch (hybridSingleError) {
              const message = parseSwapError(hybridSingleError)
              const missingContractMethod =
                message.toLowerCase().includes('function') ||
                message.toLowerCase().includes('revert') ||
                message.toLowerCase().includes('call exception')
              if (getHybridStepOrder(executionPlan) === 'local-first' && missingContractMethod) {
                throw new Error(
                  'Hybrid executor must be redeployed for JNTo→TKO. Run: cd contracts && npm run deploy-hybrid-executor',
                )
              }
              if (!missingContractMethod) {
                throw new Error(message)
              }
              console.warn('Single-tx hybrid unavailable, falling back to sequential swaps', hybridSingleError)
            }
          }

          try {
            return await executeHybridSwapSteps(
              executionPlan.steps,
              account,
              recipient,
              library,
              gasPrice,
              allowedSlippage,
              deadlineNum,
              addTransaction,
            )
          } catch (hybridError) {
            throw new Error(parseSwapError(hybridError))
          }
        }

        if (executionPlan.steps.length === 1) {
          try {
            await assertRouterAllowance(
              executionPlan.steps[0].trade,
              executionPlan.steps[0].routerAddress,
              account,
              library,
            )
            const tx = await executeSwapStep({
              step: executionPlan.steps[0],
              library,
              account,
              recipient,
              allowedSlippage,
              deadline: deadlineNum,
              gasPrice,
            })
            const base = `Swap ${trade.inputAmount.toSignificant(3)} ${trade.inputAmount.currency.symbol} for ${trade.outputAmount.toSignificant(3)} ${trade.outputAmount.currency.symbol}`
            addTransaction(tx, { summary: base })
            return tx.hash
          } catch (singleExecError) {
            throw new Error(parseSwapError(singleExecError))
          }
        }

        throw new Error('Unable to execute swap route')
      },
      error: null,
    }
  }, [
    trade,
    library,
    account,
    chainId,
    recipient,
    recipientAddressOrName,
    addTransaction,
    gasPrice,
    plan,
    deadline,
    allowedSlippage,
  ])
}
