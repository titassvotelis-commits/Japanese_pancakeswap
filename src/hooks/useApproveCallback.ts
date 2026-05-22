import { MaxUint256 } from '@ethersproject/constants'
import { TransactionResponse } from '@ethersproject/providers'
import { Trade, TokenAmount, CurrencyAmount, ETHER } from '@pancakeswap/sdk'
import { useCallback, useMemo } from 'react'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { ROUTER_ADDRESS } from '../config/constants'
import { canExecuteHybridSingleTx } from '../utils/swap/hybridSwap'
import { buildExecutionPlan, getApprovalRouterAddress } from '../utils/swap/routeComposer'
import { useSwapExecutionPlan } from './useSwapExecutionPlan'
import useTokenAllowance from './useTokenAllowance'
import { Field } from '../state/swap/actions'
import { useTransactionAdder, useHasPendingApproval } from '../state/transactions/hooks'
import { computeSlippageAdjustedAmounts } from '../utils/prices'
import { calculateGasMargin } from '../utils'
import { useTokenContract } from './useContract'
import { useCallWithGasPrice } from './useCallWithGasPrice'

export enum ApprovalState {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  APPROVED,
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApproveCallback(
  amountToApprove?: CurrencyAmount,
  spender?: string,
): [ApprovalState, () => Promise<void>] {
  const { account } = useActiveWeb3React()
  const { callWithGasPrice } = useCallWithGasPrice()
  const token = amountToApprove instanceof TokenAmount ? amountToApprove.token : undefined
  const currentAllowance = useTokenAllowance(token, account ?? undefined, spender)
  const pendingApproval = useHasPendingApproval(token?.address, spender)

  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN
    if (amountToApprove.currency === ETHER) return ApprovalState.APPROVED
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN

    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.lessThan(amountToApprove)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED
  }, [amountToApprove, currentAllowance, pendingApproval, spender])

  const tokenContract = useTokenContract(token?.address)
  const addTransaction = useTransactionAdder()

  const approve = useCallback(async (): Promise<void> => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error('approve was called unnecessarily')
      return
    }
    if (!token) {
      console.error('no token')
      return
    }

    if (!tokenContract) {
      console.error('tokenContract is null')
      return
    }

    if (!amountToApprove) {
      console.error('missing amount to approve')
      return
    }

    if (!spender) {
      console.error('no spender')
      return
    }

    let useExact = false

    const estimatedGas = await tokenContract.estimateGas.approve(spender, MaxUint256).catch(() => {
      // general fallback for tokens who restrict approval amounts
      useExact = true
      return tokenContract.estimateGas.approve(spender, amountToApprove.raw.toString())
    })

    // eslint-disable-next-line consistent-return
    return callWithGasPrice(
      tokenContract,
      'approve',
      [spender, useExact ? amountToApprove.raw.toString() : MaxUint256],
      {
        gasLimit: calculateGasMargin(estimatedGas),
      },
    )
      .then((response: TransactionResponse) => {
        addTransaction(response, {
          summary: `Approve ${amountToApprove.currency.symbol}`,
          approval: { tokenAddress: token.address, spender },
        })
      })
      .catch((error: Error) => {
        console.error('Failed to approve token', error)
        throw error
      })
  }, [approvalState, token, tokenContract, amountToApprove, spender, addTransaction, callWithGasPrice])

  return [approvalState, approve]
}

// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromTrade(trade?: Trade, allowedSlippage = 0) {
  const plan = useSwapExecutionPlan(trade)

  const { spender, stepTrade } = useMemo(() => {
    if (!trade) {
      return { spender: ROUTER_ADDRESS, stepTrade: undefined as Trade | undefined }
    }
    const executionPlan = plan ?? buildExecutionPlan(trade)
    const tokenStep = executionPlan.steps.find((step) => step.trade.inputAmount.currency !== ETHER)
    const step = tokenStep ?? executionPlan.steps[0]
    const spenderAddress =
      executionPlan.kind === 'hybrid' &&
      executionPlan.steps.length > 1 &&
      tokenStep &&
      canExecuteHybridSingleTx(executionPlan)
        ? getApprovalRouterAddress(executionPlan)
        : tokenStep?.routerAddress ?? step?.routerAddress ?? ROUTER_ADDRESS
    return { spender: spenderAddress, stepTrade: step?.trade ?? trade }
  }, [trade, plan])

  const amountToApprove = useMemo(() => {
    if (!stepTrade) {
      return undefined
    }
    const amount = computeSlippageAdjustedAmounts(stepTrade, allowedSlippage)[Field.INPUT]
    return amount?.currency === ETHER ? undefined : amount
  }, [stepTrade, allowedSlippage])

  return useApproveCallback(amountToApprove, spender)
}
