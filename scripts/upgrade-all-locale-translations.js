/**
 * Apply full UI key translations from scripts/data/ui-key-translations.json
 * to all public/locales/*.json files (overwrites English fallbacks).
 *
 * Run: node scripts/upgrade-all-locale-translations.js
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const LOCALES_DIR = path.join(ROOT, 'public/locales')
const TRANSLATIONS_PATH = path.join(__dirname, 'data/ui-key-translations.json')

const ENGLISH_LOCALES = new Set(['en-US', 'en-AU'])

function main() {
  const byLocale = JSON.parse(fs.readFileSync(TRANSLATIONS_PATH, 'utf8'))
  const localeFiles = fs.readdirSync(LOCALES_DIR).filter((f) => f.endsWith('.json'))

  let updatedFiles = 0
  let updatedKeys = 0

  localeFiles.forEach((file) => {
    const locale = file.replace('.json', '')
    const filePath = path.join(LOCALES_DIR, file)
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    const overrides = byLocale[locale]

    if (!overrides && !ENGLISH_LOCALES.has(locale)) {
      console.warn(`No translations for locale: ${locale}`)
      return
    }

    let fileChanged = false

    if (overrides) {
      Object.entries(overrides).forEach(([key, value]) => {
        if (data[key] !== value) {
          data[key] = value
          updatedKeys += 1
          fileChanged = true
        }
      })
    }

    if (fileChanged) {
      fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`)
      updatedFiles += 1
    }
  })

  console.log(`Updated ${updatedFiles} locale files (${updatedKeys} key values changed).`)
}

main()
