const fs = require('fs')
const path = require('path')
const hre = require('hardhat')

const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
const FEE_TREASURY = process.env.FEE_TREASURY || '0x8335Ff670d9506CE506a9D758EF86D9e66EC8039'
const FARM_REWARD_PER_BLOCK = process.env.FARM_REWARD_PER_BLOCK || '10000000000000000'
const POOL_REWARD_PER_BLOCK = process.env.POOL_REWARD_PER_BLOCK || '5000000000000000'

async function verify(name, address, constructorArguments) {
  console.log(`Verifying ${name} at ${address}...`)
  try {
    await hre.run('verify:verify', {
      address,
      constructorArguments,
    })
    console.log(`${name} verified`)
  } catch (e) {
    const msg = e.message || String(e)
    if (msg.includes('Already Verified') || msg.includes('already verified')) {
      console.log(`${name} already verified`)
    } else {
      console.warn(`${name} verify failed:`, msg)
    }
  }
}

async function main() {
  const deployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'deployment.json'), 'utf8'),
  )

  await verify('JNTo', deployment.jnto, [])
  await verify('PancakeFactory', deployment.factory, [deployment.deployer])
  await verify('PancakeRouter', deployment.router, [deployment.factory, WBNB])
  await verify('MasterChef', deployment.masterChef, [deployment.jnto, FEE_TREASURY])
  await verify('SousChef', deployment.sousChef, [deployment.jnto, POOL_REWARD_PER_BLOCK])

  console.log('Verify pass finished. LP pair:', deployment.pairJNToUsdt)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
