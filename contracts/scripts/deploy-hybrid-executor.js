const fs = require('fs')
const path = require('path')
const hre = require('hardhat')

async function main() {
  const root = path.join(__dirname, '..')
  const deploymentPath = path.join(root, 'deployment.json')
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'))

  const [deployer] = await hre.ethers.getSigners()
  console.log('Deployer:', deployer.address)

  const Executor = await hre.ethers.getContractFactory('HybridSwapExecutor')
  const executor = await Executor.deploy()
  await executor.waitForDeployment()
  const hybridSwapExecutor = await executor.getAddress()

  console.log('HybridSwapExecutor:', hybridSwapExecutor)
  console.log('Local router:', deployment.router)
  console.log('Pancake router: 0x10ED43C718714eb63d5aA57B78B54704E256024E')

  deployment.hybridSwapExecutor = hybridSwapExecutor
  deployment.hybridSwapExecutorDeployedAt = new Date().toISOString()
  fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2))

  fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2))

  const indexPath = path.join(__dirname, '..', '..', 'src', 'config', 'constants', 'index.ts')
  let indexTs = fs.readFileSync(indexPath, 'utf8')
  const executorLine = `export const HYBRID_SWAP_EXECUTOR_ADDRESS = '${hybridSwapExecutor}'`
  const localFirstLine = 'export const HYBRID_SWAP_SUPPORTS_LOCAL_FIRST = true'
  if (indexTs.includes('HYBRID_SWAP_EXECUTOR_ADDRESS')) {
    indexTs = indexTs.replace(/export const HYBRID_SWAP_EXECUTOR_ADDRESS = '[^']*'/, executorLine)
  } else {
    indexTs = indexTs.replace(
      /export const INIT_CODE_PAIR_HASH = '[^']+'/,
      (m) => `${m}\n/** One-tx Pancake + MetakeySwap hybrid swaps */\n${executorLine}`,
    )
  }
  if (indexTs.includes('HYBRID_SWAP_SUPPORTS_LOCAL_FIRST')) {
    indexTs = indexTs.replace(/export const HYBRID_SWAP_SUPPORTS_LOCAL_FIRST = \w+/, localFirstLine)
  } else {
    indexTs = indexTs.replace(executorLine, `${executorLine}\n${localFirstLine}`)
  }
  fs.writeFileSync(indexPath, indexTs)
  console.log('Updated src/config/constants/index.ts')

  console.log('\nDone. Refresh the swap page in the browser.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
