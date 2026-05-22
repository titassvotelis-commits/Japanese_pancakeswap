import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { TransactionResponse, Web3Provider } from '@ethersproject/providers'
import { ETHER, JSBI, Percent, Token } from '@pancakeswap/sdk'
import {
  BIPS_BASE,
  HYBRID_SWAP_EXECUTOR_ADDRESS,
  HYBRID_SWAP_SUPPORTS_LOCAL_FIRST,
  ROUTER_ADDRESS,
} from 'config/constants'
import { calculateGasMargin, getSigner } from 'utils'
import { TRUSTED_ROUTERS } from './constants'
import { parseSwapError } from './parseSwapError'
import { SwapExecutionPlan } from './types'

const HYBRID_SWAP_ABI = [
  'function swapExactTokensForTokensHybrid(address externalRouter, address localRouter, uint amountIn, uint amountOutMinExternal, address[] pathExternal, uint amountOutMinLocal, address[] pathLocal, address to, uint deadline) returns (uint amountOut)',
  'function swapExactTokensForTokensLocalFirst(address localRouter, address externalRouter, uint amountIn, uint amountOutMinLocal, address[] pathLocal, uint amountOutMinExternal, address[] pathExternal, address to, uint deadline) returns (uint amountOut)',
]

export type HybridStepOrder = 'external-first' | 'local-first'

function getHybridExecutorAddress(): string | undefined {
  return HYBRID_SWAP_EXECUTOR_ADDRESS?.length > 2 ? HYBRID_SWAP_EXECUTOR_ADDRESS : undefined
}

const FALLBACK_HYBRID_GAS_LIMIT = BigNumber.from(700000)

export function getHybridStepOrder(plan: SwapExecutionPlan): HybridStepOrder | null {
  if (plan.kind !== 'hybrid' || plan.steps.length !== 2) {
    return null
  }
  const [first, second] = plan.steps
  if (first.source === 'pancake' && second.source === 'local') {
    return 'external-first'
  }
  if (first.source === 'local' && second.source === 'pancake') {
    return 'local-first'
  }
  return null
}

function planUsesNativeCurrencyInput(plan: SwapExecutionPlan): boolean {
  if (plan.displayTrade.inputAmount.currency === ETHER) {
    return true
  }
  return plan.steps.some((step) => step.trade.inputAmount.currency === ETHER)
}

export function canExecuteHybridSingleTx(plan: SwapExecutionPlan): boolean {
  const order = getHybridStepOrder(plan)
  if (!order || !getHybridExecutorAddress()) {
    return false
  }
  if (order === 'local-first' && !HYBRID_SWAP_SUPPORTS_LOCAL_FIRST) {
    return false
  }
  // HybridSwapExecutor only supports ERC20 transferFrom — not native BNB.
  if (planUsesNativeCurrencyInput(plan)) {
    return false
  }
  return true
}

function tradePathAddresses(trade: SwapExecutionPlan['steps'][0]['trade']): string[] {
  return trade.route.path.map((token) => (token as Token).address)
}

export async function executeHybridSwapSingleTx(
  plan: SwapExecutionPlan,
  library: Web3Provider,
  account: string,
  recipient: string,
  allowedSlippage: number,
  deadline: number,
  gasPrice: string | undefined,
): Promise<TransactionResponse> {
  const order = getHybridStepOrder(plan)
  if (!order) {
    throw new Error('Invalid hybrid swap plan')
  }

  const slippage = new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE)
  const executorAddress = getHybridExecutorAddress()
  if (!executorAddress) {
    throw new Error('Hybrid swap executor not deployed')
  }

  const contract = new Contract(executorAddress, HYBRID_SWAP_ABI, getSigner(library, account))

  try {
    let gasEstimate: BigNumber

    if (order === 'external-first') {
      const [externalStep, localStep] = plan.steps
      const amountIn = externalStep.trade.inputAmount.raw.toString()
      const amountOutMinExternal = externalStep.trade.minimumAmountOut(slippage).raw.toString()
      const amountOutMinLocal = localStep.trade.minimumAmountOut(slippage).raw.toString()
      const pathExternal = tradePathAddresses(externalStep.trade)
      const pathLocal = tradePathAddresses(localStep.trade)

      try {
        gasEstimate = await contract.estimateGas.swapExactTokensForTokensHybrid(
          TRUSTED_ROUTERS.pancake,
          ROUTER_ADDRESS,
          amountIn,
          amountOutMinExternal,
          pathExternal,
          amountOutMinLocal,
          pathLocal,
          recipient,
          deadline,
        )
      } catch {
        gasEstimate = FALLBACK_HYBRID_GAS_LIMIT
      }

      return contract.swapExactTokensForTokensHybrid(
        TRUSTED_ROUTERS.pancake,
        ROUTER_ADDRESS,
        amountIn,
        amountOutMinExternal,
        pathExternal,
        amountOutMinLocal,
        pathLocal,
        recipient,
        deadline,
        {
          gasLimit: calculateGasMargin(gasEstimate),
          gasPrice,
          from: account,
        },
      )
    }

    const [localStep, externalStep] = plan.steps
    const amountIn = localStep.trade.inputAmount.raw.toString()
    const amountOutMinLocal = localStep.trade.minimumAmountOut(slippage).raw.toString()
    const amountOutMinExternal = externalStep.trade.minimumAmountOut(slippage).raw.toString()
    const pathLocal = tradePathAddresses(localStep.trade)
    const pathExternal = tradePathAddresses(externalStep.trade)

    try {
      gasEstimate = await contract.estimateGas.swapExactTokensForTokensLocalFirst(
        ROUTER_ADDRESS,
        TRUSTED_ROUTERS.pancake,
        amountIn,
        amountOutMinLocal,
        pathLocal,
        amountOutMinExternal,
        pathExternal,
        recipient,
        deadline,
      )
    } catch {
      gasEstimate = FALLBACK_HYBRID_GAS_LIMIT
    }

    return contract.swapExactTokensForTokensLocalFirst(
      ROUTER_ADDRESS,
      TRUSTED_ROUTERS.pancake,
      amountIn,
      amountOutMinLocal,
      pathLocal,
      amountOutMinExternal,
      pathExternal,
      recipient,
      deadline,
      {
        gasLimit: calculateGasMargin(gasEstimate),
        gasPrice,
        from: account,
      },
    )
  } catch (error) {
    throw new Error(parseSwapError(error))
  }
}
