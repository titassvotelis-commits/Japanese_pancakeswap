/**
 * optimus-uikit Menu (dist) does not read or render `languageMenu`, so the nav
 * language slot is ignored if passed alone. This patch adds support (optional).
 * Language UI is also embedded in `globalMenu` via GlobalSettings for reliability.
 */
const fs = require('fs')
const path = require('path')

const distDir = path.join(__dirname, '..', 'node_modules', '@pancakeswap', 'uikit', 'dist')

const DESTRUCTURE_NEEDLE = 'globalMenu = _a.globalMenu, isDark = _a.isDark'
const DESTRUCTURE_REPLACE =
  'globalMenu = _a.globalMenu, languageMenu = _a.languageMenu, isDark = _a.isDark'

const JSX_RE =
  /(React__default(?:\['default'\])?\.createElement\(Flex, \{ alignItems: "center", height: "100%" \},\s*)(!isMobile && \(React__default(?:\['default'\])?\.createElement\(Box, \{ mr: "12px" \},)/g

/** Legacy CAKE price slot — shows 80×24 Skeleton when cakePriceUsd is falsy. */
const CAKE_PRICE_RE =
  /\s*!isMobile && \(React__default(?:\['default'\])?\.createElement\(Box, \{ mr: "12px" \},\s*React__default(?:\['default'\])?\.createElement\(CakePrice\$1, \{ cakePriceUsd: cakePriceUsd \}\)\)\),/g

function removeCakePriceBlock(content) {
  if (!CAKE_PRICE_RE.test(content)) {
    return content
  }
  CAKE_PRICE_RE.lastIndex = 0
  return content.replace(CAKE_PRICE_RE, '')
}

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn('Skip missing', filePath)
    return false
  }
  let content = fs.readFileSync(filePath, 'utf8')
  let changed = false

  const beforeCake = content
  content = removeCakePriceBlock(content)
  if (content !== beforeCake) {
    changed = true
    console.log('Removed CakePrice slot from', path.basename(filePath))
  }

  if (!content.includes('languageMenu = _a.languageMenu')) {
    if (!content.includes(DESTRUCTURE_NEEDLE)) {
      console.warn('Menu destructuring pattern not found in', path.basename(filePath), '- skip language')
    } else if (!JSX_RE.test(content)) {
      console.warn('Menu JSX pattern not found in', path.basename(filePath), '- skip language')
    } else {
      JSX_RE.lastIndex = 0
      content = content.replace(DESTRUCTURE_NEEDLE, DESTRUCTURE_REPLACE)
      content = content.replace(JSX_RE, '$1languageMenu,\n                    $2')
      changed = true
      console.log('Patched Menu language slot in', path.basename(filePath))
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content)
  }
  return changed
}

;['index.esm.js', 'index.cjs.js'].forEach((file) => {
  patchFile(path.join(distDir, file))
})
