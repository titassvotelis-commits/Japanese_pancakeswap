const fs = require('fs')
const path = require('path')
const hre = require('hardhat')

const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'

/**
 * Redeploy PancakeRouter only — required when router used wrong INIT_CODE_PAIR_HASH
 * (addLiquidity sent tokens to a non-contract pair address).
 * Reads factory from deployment.json, updates router address in deployment.json + address.txt.
 */
async function main() {
  const root = path.join(__dirname, '..')
  const deploymentPath = path.join(root, 'deployment.json')
  if (!fs.existsSync(deploymentPath)) {
    throw new Error('deployment.json missing — run npm run deploy first')
  }
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'))
  const factoryAddress = deployment.factory
  if (!factoryAddress) {
    throw new Error('deployment.json has no factory address')
  }

  const [deployer] = await hre.ethers.getSigners()
  console.log('Deployer:', deployer.address)

  const Router = await hre.ethers.getContractFactory('PancakeRouter')
  const router = await Router.deploy(factoryAddress, WBNB)
  await router.waitForDeployment()
  const routerAddress = await router.getAddress()
  console.log('New PancakeRouter:', routerAddress)
  console.log('Old router:', deployment.router)

  const factory = await hre.ethers.getContractAt(
    ['function INIT_CODE_PAIR_HASH() view returns (bytes32)', 'function getPair(address,address) view returns (address)'],
    factoryAddress,
  )
  const initCodePairHash = await factory.INIT_CODE_PAIR_HASH()
  const pair = await factory.getPair(deployment.jnto, deployment.usdt)
  console.log('INIT_CODE_PAIR_HASH:', initCodePairHash)
  console.log('JNTo-USDT pair:', pair)

  deployment.router = routerAddress
  deployment.initCodePairHash = initCodePairHash
  deployment.routerRedeployedAt = new Date().toISOString()
  fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2))

  const addressTxt = fs.readFileSync(path.join(root, 'address.txt'), 'utf8')
  const updatedTxt = addressTxt.replace(/^ROUTER=.*$/m, `ROUTER=${routerAddress}`)
  fs.writeFileSync(path.join(root, 'address.txt'), updatedTxt)

  console.log('\nUpdated deployment.json and address.txt')
  console.log('Run from contracts/: npm run sync-frontend')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
