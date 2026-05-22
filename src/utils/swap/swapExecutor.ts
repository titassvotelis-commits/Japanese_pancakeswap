import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { TransactionResponse, Web3Provider } from '@ethersproject/providers'
import { JSBI, Percent, Trade } from '@pancakeswap/sdk'
import { BIPS_BASE } from 'config/constants'
import { calculateGasMargin, getSigner } from 'utils'
import isZero from 'utils/isZero'
import { abi as IUniswapV2Router02ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import { TRUSTED_ROUTERS } from './constants'
import { parseSwapError } from './parseSwapError'
import { getOrderedSwapCallParameters } from './swapVariants'
import { SwapExecutionPlan, SwapStep } from './types'

const FALLBACK_SWAP_GAS_LIMIT = BigNumber.from(500000)

function getTrustedRouterContract(
  routerAddress: string,
  library: Web3Provider,
  account: string,
): Contract {
  const normalized = routerAddress.toLowerCase()
  const allowed = Object.values(TRUSTED_ROUTERS).map((a) => a.toLowerCase())
  if (!allowed.includes(normalized)) {
    throw new Error(`Router not whitelisted: ${routerAddress}`)
  }
  return new Contract(routerAddress, IUniswapV2Router02ABI, getSigner(library, account))
}

export interface ExecuteSwapStepParams {
  step: SwapStep
  library: Web3Provider
  account: string
  recipient: string
  allowedSlippage: number
  deadline: number
  gasPrice: string | undefined
}

export async function executeSwapStep({
  step,
  library,
  account,
  recipient,
  allowedSlippage,
  deadline,
  gasPrice,
}: ExecuteSwapStepParams): Promise<TransactionResponse> {
  const contract = getTrustedRouterContract(step.routerAddress, library, account)
  const slippage = new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE)
  const variants = getOrderedSwapCallParameters(step.trade, {
    allowedSlippage: slippage,
    recipient,
    deadline,
  })

  let lastError: Error | undefined
  for (let i = 0; i < variants.length; i += 1) {
    const { methodName, args, value } = variants[i]
    const options = !value || isZero(value) ? {} : { value }
    try {
      let gasEstimate: BigNumber
      try {
        // eslint-disable-next-line no-await-in-loop
        gasEstimate = await contract.estimateGas[methodName](...args, options)
      } catch {
        gasEstimate = FALLBACK_SWAP_GAS_LIMIT
      }

      // eslint-disable-next-line no-await-in-loop
      const tx = await contract[methodName](...args, {
        gasLimit: calculateGasMargin(gasEstimate),
        gasPrice,
        ...(value && !isZero(value) ? { value, from: account } : { from: account }),
      })
      return tx
    } catch (e) {
      lastError = new Error(parseSwapError(e))
    }
  }
  throw lastError ?? new Error('Swap step failed')
}

export async function executeSwapPlan(
  plan: SwapExecutionPlan,
  params: Omit<ExecuteSwapStepParams, 'step'>,
  waitForReceipt: (hash: string) => Promise<void>,
): Promise<string> {
  if (plan.kind === 'single' && plan.steps.length === 1) {
    const tx = await executeSwapStep({ ...params, step: plan.steps[0] })
    return tx.hash
  }

  return plan.steps.reduce(async (pending, step, index) => {
    await pending
    const tx = await executeSwapStep({ ...params, step })
    if (index < plan.steps.length - 1) {
      await waitForReceipt(tx.hash)
    }
    return tx.hash
  }, Promise.resolve(''))
}
