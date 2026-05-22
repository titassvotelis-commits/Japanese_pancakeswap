const fs = require('fs')
const path = require('path')

function replaceMkInContent(content) {
  return content.replace(/'([^'\\]|\\.)*'|"([^"\\]|\\.)*"|`([^`\\]|\\.)*`/g, (lit) => {
    if (!lit.includes('MK')) return lit
    return lit.replace(/\$MK/g, '$JNTo').replace(/MK/g, 'JNTo')
  })
}

const transPath = path.join(__dirname, '../src/config/localization/translations.json')
let trans = fs.readFileSync(transPath, 'utf8')
trans = trans.replace(/MK/g, 'JNTo')
fs.writeFileSync(transPath, trans)

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules') continue
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p, files)
    else if (/\.tsx?$/.test(ent.name)) files.push(p)
  }
  return files
}

let count = 0
for (const f of walk(path.join(__dirname, '../src'))) {
  const orig = fs.readFileSync(f, 'utf8')
  const next = replaceMkInContent(orig)
  if (next !== orig) {
    fs.writeFileSync(f, next)
    count += 1
  }
}

for (const rel of ['src/config/constants/meta.ts']) {
  const f = path.join(__dirname, '..', rel)
  if (!fs.existsSync(f)) continue
  const orig = fs.readFileSync(f, 'utf8')
  const next = orig.replace(/MK/g, 'JNTo')
  if (next !== orig) fs.writeFileSync(f, next)
}

console.log(`Updated ${count} source files + translations.json`)
