/**
 * Merge missing UI translation keys into translations.json and public/locales/*.json
 * Run: node scripts/add-i18n-keys.js
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const TRANSLATIONS_PATH = path.join(ROOT, 'src/config/localization/translations.json')
const LOCALES_DIR = path.join(ROOT, 'public/locales')

/** English source keys (key === default English text). */
const NEW_KEYS = {
  'METAKEY SWAP': 'METAKEY SWAP',
  'Telegram announcements': 'Telegram announcements',
  Email: 'Email',
  'Switch to light mode': 'Switch to light mode',
  'Switch to dark mode': 'Switch to dark mode',
  Language: 'Language',
  'JNTo price (USD)': 'JNTo price (USD)',
  'JNTo price: $%price%': 'JNTo price: $%price%',
  'JNTo price and buy': 'JNTo price and buy',
  Launch: 'Launch',
  'Main navigation': 'Main navigation',
  'Native token': 'Native token',
  'JNTo powers Optimus.': 'JNTo powers Optimus.',
  'JNToken — the core asset behind swaps, farms, and rewards on Optimus Swap.':
    'JNToken — the core asset behind swaps, farms, and rewards on Optimus Swap.',
  'Swap into JNTo instantly.': 'Swap into JNTo instantly.',
  'Pair BNB or stablecoins with JNTo — deep routes, minimal friction.':
    'Pair BNB or stablecoins with JNTo — deep routes, minimal friction.',
  'Trade JNTo': 'Trade JNTo',
  'Stake JNTo. Harvest more.': 'Stake JNTo. Harvest more.',
  'Farm and pool your JNTo to compound yields across the ecosystem.':
    'Farm and pool your JNTo to compound yields across the ecosystem.',
  'Stake JNTo': 'Stake JNTo',
  'JNTo promotion': 'JNTo promotion',
  'Dismiss promotion': 'Dismiss promotion',
  'Show promotion %index%': 'Show promotion %index%',
  'Flip chart pair': 'Flip chart pair',
  'Charting by TradingView': 'Charting by TradingView',
  Candles: 'Candles',
  fx: 'fx',
  'Price chart': 'Price chart',
  'Close chart': 'Close chart',
  'Toggle price direction': 'Toggle price direction',
  'Show chart': 'Show chart',
  'Hide chart': 'Hide chart',
  Wrap: 'Wrap',
  Unwrap: 'Unwrap',
  'Unsupported Assets': 'Unsupported Assets',
  'Scroll to footer': 'Scroll to footer',
  "Everyone's": "Everyone's",
  'Favorite JNTo DEX': 'Favorite JNTo DEX',
  'Trade JNToken Instantly on BNB Chain': 'Trade JNToken Instantly on BNB Chain',
  'BNB Chain': 'BNB Chain',
  'Select from token on swap page': 'Select from token on swap page',
  'Amount to swap': 'Amount to swap',
  'Switch from and to tokens': 'Switch from and to tokens',
  'Select to token on swap page': 'Select to token on swap page',
  'Get Started': 'Get Started',
  'Estimated from live pool prices · final amount on swap page':
    'Estimated from live pool prices · final amount on swap page',
  'Connect your wallet on the swap page to trade': 'Connect your wallet on the swap page to trade',
  'Trade JNTo with BNB, stablecoins, and more on BNB Chain':
    'Trade JNTo with BNB, stablecoins, and more on BNB Chain',
  'Swap JNTo': 'Swap JNTo',
  'Trade BNB, stablecoins, and more into JNToken with optimized routing.':
    'Trade BNB, stablecoins, and more into JNToken with optimized routing.',
  'Farm & Earn': 'Farm & Earn',
  'Stake LP tokens and harvest JNTo rewards across Optimus farms.':
    'Stake LP tokens and harvest JNTo rewards across Optimus farms.',
  'Provide BNB–JNTo liquidity and earn fees from every swap.':
    'Provide BNB–JNTo liquidity and earn fees from every swap.',
  'Explore Optimus': 'Explore Optimus',
  'Optimus Swap — Trade JNTo on BNB Chain': 'Optimus Swap — Trade JNTo on BNB Chain',
  'Swap, farm, and earn with JNToken (JNTo) on Optimus Swap — the home of JNTo on BNB Smart Chain.':
    'Swap, farm, and earn with JNToken (JNTo) on Optimus Swap — the home of JNTo on BNB Smart Chain.',
  'Scroll to features': 'Scroll to features',
  '24h Change': '24h Change',
  '24h High': '24h High',
  '24h Low': '24h Low',
  'Select tokens to view the chart': 'Select tokens to view the chart',
  'Reference chart for %pair% (TradingView)': 'Reference chart for %pair% (TradingView)',
  'No data here': 'No data here',
  'Binance pricing': 'Binance pricing',
  'Get JNTo': 'Get JNTo',
}

const LOCALE_OVERRIDES = {
  'ja-JP': {
    'METAKEY SWAP': 'METAKEY SWAP',
    'Telegram announcements': 'Telegramお知らせ',
    Email: 'メール',
    'Switch to light mode': 'ライトモードに切り替え',
    'Switch to dark mode': 'ダークモードに切り替え',
    Language: '言語',
    'JNTo price (USD)': 'JNTo価格（USD）',
    'JNTo price: $%price%': 'JNTo価格: $%price%',
    'JNTo price and buy': 'JNTo価格と購入',
    Launch: 'ローンチ',
    'Main navigation': 'メインナビゲーション',
    'Native token': 'ネイティブトークン',
    'JNTo powers Optimus.': 'JNToがOptimusを支えます。',
    'JNToken — the core asset behind swaps, farms, and rewards on Optimus Swap.':
      'JNToken — Optimus Swapのスワップ、ファーム、報酬の中核資産です。',
    'Swap into JNTo instantly.': 'JNToへ即座にスワップ。',
    'Pair BNB or stablecoins with JNTo — deep routes, minimal friction.':
      'BNBやステーブルコインとJNToをペア — 深いルート、低スリッページ。',
    'Trade JNTo': 'JNToを取引',
    'Stake JNTo. Harvest more.': 'JNToをステーク。より多く収穫。',
    'Farm and pool your JNTo to compound yields across the ecosystem.':
      'JNToをファーム・プールしてエコシステム全体で利回りを複利運用。',
    'Stake JNTo': 'JNToをステーク',
    'JNTo promotion': 'JNToプロモーション',
    'Dismiss promotion': 'プロモーションを閉じる',
    'Show promotion %index%': 'プロモーション %index% を表示',
    'Flip chart pair': 'チャートペアを反転',
    'Charting by TradingView': 'TradingView提供のチャート',
    Candles: 'ローソク足',
    fx: 'fx',
    'Price chart': '価格チャート',
    'Close chart': 'チャートを閉じる',
    'Toggle price direction': '価格表示の向きを切り替え',
    'Show chart': 'チャートを表示',
    'Hide chart': 'チャートを非表示',
    Wrap: 'ラップ',
    Unwrap: 'アンラップ',
    'Unsupported Assets': '非対応資産',
    'Scroll to footer': 'フッターへスクロール',
    "Everyone's": 'みんなの',
    'Favorite JNTo DEX': 'お気に入りのJNTo DEX',
    'Trade JNToken Instantly on BNB Chain': 'BNBチェーンでJNTokenを即座に取引',
    'BNB Chain': 'BNBチェーン',
    'Select from token on swap page': 'スワップページで送金トークンを選択',
    'Amount to swap': 'スワップ数量',
    'Switch from and to tokens': '送金・受取トークンを入れ替え',
    'Select to token on swap page': 'スワップページで受取トークンを選択',
    'Get Started': '始める',
    'Estimated from live pool prices · final amount on swap page':
      'ライブプール価格からの推定 · 最終数量はスワップページで確認',
    'Connect your wallet on the swap page to trade': '取引するにはスワップページでウォレットを接続してください',
    'Trade JNTo with BNB, stablecoins, and more on BNB Chain':
      'BNBチェーンでBNB、ステーブルコインなどとJNToを取引',
    'Swap JNTo': 'JNToをスワップ',
    'Trade BNB, stablecoins, and more into JNToken with optimized routing.':
      '最適ルーティングでBNB、ステーブルコインなどをJNTokenに取引。',
    'Farm & Earn': 'ファーム＆収益',
    'Stake LP tokens and harvest JNTo rewards across Optimus farms.':
      'LPトークンをステークし、OptimusファームでJNTo報酬を収穫。',
    'Provide BNB–JNTo liquidity and earn fees from every swap.':
      'BNB–JNTo流動性を提供し、各スワップの手数料を獲得。',
    'Explore Optimus': 'Optimusを探索',
    'Optimus Swap — Trade JNTo on BNB Chain': 'Optimus Swap — BNBチェーンでJNToを取引',
    'Swap, farm, and earn with JNToken (JNTo) on Optimus Swap — the home of JNTo on BNB Smart Chain.':
      'Optimus SwapでJNToken（JNTo）をスワップ、ファーム、収益獲得 — BNB Smart Chain上のJNToのホーム。',
    'Scroll to features': '機能へスクロール',
    '24h Change': '24時間変動',
    '24h High': '24時間高値',
    '24h Low': '24時間安値',
    'Select tokens to view the chart': 'チャートを表示するトークンを選択',
    'Reference chart for %pair% (TradingView)': '%pair%の参考チャート（TradingView）',
    'No data here': 'データがありません',
    'Binance pricing': 'Binance価格',
    'Get JNTo': 'JNToを入手',
  },
  'zh-CN': {
    'Switch to light mode': '切换到浅色模式',
    'Switch to dark mode': '切换到深色模式',
    Language: '语言',
    'Flip chart pair': '翻转图表交易对',
    'Show chart': '显示图表',
    'Hide chart': '隐藏图表',
    'Get Started': '开始使用',
    '24h Change': '24小时涨跌',
    '24h High': '24小时最高',
    '24h Low': '24小时最低',
    'No data here': '暂无数据',
  },
  'zh-TW': {
    'Switch to light mode': '切換至淺色模式',
    'Switch to dark mode': '切換至深色模式',
    Language: '語言',
    'Flip chart pair': '翻轉圖表交易對',
    'Show chart': '顯示圖表',
    'Hide chart': '隱藏圖表',
    'Get Started': '開始使用',
    '24h Change': '24小時漲跌',
    '24h High': '24小時最高',
    '24h Low': '24小時最低',
    'No data here': '暫無資料',
  },
  'ko-KR': {
    'Switch to light mode': '라이트 모드로 전환',
    'Switch to dark mode': '다크 모드로 전환',
    Language: '언어',
    'Flip chart pair': '차트 페어 반전',
    'Show chart': '차트 표시',
    'Hide chart': '차트 숨기기',
    'Get Started': '시작하기',
    '24h Change': '24시간 변동',
    '24h High': '24시간 최고',
    '24h Low': '24시간 최저',
    'No data here': '데이터 없음',
  },
}

function mergeKeys(target, keys, overrides = {}) {
  const next = { ...target }
  Object.entries(keys).forEach(([key, en]) => {
    if (next[key] === undefined) {
      next[key] = overrides[key] ?? en
    }
  })
  return next
}

function main() {
  const translations = JSON.parse(fs.readFileSync(TRANSLATIONS_PATH, 'utf8'))
  const mergedTranslations = mergeKeys(translations, NEW_KEYS)
  fs.writeFileSync(TRANSLATIONS_PATH, `${JSON.stringify(mergedTranslations, null, 2)}\n`)

  const localeFiles = fs.readdirSync(LOCALES_DIR).filter((f) => f.endsWith('.json'))
  localeFiles.forEach((file) => {
    const locale = file.replace('.json', '')
    const filePath = path.join(LOCALES_DIR, file)
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    const overrides = LOCALE_OVERRIDES[locale] ?? {}
    const merged = mergeKeys(data, NEW_KEYS, overrides)
    fs.writeFileSync(filePath, `${JSON.stringify(merged, null, 2)}\n`)
  })

  console.log(`Updated translations.json and ${localeFiles.length} locale files.`)
}

main()
