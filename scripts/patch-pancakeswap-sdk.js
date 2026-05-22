/**
 * Patches @pancakeswap/sdk to use Optimus DEX factory + init code hash from contracts/deployment.json.
 * Run after deploy: node scripts/patch-pancakeswap-sdk.js
 */
const fs = require('fs')
const path = require('path')

const deploymentPath = path.join(__dirname, '..', 'contracts', 'deployment.json')
if (!fs.existsSync(deploymentPath)) {
  console.log('Skip SDK patch: contracts/deployment.json not found (deploy first)')
  process.exit(0)
}

const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'))
const FACTORY = deployment.factory
const INIT_CODE_HASH = deployment.initCodePairHash

const OLD_FACTORY = '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'
const OLD_INIT = '0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5'

const sdkDist = path.join(__dirname, '..', 'node_modules', '@pancakeswap', 'sdk', 'dist')
if (!fs.existsSync(sdkDist)) {
  console.warn('Skip SDK patch: @pancakeswap/sdk not installed')
  process.exit(0)
}

let patched = 0
fs.readdirSync(sdkDist)
  .filter((f) => f.endsWith('.js') || f.endsWith('.d.ts'))
  .forEach((file) => {
    const filePath = path.join(sdkDist, file)
    let content = fs.readFileSync(filePath, 'utf8')
    let changed = false
    if (content.includes(OLD_FACTORY)) {
      content = content.split(OLD_FACTORY).join(FACTORY)
      changed = true
    }
    if (content.includes(OLD_INIT)) {
      content = content.split(OLD_INIT).join(INIT_CODE_HASH)
      changed = true
    }
    if (changed) {
      fs.writeFileSync(filePath, content)
      patched += 1
      console.log('Patched', file)
    }
  })

console.log(`SDK factory=${FACTORY}`)
console.log(`SDK initCodeHash=${INIT_CODE_HASH}`)
console.log(`Patched ${patched} file(s)`)
