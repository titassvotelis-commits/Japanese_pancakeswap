/* eslint-disable */
const fs = require('fs')
const path = require('path')

const KEYS = [
  'METAKEY SWAP',
  'Telegram announcements',
  'Email',
  'Switch to light mode',
  'Switch to dark mode',
  'Language',
  'JNTo price (USD)',
  'JNTo price: $%price%',
  'JNTo price and buy',
  'Launch',
  'Main navigation',
  'Native token',
  'JNTo powers Optimus.',
  'JNToken — the core asset behind swaps, farms, and rewards on Optimus Swap.',
  'Swap into JNTo instantly.',
  'Pair BNB or stablecoins with JNTo — deep routes, minimal friction.',
  'Trade JNTo',
  'Stake JNTo. Harvest more.',
  'Farm and pool your JNTo to compound yields across the ecosystem.',
  'Stake JNTo',
  'JNTo promotion',
  'Dismiss promotion',
  'Show promotion %index%',
  'Flip chart pair',
  'Charting by TradingView',
  'Candles',
  'fx',
  'Price chart',
  'Close chart',
  'Toggle price direction',
  'Show chart',
  'Hide chart',
  'Wrap',
  'Unwrap',
  'Unsupported Assets',
  'Scroll to footer',
  "Everyone's",
  'Favorite JNTo DEX',
  'Trade JNToken Instantly on BNB Chain',
  'BNB Chain',
  'Select from token on swap page',
  'Amount to swap',
  'Switch from and to tokens',
  'Select to token on swap page',
  'Get Started',
  'Estimated from live pool prices · final amount on swap page',
  'Connect your wallet on the swap page to trade',
  'Trade JNTo with BNB, stablecoins, and more on BNB Chain',
  'Swap JNTo',
  'Trade BNB, stablecoins, and more into JNToken with optimized routing.',
  'Farm & Earn',
  'Stake LP tokens and harvest JNTo rewards across Optimus farms.',
  'Provide BNB–JNTo liquidity and earn fees from every swap.',
  'Explore Optimus',
  'Optimus Swap — Trade JNTo on BNB Chain',
  'Swap, farm, and earn with JNToken (JNTo) on Optimus Swap — the home of JNTo on BNB Smart Chain.',
  'Scroll to features',
  '24h Change',
  '24h High',
  '24h Low',
  'Select tokens to view the chart',
  'Reference chart for %pair% (TradingView)',
  'No data here',
  'Binance pricing',
  'Get JNTo',
]

function m(values) {
  const o = {}
  KEYS.forEach((k, i) => {
    o[k] = values[i]
  })
  return o
}

const jaJP = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../public/locales/ja-JP.json'), 'utf8'),
)
const jaJPTranslations = Object.fromEntries(KEYS.map((k) => [k, jaJP[k]]))

const LOCALE_TRANSLATIONS = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'ui-key-translations-locales.json'), 'utf8'),
)
LOCALE_TRANSLATIONS['ja-JP'] = jaJPTranslations

const locales = [
  'ar-SA', 'bn-BD', 'de-DE', 'el-GR', 'es-ES', 'fi-FI', 'fil-PH', 'fr-FR', 'hi-IN', 'hu-HU',
  'id-ID', 'it-IT', 'ja-JP', 'ko-KR', 'nl-NL', 'pl-PL', 'pt-BR', 'pt-PT', 'ro-RO', 'ru-RU',
  'sv-SE', 'ta-IN', 'tr-TR', 'uk-UA', 'vi-VN', 'zh-CN', 'zh-TW',
]

for (const locale of locales) {
  if (!LOCALE_TRANSLATIONS[locale]) {
    throw new Error(`Missing locale: ${locale}`)
  }
  for (const key of KEYS) {
    if (!(key in LOCALE_TRANSLATIONS[locale])) {
      throw new Error(`Missing key ${key} in ${locale}`)
    }
  }
}

function serializeTranslations(obj) {
  const lines = ['const LOCALE_TRANSLATIONS = {']
  for (const locale of locales) {
    lines.push(`  '${locale}': {`)
    for (const key of KEYS) {
      const val = LOCALE_TRANSLATIONS[locale][key]
      lines.push(`    ${JSON.stringify(key)}: ${JSON.stringify(val)},`)
    }
    lines.push('  },')
  }
  lines.push('}')
  return lines.join('\n')
}

const scriptBody = `const fs = require('fs')
const path = require('path')

const KEYS = ${JSON.stringify(KEYS, null, 2).replace(/\n/g, '\n')}

${serializeTranslations(LOCALE_TRANSLATIONS)}

const outPath = path.join(__dirname, 'ui-key-translations.json')
const output = {}

for (const locale of Object.keys(LOCALE_TRANSLATIONS)) {
  output[locale] = {}
  for (const key of KEYS) {
    output[locale][key] = LOCALE_TRANSLATIONS[locale][key]
  }
}

fs.writeFileSync(outPath, \`\${JSON.stringify(output, null, 2)}\\n\`, 'utf8')
console.log('Wrote', outPath)

// node build-ui-key-translations.js
`

fs.writeFileSync(path.join(__dirname, 'build-ui-key-translations.js'), scriptBody, 'utf8')
console.log('Wrote build-ui-key-translations.js')
