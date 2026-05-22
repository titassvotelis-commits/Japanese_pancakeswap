const fs = require('fs')
const path = require('path')
const hre = require('hardhat')

/**
 * BSC mainnet — Optimus / JNTo stack
 *
 * Emissions (recommended defaults):
 * - MasterChef farm (JNTo-USDT LP): 0.01 JNTo / block (~105k JNTo/year at ~3s blocks)
 * - SousChef pools (stake JNTo): 0.005 JNTo / block
 * - 25,000 JNTo sent to MasterChef, 5,000 JNTo to SousChef (adjust via env)
 */
const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
const USDT = '0x55d398326f99059fF775485246999027B3197955'
const FEE_TREASURY = process.env.FEE_TREASURY || '0x8335Ff670d9506CE506a9D758EF86D9e66EC8039'
const FARM_REWARD_PER_BLOCK = process.env.FARM_REWARD_PER_BLOCK || '10000000000000000' // 0.01 * 1e18
const POOL_REWARD_PER_BLOCK = process.env.POOL_REWARD_PER_BLOCK || '5000000000000000' // 0.005 * 1e18
const CHEF_REWARD_FUND = process.env.CHEF_REWARD_FUND || '25000000000000000000000' // 25_000 JNTo
const SOUS_REWARD_FUND = process.env.SOUS_REWARD_FUND || '5000000000000000000000' // 5_000 JNTo
const FARM_ALLOC_POINT = 1000

async function main() {
  const [deployer] = await hre.ethers.getSigners()
  console.log('Deployer:', deployer.address)
  console.log('Balance:', hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), 'BNB')

  const JNTo = await hre.ethers.getContractFactory('JNTo')
  const jnto = await JNTo.deploy()
  await jnto.waitForDeployment()
  const jntoAddress = await jnto.getAddress()
  console.log('JNTo:', jntoAddress)

  const Factory = await hre.ethers.getContractFactory('PancakeFactory')
  const factory = await Factory.deploy(deployer.address)
  await factory.waitForDeployment()
  const factoryAddress = await factory.getAddress()
  console.log('PancakeFactory:', factoryAddress)

  const initCodePairHash = await factory.INIT_CODE_PAIR_HASH()
  console.log('INIT_CODE_PAIR_HASH:', initCodePairHash)

  const Router = await hre.ethers.getContractFactory('PancakeRouter')
  const router = await Router.deploy(factoryAddress, WBNB)
  await router.waitForDeployment()
  const routerAddress = await router.getAddress()
  console.log('PancakeRouter:', routerAddress)

  const txPair = await factory.createPair(jntoAddress, USDT)
  await txPair.wait()
  const pairJNToUsdt = await factory.getPair(jntoAddress, USDT)
  console.log('JNTo-USDT LP:', pairJNToUsdt)

  const MasterChef = await hre.ethers.getContractFactory('MasterChef')
  const masterChef = await MasterChef.deploy(jntoAddress, FEE_TREASURY)
  await masterChef.waitForDeployment()
  const masterChefAddress = await masterChef.getAddress()
  console.log('MasterChef:', masterChefAddress)

  await (await masterChef.updateEmissionRate(FARM_REWARD_PER_BLOCK)).wait()
  console.log('MasterChef OptPerBlock:', FARM_REWARD_PER_BLOCK)

  await (
    await masterChef.add(pairJNToUsdt, FARM_ALLOC_POINT, 0, 0, 0)
  ).wait()
  console.log('MasterChef pool 0: JNTo-USDT LP, alloc', FARM_ALLOC_POINT)

  const SousChef = await hre.ethers.getContractFactory('SousChef')
  const sousChef = await SousChef.deploy(jntoAddress, POOL_REWARD_PER_BLOCK)
  await sousChef.waitForDeployment()
  const sousChefAddress = await sousChef.getAddress()
  console.log('SousChef:', sousChefAddress)

  await (await jnto.transfer(masterChefAddress, CHEF_REWARD_FUND)).wait()
  console.log('Funded MasterChef with', hre.ethers.formatEther(CHEF_REWARD_FUND), 'JNTo')

  await (await jnto.transfer(sousChefAddress, SOUS_REWARD_FUND)).wait()
  console.log('Funded SousChef with', hre.ethers.formatEther(SOUS_REWARD_FUND), 'JNTo')

  const deployment = {
    network: 'bsc',
    chainId: 56,
    deployer: deployer.address,
    feeTreasury: FEE_TREASURY,
    jnto: jntoAddress,
    factory: factoryAddress,
    router: routerAddress,
    wbnb: WBNB,
    usdt: USDT,
    pairJNToUsdt,
    masterChef: masterChefAddress,
    sousChef: sousChefAddress,
    initCodePairHash,
    farmRewardPerBlock: FARM_REWARD_PER_BLOCK,
    poolRewardPerBlock: POOL_REWARD_PER_BLOCK,
    farmAllocPoint: FARM_ALLOC_POINT,
    deployedAt: new Date().toISOString(),
  }

  const root = path.join(__dirname, '..')
  fs.writeFileSync(path.join(root, 'deployment.json'), JSON.stringify(deployment, null, 2))
  fs.writeFileSync(
    path.join(root, 'address.txt'),
    `JNTO=${jntoAddress}
FACTORY=${factoryAddress}
ROUTER=${routerAddress}
PAIR_JNTO_USDT=${pairJNToUsdt}
MASTERCHEF=${masterChefAddress}
SOUSCHEF=${sousChefAddress}
WBNB=${WBNB}
USDT=${USDT}
FEE_TREASURY=${FEE_TREASURY}
INIT_CODE_PAIR_HASH=${initCodePairHash}
`,
  )

  console.log('\nWrote deployment.json — run: npm run sync-frontend')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
